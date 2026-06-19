import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { z } from 'zod';

// CharacterTrioCards, two-to-three Pinterest-style profile cards side-by-side,
// each in its own accent colour, rebuilt on the STANDARD reveal-sequence timing
// model. Introduces a team trio (panellists, instructors, perspectives) by
// workplace role.
//
//   • setup    , the empty card scaffolding rises in. The rounded white card
//                shells (one per card) fade + scale in from the centre as a
//                single non-content reveal, so the stage is never blank while
//                the first card is being introduced. The shells are fixed
//                scaffolding, no portraits, text or buttons yet.
//   • card{i}  , one character card revealed as ONE unit: its portrait settles,
//                then the title, verified badge, bio, follower/post stats and
//                Follow button cascade in, all inside the object's own reveal
//                window. Cards reveal one at a time, LEFT to RIGHT.
//
// Per-character rendering is controlled by explicit `characterHeight` and
// `characterY` pixel values rather than scale transforms. This decouples
// "how big does the head appear" from "where does the head sit in the
// portrait", so all heads match across cards while always showing head +
// shoulders + chest framing. Character size + position are FIXED for every
// card (CHARACTER_HEIGHT / CHARACTER_Y), authors just pick the id.

// ─── Schema ──────────────────────────────────────────────────────────────────

const cardSchema = z.object({
  // Character PNG id, resolves to characters/<id>.png. Size + position are
  // FIXED for every card (CHARACTER_HEIGHT / CHARACTER_Y) so all heads match,
  // no per-card tuning. Use a consistently-framed presenter portrait from the
  // character library; do NOT use daniel.png or lena.png (framed differently).
  characterId:     z.string().min(1),
  // Workplace title (NOT a personal name), bold dark, ≤22 chars to fit.
  title:           z.string().min(1).max(22),
  verified:        z.boolean().optional(),
  bio:             z.string().min(1).max(80),
  followersCount:  z.number().int().nonnegative(),
  postsCount:      z.number().int().nonnegative(),
  // Accent colour, one of the three brand colours only: dodger blue,
  // wild strawberry, or ocean green. Tints the portrait panel, verified
  // tick, and Follow button.
  accentColor:     z.enum(['#0496FF', '#F865B0', '#3AB795']),
});

export type CharacterCardData = z.infer<typeof cardSchema>;

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage with nothing on it). Each step is one "object": a card
// step reveals its portrait + title + badge + bio + stats + Follow button as a
// single unit. All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup            the empty card shells rise in (scaffolding stage)
//   card0..cardN-1   one character card revealed as a single object: its
//                    portrait settles, then title/badge/bio/stats/Follow
//                    cascade. N is cards.length (2-3). A card{i} with i >= N is
//                    ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|card[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.4), // entrance duration (card pop + content cascade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed card is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a content card (card{i}); setup is
// not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^card[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const characterTrioCardsTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const characterTrioCardsSchema = z.object({
  // 2 to 3 character cards, left to right. The canonical layout is a trio (3);
  // 2 is supported and auto-centres so the pair reads cleanly.
  cards:   z.array(cardSchema).min(2).max(3),
  timings: characterTrioCardsTimingsSchema.optional(),
});

export type CharacterTrioCardsProps = z.infer<typeof characterTrioCardsSchema>;

export const characterTrioCardsMeta = {
  description:
    'Two-to-three Pinterest-style profile cards side-by-side, each in its own ' +
    'accent colour. The empty card shells rise in first, then each card reveals ' +
    'left-to-right one at a time (no overlapping): inside each card the portrait ' +
    'settles, then the title, verified badge, bio, stats and Follow button ' +
    'cascade in smoothly. Use to introduce a trio (or pair) of characters by ' +
    'workplace role.',
  authoringNotes:
    'Supply 2 or 3 cards (the canonical layout is a trio of 3; 2 auto-centres). ' +
    'Per-card: characterId (PNG in characters/<id>.png), use a consistently-framed ' +
    'presenter portrait from the character library; do NOT use daniel.png or ' +
    'lena.png (different framing/scale). Character size + position are FIXED for ' +
    'every card so all heads match, just pick the id, nothing to tune. title ' +
    '(≤22 chars, workplace role, NOT name). bio ≤80 chars (wraps onto the next ' +
    'line, kept inside the card). accentColor is one of three brand colours only: ' +
    '#0496FF (dodger blue), #F865B0 (wild strawberry), or #3AB795 (ocean green), ' +
    'it tints the portrait panel, the verified tick, and the Follow button. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (the empty card shells rise in) then one `card{i}` per card in ' +
    'order. Each card{i} reveals card i, portrait + title + badge + bio + stats + ' +
    'Follow, as one object cascade. Sync each card{i}.at to the narration cue ' +
    'that introduces that character; reveal order is inherently LINEAR ' +
    'left-to-right. A re-mentioned card gives a brief brand pulse via ' +
    'timings.pulses[{ target: card{i}, at }]. See GUIDANCE.md for full selection ' +
    'and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants ────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Card geometry. The card width, height, gaps and margins are fixed; the chain
// of cards auto-centres for the supplied count (2 or 3) so a pair sits in the
// middle rather than drifting left.
const CARD_W      = 580;
const CARD_H      = 920;
const CARD_TOP    = (CANVAS_H - CARD_H) / 2;   // 80
const CARD_GAP    = 30;
const CARD_PAD    = 28;
const CARD_RADIUS = 36;

// Left x of card i for a chain of n cards, centred on the canvas.
// Chain span = n*CARD_W + (n-1)*CARD_GAP.
function chainLeft(n: number): number {
  const chainW = n * CARD_W + (n - 1) * CARD_GAP;
  return (CANVAS_W - chainW) / 2;
}
function cardLeft(i: number, n: number): number {
  return chainLeft(n) + i * (CARD_W + CARD_GAP);
}

// Portrait area inside each card.
const PORTRAIT_W = CARD_W - 2 * CARD_PAD;      // 524
const PORTRAIT_H = 520;
const PORTRAIT_RADIUS = 24;

// Fixed character framing for EVERY card, not authorable, so all heads match.
// Use consistently-framed library presenter portraits (NOT daniel/lena).
const CHARACTER_HEIGHT = 760;
const CHARACTER_Y      = -10;

// Bottom row + Follow button.
const BOTTOM_ROW_Y = CARD_H - CARD_PAD - 48;
const BOTTOM_ROW_H = 48;
const FOLLOW_W = 132;
const FOLLOW_H = 48;
const FOLLOW_LEFT = CARD_W - CARD_PAD - FOLLOW_W;

// Vertical start of the title + bio text column (card-local). The bio flows
// below the title, so its position follows the title's height automatically.
const TITLE_Y = CARD_PAD + PORTRAIT_H + 24;

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Internal cascade proportions, expressed as fractions of a card{i} step's `in`
// window so the compound prototype flourishes survive the collapse to one
// {at, in} per object. The card pops over the first part, then the portrait,
// title, badge, bio, stats and Follow button cascade within the remainder.
const CARD_IN_FRAC      = 0.42;  // card pop occupies the first ~42% of the window
const PORTRAIT_IN_FRAC  = 0.35;  // portrait settles over the first ~35%
const TITLE_OFF_FRAC    = 0.21;  const TITLE_DUR_FRAC  = 0.35;
const BADGE_OFF_FRAC    = 0.32;  const BADGE_DUR_FRAC  = 0.28;
const BIO_OFF_FRAC      = 0.39;  const BIO_DUR_FRAC    = 0.32;
const STATS_OFF_FRAC    = 0.60;  const STATS_DUR_FRAC  = 0.32;
const STATS_STAGGER_FRAC = 0.06;
const FOLLOW_OFF_FRAC   = 0.85;  const FOLLOW_DUR_FRAC = 0.39;

// All easings are smooth-tail. easeOutBack uses a tiny back constant so
// the overshoot is just a hint, never enough to push neighbouring cards
// into each other.
const easeOutCubic       = Easing.out(Easing.cubic);
const easeOutBackCard    = Easing.out(Easing.back(1.25));
const easeOutBackBadge   = Easing.out(Easing.back(1.8));
const easeOutBackButton  = Easing.out(Easing.back(2.0));
const easeInOutCubic     = Easing.inOut(Easing.cubic);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ─── Re-mention pulse (brand: brief + subtle) ────────────────────────────────
// A revealed object that is named again later gives a quick scale pulse at the
// re-mention. Brand values: ~0.45 s, +5 % peak, smooth up-and-down (half-sine).
const PULSE_DUR_S = 0.45;
const PULSE_AMP   = 0.05;
// Scale multiplier at `frame` given the pulse frames; 1 at rest, up to
// 1 + PULSE_AMP at a pulse peak. Overlapping pulses take the max.
function pulseScale(frame: number, pulseFrames: number[], durF: number): number {
  let s = 1;
  for (const pf of pulseFrames) {
    const local = frame - pf;
    if (local >= 0 && local <= durF) {
      s = Math.max(s, 1 + PULSE_AMP * Math.sin((local / durF) * Math.PI));
    }
  }
  return s;
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const CANVAS_BG  = '#EDEFF3';
const CARD_BG    = '#FFFFFF';
const DARK_TEXT  = '#0A0F18';
const MUTED_TEXT = '#6B7280';
const ICON_GREY  = '#9CA3AF';
const VERIFIED_FG = '#FFFFFF';

const CARD_SHADOW =
  '0 24px 50px rgba(15, 25, 45, 0.10), ' +
  '0 8px 18px rgba(15, 25, 45, 0.06)';
const BUTTON_SHADOW =
  '0 6px 14px rgba(15, 25, 45, 0.08), ' +
  '0 2px 4px rgba(15, 25, 45, 0.06)';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold = new FontFace(
      'Satoshi',
      `url(${SATOSHI_BOLD_SRC}) format('woff2')`,
      { weight: '700', display: 'block' },
    );
    const medium = new FontFace(
      'Satoshi',
      `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`,
      { weight: '500', display: 'block' },
    );
    const [b, m] = await Promise.all([bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

// ─── Inline glyphs ───────────────────────────────────────────────────────────

function VerifiedBadge({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path
        d="M16 1 L19.2 3.3 L23.2 2.8 L24.5 6.5 L28 8.3 L26.9 12.2 L28.5 16 L26 19.1 L26.5 23 L22.8 24.4 L20.8 27.8 L17 26.7 L13 27.8 L11 24.4 L7.3 23 L7.8 19.1 L5.3 16 L6.9 12.2 L5.8 8.3 L9.3 6.5 L10.6 2.8 L14.6 3.3 Z"
        fill={fill}
      />
      <path
        d="M11.5 16 L14.7 19 L20.5 13"
        stroke={VERIFIED_FG}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function PersonIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <path
        d="M4 21 C4 16.5 7.5 13.5 12 13.5 C16.5 13.5 20 16.5 20 21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function GridIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x={4} y={4} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <rect x={13} y={4} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <rect x={4} y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <rect x={13} y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
    </svg>
  );
}

function PlusIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5 V19 M5 12 H19"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCount = (n: number) => n.toLocaleString('en-US');

function slideUp(localFrame: number, dur: number, travel = 24) {
  const p = clamp01(localFrame / dur);
  const eased = easeOutCubic(p);
  return {
    translateY: (1 - eased) * travel,
    opacity:    eased,
  };
}

// ─── Empty card shell (setup scaffolding, one per card) ──────────────────────
// Rises in during the `setup` step: the rounded white card shell fades + scales
// in from its own centre. No portrait, text or buttons, pure scaffolding so the
// stage is never blank while the first character is introduced.

function CardShell({
  leftX,
  frame,
  startF,
  durF,
}: {
  leftX: number;
  frame: number;
  startF: number;
  durF: number;
}) {
  const local = frame - startF;
  if (local < 0) return null;
  const prog = clamp01(local / durF);
  const scale = interpolate(easeInOutCubic(prog), [0, 1], [0.94, 1]);
  const opacity = easeOutCubic(prog);
  return (
    <div
      style={{
        position: 'absolute',
        left: leftX,
        top:  CARD_TOP,
        width:  CARD_W,
        height: CARD_H,
        borderRadius: CARD_RADIUS,
        background: CARD_BG,
        boxShadow:  CARD_SHADOW,
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
        opacity,
      }}
    />
  );
}

// ─── Single card (one content object) ────────────────────────────────────────
// Gated on its card{i} reveal step. Driven by a single {at, in} window: the
// card pops in (subtle overshoot, no asymmetric squash so the bounce can't push
// a card into its neighbour), then the portrait settles and the title, badge,
// bio, stats and Follow button cascade, all inside the object's own window.
// frame < startF -> absent.

function Card({
  card,
  leftX,
  frame,
  startF,
  durF,
  pulseFrames,
}: {
  card: CharacterCardData;
  leftX: number;
  frame: number;
  startF: number;
  durF: number;   // total card entrance; content cascades within it
  pulseFrames: number[];
}) {
  const cardLocal = frame - startF;
  if (cardLocal < 0) return null;

  // Internal cascade windows, as frame offsets/durations within `durF`.
  const cardDurF      = durF * CARD_IN_FRAC;
  const portraitDurF  = durF * PORTRAIT_IN_FRAC;
  const titleOffF     = durF * TITLE_OFF_FRAC;   const titleDurF  = durF * TITLE_DUR_FRAC;
  const badgeOffF     = durF * BADGE_OFF_FRAC;   const badgeDurF  = durF * BADGE_DUR_FRAC;
  const bioOffF       = durF * BIO_OFF_FRAC;     const bioDurF    = durF * BIO_DUR_FRAC;
  const statsOffF     = durF * STATS_OFF_FRAC;   const statsDurF  = durF * STATS_DUR_FRAC;
  const statsStagF    = durF * STATS_STAGGER_FRAC;
  const followOffF    = durF * FOLLOW_OFF_FRAC;  const followDurF = durF * FOLLOW_DUR_FRAC;

  // ── Card pop, subtle overshoot, NO asymmetric squash/stretch ──
  const cardProg    = clamp01(cardLocal / cardDurF);
  const cardScale   = easeOutBackCard(cardProg);
  const cardOpacity = easeOutCubic(cardProg);

  // Re-mention pulse, multiplied into the card's OUTER transform around its own
  // centre, so the bump composes with (never replaces) the entrance scale.
  // 1 outside pulse windows -> the entrance is untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // ── Portrait settle ──
  const portraitProg    = clamp01(cardLocal / portraitDurF);
  const portraitScale   = interpolate(easeOutCubic(portraitProg), [0, 1], [0.96, 1]);
  const portraitOpacity = easeOutCubic(portraitProg);

  // ── Text / badge / stats / button reveals ──
  const titleAnim = slideUp(cardLocal - titleOffF, titleDurF, 22);
  const bioAnim   = slideUp(cardLocal - bioOffF,   bioDurF,   20);

  const badgeProg    = clamp01((cardLocal - badgeOffF) / badgeDurF);
  const badgeScale   = easeOutBackBadge(badgeProg);
  const badgeOpacity = easeOutCubic(badgeProg);

  const stat1 = slideUp(cardLocal - statsOffF,                  statsDurF, 16);
  const stat2 = slideUp(cardLocal - (statsOffF + statsStagF),   statsDurF, 16);

  const followProg    = clamp01((cardLocal - followOffF) / followDurF);
  const followScale   = easeOutBackButton(followProg);
  const followOpacity = easeOutCubic(followProg);

  return (
    <div
      style={{
        position: 'absolute',
        left: leftX,
        top:  CARD_TOP,
        width:  CARD_W,
        height: CARD_H,
        borderRadius: CARD_RADIUS,
        background: CARD_BG,
        boxShadow:  CARD_SHADOW,
        // Outer transform composes the entrance pop with the re-mention pulse.
        transform: `scale(${cardScale * pulse})`,
        transformOrigin: '50% 50%',
        opacity: cardOpacity,
        overflow: 'hidden',
      }}
    >
      {/* PORTRAIT, fixed-size clipped box with the character image sized
          explicitly so head sizes can be equalised across cards. */}
      <div
        style={{
          position: 'absolute',
          left: CARD_PAD,
          top:  CARD_PAD,
          width:  PORTRAIT_W,
          height: PORTRAIT_H,
          borderRadius: PORTRAIT_RADIUS,
          background: card.accentColor,
          overflow: 'hidden',
          transform: `scale(${portraitScale})`,
          transformOrigin: '50% 100%',
          opacity: portraitOpacity,
        }}
      >
        <Img
          src={staticFile(`characters/${card.characterId}.png`)}
          alt=""
          style={{
            position: 'absolute',
            left: '50%',
            top:  CHARACTER_Y,
            height: CHARACTER_HEIGHT,
            width: 'auto',
            transform: 'translateX(-50%)',
            // Drop shadow follows the cut-out's alpha so the figure casts
            // a real silhouette shadow against the accent backing.
            filter:
              'drop-shadow(0 16px 22px rgba(2, 18, 36, 0.40)) ' +
              'drop-shadow(0 4px 8px rgba(2, 18, 36, 0.30))',
          }}
        />
      </div>

      {/* TITLE + BIO, a flowing column. Long text wraps onto the next line and
          the bio is pushed down (no fixed-position overlap). The card's
          overflow:hidden is the final guard against spilling onto the canvas. */}
      <div
        style={{
          position: 'absolute',
          left: CARD_PAD,
          top:  TITLE_Y,
          width: CARD_W - 2 * CARD_PAD,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* TITLE ROW */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            transform: `translateY(${titleAnim.translateY}px)`,
            opacity: titleAnim.opacity,
          }}
        >
          <span
            style={{
              color: DARK_TEXT,
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}
          >
            {card.title}
          </span>
          {card.verified !== false && (
            <div
              style={{
                transform: `scale(${badgeScale})`,
                transformOrigin: '50% 50%',
                opacity: badgeOpacity,
                display: 'flex',
              }}
            >
              <VerifiedBadge size={26} fill={card.accentColor} />
            </div>
          )}
        </div>

        {/* BIO */}
        <div
          style={{
            width: '100%',
            color: MUTED_TEXT,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 20,
            lineHeight: 1.35,
            letterSpacing: '-0.005em',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            transform: `translateY(${bioAnim.translateY}px)`,
            opacity: bioAnim.opacity,
          }}
        >
          {card.bio}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top:  BOTTOM_ROW_Y,
          width:  CARD_W,
          height: BOTTOM_ROW_H,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: CARD_PAD,
            top:  0,
            height: BOTTOM_ROW_H,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            transform: `translateY(${stat1.translateY}px)`,
            opacity: stat1.opacity,
          }}
        >
          <PersonIcon size={22} color={ICON_GREY} />
          <span
            style={{
              color: DARK_TEXT,
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '-0.01em',
            }}
          >
            {formatCount(card.followersCount)}
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: CARD_PAD + 120,
            top:  0,
            height: BOTTOM_ROW_H,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            transform: `translateY(${stat2.translateY}px)`,
            opacity: stat2.opacity,
          }}
        >
          <GridIcon size={20} color={ICON_GREY} />
          <span
            style={{
              color: DARK_TEXT,
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '-0.01em',
            }}
          >
            {formatCount(card.postsCount)}
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            left: FOLLOW_LEFT,
            top:  0,
            width:  FOLLOW_W,
            height: FOLLOW_H,
            borderRadius: FOLLOW_H / 2,
            // Filled with the card's accent colour to match the verified tick.
            background: card.accentColor,
            border: 'none',
            boxShadow: BUTTON_SHADOW,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            transform: `scale(${followScale})`,
            transformOrigin: '50% 50%',
            opacity: followOpacity,
          }}
        >
          <span
            style={{
              color: '#FFFFFF',
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: '-0.01em',
            }}
          >
            Follow
          </span>
          <PlusIcon size={18} color="#FFFFFF" />
        </div>
      </div>
    </div>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const CharacterTrioCards: React.FC<CharacterTrioCardsProps> = ({
  cards,
  timings,
}) => {
  const frame = useCurrentFrame();
  const n = cards.length;

  const [handle] = useState(() =>
    delayRender('Loading CharacterTrioCards fonts'),
  );
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent
  // (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
  );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 1.4);

  // Re-mention pulse frames per card{i} (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `card${i}`)
      .map((p) => f(p.at));

  // setup, the empty card shells rise in across the setup window.
  const cSetup = cue('setup');

  return (
    <AbsoluteFill style={{ background: CANVAS_BG, overflow: 'hidden' }}>
      {/* setup, empty card shells (scaffolding) rise in, only when scheduled. */}
      {cSetup &&
        cards.map((_, i) => (
          <CardShell
            key={`shell-${i}`}
            leftX={cardLeft(i, n)}
            frame={frame}
            startF={f(cSetup.at)}
            durF={f(durOf(cSetup))}
          />
        ))}

      {/* card{i}, each character card revealed as one object, gated on its
          card{i} reveal step. The filled card draws over its empty shell. */}
      {cards.map((card, i) => {
        const c = cue(`card${i}`);
        return c ? (
          <Card
            key={`card-${i}`}
            card={card}
            leftX={cardLeft(i, n)}
            frame={frame}
            startF={f(c.at)}
            durF={f(durOf(c))}
            pulseFrames={pulseFramesFor(i)}
          />
        ) : null;
      })}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const characterTrioCardsDefaultProps: CharacterTrioCardsProps = {
  // Library presenter portraits only (NOT daniel/lena). Size + position are
  // fixed for every card, so just pick an id, no per-card tuning.
  cards: [
    {
      characterId:    'male_middleage_white',
      title:          'Product Strategist',
      verified:       true,
      bio:            'Helping early-stage teams ship faster and sharper.',
      followersCount: 1248,
      postsCount:     86,
      accentColor:    '#0496FF',   // dodger blue
    },
    {
      characterId:    'female_earlycareer_black',
      title:          'Head of Design',
      verified:       true,
      bio:            'Building product systems people actually love to use.',
      followersCount: 982,
      postsCount:     54,
      accentColor:    '#F865B0',   // wild strawberry
    },
    {
      characterId:    'male_middleage_black',
      title:          'Engineering Lead',
      verified:       true,
      bio:            'Shipping reliable, well-tested code without the drama.',
      followersCount: 1567,
      postsCount:     128,
      accentColor:    '#3AB795',   // ocean green
    },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 1.0 },
      { target: 'card0', at: 1.2 },
      { target: 'card1', at: 3.0 },
      { target: 'card2', at: 4.8 },
    ],
  },
};
