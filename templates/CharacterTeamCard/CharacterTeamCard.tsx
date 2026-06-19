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

// CharacterTeamCard, ONE wider Pinterest-style profile card that introduces a
// TEAM of characters, revealed ONE AT A TIME (reading order, left -> right),
// rebuilt on the STANDARD reveal-sequence timing model.
//   • setup     , the card frame stages in (pops in with a back overshoot) along
//                  with the empty portrait panel and the whole text chrome that
//                  describes the team as a unit: title + verified badge + bio +
//                  the follower/post stats + the Follow button. This is fixed,
//                  non-content scaffolding, it carries no per-member content.
//   • member0..memberN-1 , the team members, one character per evenly-spaced
//                  slot inside the portrait panel. Each member is a single
//                  object: its portrait scales up from its feet into its slot
//                  ("steps into place"). They reveal one at a time in reading
//                  order so the team assembles as the narration names each one.
//
// Layout auto-adapts to the member count (2-6): the portrait panel is divided
// into N equal slots filling its width, every character sized identically
// (fixed framing per slot), so any count reads as one balanced team portrait.

// ─── Schema ──────────────────────────────────────────────────────────────────

const memberSchema = z.object({
  // Character PNG id only (resolves to characters/<id>.png). Size + position are
  // FIXED per slot (every member sized identically by CHARACTER_HEIGHT) so the
  // team reads as one portrait, just pick ids. Use consistently-framed library
  // presenter portraits (NOT daniel/lena).
  characterId: z.string().min(1),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum background). Each step is one "object". All times are
// scene-relative SECONDS.
//
// Addressable targets:
//   setup              the card frame + portrait panel + the team's text chrome
//                      (title, verified badge, bio, stats, Follow) stage in as
//                      one piece of scaffolding (Phase 2).
//   member0..memberN-1 one team member revealed as a single object: its portrait
//                      scales up into its slot. N is members.length (2-6). A
//                      member{i} with i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|member[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.6), // entrance duration
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed member is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a content member (member{i});
// setup is not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^member[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const characterTeamCardTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const characterTeamCardSchema = z.object({
  // The team, 2 to 6 members revealed one at a time in reading order. Each is
  // just a characterId; size + position are fixed per slot.
  members: z.array(memberSchema).min(2).max(6),
  // Team title (e.g. "Product Team"). ≤24 chars so the verified badge fits.
  title:    z.string().min(1).max(24),
  verified: z.boolean().optional(),
  // Short blurb about the team, ≤95 chars, wraps to ~2 lines.
  bio:      z.string().min(1).max(95),
  followersCount: z.number().int().nonnegative(),
  postsCount:     z.number().int().nonnegative(),
  // Single accent colour for the whole card, one of three brand colours only:
  // dodger blue, wild strawberry, or ocean green. Tints the portrait BG, the
  // verified tick, and the Follow button.
  accentColor:    z.enum(['#0496FF', '#F865B0', '#3AB795']),
  timings:        characterTeamCardTimingsSchema.optional(),
});

export type CharacterTeamCardProps = z.infer<typeof characterTeamCardSchema>;
export type CharacterMemberData = z.infer<typeof memberSchema>;

export const characterTeamCardMeta = {
  description:
    'A single wider profile card that introduces a TEAM of 2-6 characters, ' +
    'revealed one at a time in reading order into evenly-spaced portrait slots. ' +
    'Use to introduce a team unit, Product Team, Design Squad, Founding Crew. ' +
    'The card frame and the team text chrome stage in first, then each member ' +
    'steps into place as the narration names them.',
  authoringNotes:
    'Supply members as 2 to 6 entries in reading (left -> right) order, each ' +
    'just a characterId (PNG in characters/<id>.png). Use consistently-framed ' +
    'library presenter portraits; do NOT use daniel.png or lena.png. The portrait ' +
    'panel auto-divides into N equal slots filling its width and every member is ' +
    'sized identically (fixed framing per slot), so 2, 3, 4, 5 or 6 all read as ' +
    'one balanced team portrait, just pick ids. title ≤24 chars (e.g. "Product ' +
    'Team"). bio ≤95 chars (wraps onto the next line, kept inside the card). ' +
    'accentColor is one of three brand colours only: #0496FF (dodger blue), ' +
    '#F865B0 (wild strawberry), or #3AB795 (ocean green), tints the portrait BG, ' +
    'the verified tick, and the Follow button. ' +
    'TIMING (reveal-sequence model): nothing shows by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (the card frame + portrait panel + title/badge/bio/stats/Follow ' +
    'chrome stage in as one scaffolding reveal) then one `member{i}` per team ' +
    'member in reading order. Each member{i} reveals that character stepping into ' +
    'its slot as one object; sync each member{i}.at to the narration cue that ' +
    'introduces that person. The team is inherently LINEAR (one at a time) so ' +
    'reveal order = reading order. Re-mention pulses (timings.pulses) bump a ' +
    'member when it is named again. See GUIDANCE.md for full selection and ' +
    'narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (1920×1080 canvas) ─────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Single wide card centred horizontally and vertically.
const CARD_W      = 1320;
const CARD_H      = 920;
const CARD_LEFT   = (CANVAS_W - CARD_W) / 2;     // 300
const CARD_TOP    = (CANVAS_H - CARD_H) / 2;     // 80
const CARD_PAD    = 30;
const CARD_RADIUS = 36;

// Portrait area inside the card.
const PORTRAIT_W = CARD_W - 2 * CARD_PAD;        // 1260
const PORTRAIT_H = 600;
const PORTRAIT_RADIUS = 24;

// Fixed character framing for EVERY slot (NOT authorable) so all members come
// out the same size. Sized for consistently-framed library presenter portraits.
const CHARACTER_HEIGHT = 640;
const CHARACTER_Y      = 0;

// Slot geometry derives from the member count: the portrait area is divided
// into N equal slots filling its width, so the team always reads centred and
// balanced no matter how many members (2-6).
function slotWidth(n: number): number {
  return PORTRAIT_W / n;
}
function slotLeft(i: number, n: number): number {
  return i * slotWidth(n);
}
function slotCenterX(i: number, n: number): number {
  return slotLeft(i, n) + slotWidth(n) / 2;
}

// Vertical positions of title + bio + bottom row (card-local).
const TITLE_Y      = CARD_PAD + PORTRAIT_H + 26;  // 656
const BIO_Y        = TITLE_Y + 56;                // 712 (informational; bio flows in a column)
const BOTTOM_ROW_Y = CARD_H - CARD_PAD - 48;      // 842
const BOTTOM_ROW_H = 48;

const FOLLOW_W = 132;
const FOLLOW_H = 48;
const FOLLOW_LEFT = CARD_W - CARD_PAD - FOLLOW_W;

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutCubic        = Easing.out(Easing.cubic);
const easeOutBackCard     = Easing.out(Easing.back(1.25));
const easeOutBackBadge     = Easing.out(Easing.back(1.8));
const easeOutBackButton    = Easing.out(Easing.back(2.0));
const easeOutBackMember    = Easing.out(Easing.back(1.4));

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
  '0 30px 60px rgba(15, 25, 45, 0.12), ' +
  '0 10px 24px rgba(15, 25, 45, 0.07)';
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
      <rect x={4}  y={4}  width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <rect x={13} y={4}  width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <rect x={4}  y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
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

// ─── Team member (one character revealed into its slot) ──────────────────────
// Gated on its member{i} reveal step. The portrait scales up from its feet into
// its slot ("steps into place"); a re-mention pulse composes on top of the
// entrance scale around the slot's centre. frame < startF -> absent.

function TeamMember({
  member,
  i,
  n,
  frame,
  startF,
  durF,
  accentColor,
  pulseFrames,
}: {
  member: CharacterMemberData;
  i: number;
  n: number;
  frame: number;
  startF: number;
  durF: number;
  accentColor: string;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const slotW = slotWidth(n);
  const slotX = slotLeft(i, n);

  const prog = clamp01(local / durF);
  // Step into place, scale up from the feet with a small back overshoot.
  const enterScale = interpolate(easeOutBackMember(prog), [0, 1], [0.9, 1]);
  const opacity    = easeOutCubic(prog);

  // Re-mention pulse, multiplied into the member's outer transform around the
  // slot centre; 1 outside pulse windows so the entrance is untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        left: slotX,
        top:  0,
        width:  slotW,
        height: PORTRAIT_H,
        overflow: 'hidden',
        opacity,
        // Outer transform: reveal scale * pulse, both around the slot's own
        // centre (50% 100% = feet centre) so the bump composes with, never
        // replaces, the entrance.
        transform: `scale(${enterScale * pulse})`,
        transformOrigin: '50% 100%',
      }}
    >
      {/* Tinted slot backdrop so each character sits on the accent panel even
          before its neighbours arrive (the shared panel is part of setup). */}
      <div style={{ position: 'absolute', inset: 0, background: accentColor }} />
      <Img
        src={staticFile(`characters/${member.characterId}.png`)}
        alt=""
        style={{
          position: 'absolute',
          left: '50%',
          top:  CHARACTER_Y,
          height: CHARACTER_HEIGHT,
          width: 'auto',
          transform: 'translateX(-50%)',
          filter:
            'drop-shadow(0 16px 22px rgba(2, 18, 36, 0.40)) ' +
            'drop-shadow(0 4px 8px rgba(2, 18, 36, 0.30))',
        }}
      />
    </div>
  );
}

// ─── Card frame + team chrome (the setup scaffolding) ────────────────────────
// One scaffolding reveal: the card pops in (back overshoot), the empty portrait
// panel rises with it, and the team text chrome (title + badge + bio + stats +
// Follow) cascades in. Carries NO per-member content. frame < startF -> absent.

function CardFrame({
  frame,
  startF,
  durF,
  title,
  verified,
  bio,
  followersCount,
  postsCount,
  accentColor,
}: {
  frame: number;
  startF: number;
  durF: number;
  title: string;
  verified: boolean;
  bio: string;
  followersCount: number;
  postsCount: number;
  accentColor: string;
}) {
  const local = frame - startF;
  if (local < 0) return null;

  // Card pop occupies the whole window; the chrome cascades within it as
  // fractions of the window so the original beat survives one {at, in}.
  const cardProg    = clamp01(local / durF);
  const cardScale   = easeOutBackCard(cardProg);
  const cardOpacity = easeOutCubic(cardProg);

  // Chrome sub-stagger (fractions of the window).
  const titleStartF  = durF * 0.35;
  const badgeStartF  = durF * 0.50;
  const bioStartF    = durF * 0.55;
  const statsStartF  = durF * 0.70;
  const statsStagger = durF * 0.10;
  const followStartF = durF * 0.85;
  const chromeDurF   = durF * 0.55;

  const slideUp = (lf: number, dur: number, travel: number) => {
    const p = clamp01(lf / dur);
    const eased = easeOutCubic(p);
    return { translateY: (1 - eased) * travel, opacity: eased };
  };

  const titleAnim = slideUp(local - titleStartF, chromeDurF, 24);
  const bioAnim   = slideUp(local - bioStartF,   chromeDurF, 22);

  const badgeProg    = clamp01((local - badgeStartF) / chromeDurF);
  const badgeScale   = easeOutBackBadge(badgeProg);
  const badgeOpacity = easeOutCubic(badgeProg);

  const stat1 = slideUp(local - statsStartF,                 chromeDurF, 18);
  const stat2 = slideUp(local - (statsStartF + statsStagger), chromeDurF, 18);

  const followProg    = clamp01((local - followStartF) / chromeDurF);
  const followScale   = easeOutBackButton(followProg);
  const followOpacity = easeOutCubic(followProg);

  return (
    <div
      style={{
        position: 'absolute',
        left: CARD_LEFT,
        top:  CARD_TOP,
        width:  CARD_W,
        height: CARD_H,
        borderRadius: CARD_RADIUS,
        background: CARD_BG,
        boxShadow:  CARD_SHADOW,
        transform: `scale(${cardScale})`,
        transformOrigin: '50% 50%',
        opacity: cardOpacity,
        overflow: 'hidden',
      }}
    >
      {/* PORTRAIT PANEL, empty accent-tinted area that holds the members. The
          members reveal into this panel one at a time (their own steps). */}
      <div
        style={{
          position: 'absolute',
          left: CARD_PAD,
          top:  CARD_PAD,
          width:  PORTRAIT_W,
          height: PORTRAIT_H,
          borderRadius: PORTRAIT_RADIUS,
          background: accentColor,
          overflow: 'hidden',
        }}
      />

      {/* TITLE + BIO, flowing column. */}
      <div
        style={{
          position: 'absolute',
          left: CARD_PAD,
          top:  TITLE_Y,
          width: CARD_W - 2 * CARD_PAD,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* TITLE ROW */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            transform: `translateY(${titleAnim.translateY}px)`,
            opacity: titleAnim.opacity,
          }}
        >
          <span
            style={{
              color: DARK_TEXT,
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            }}
          >
            {title}
          </span>
          {verified && (
            <div
              style={{
                transform: `scale(${badgeScale})`,
                transformOrigin: '50% 50%',
                opacity: badgeOpacity,
                display: 'flex',
              }}
            >
              <VerifiedBadge size={30} fill={accentColor} />
            </div>
          )}
        </div>

        {/* BIO */}
        <div
          style={{
            width:  '100%',
            color: MUTED_TEXT,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 22,
            lineHeight: 1.35,
            letterSpacing: '-0.005em',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            transform: `translateY(${bioAnim.translateY}px)`,
            opacity: bioAnim.opacity,
          }}
        >
          {bio}
        </div>
      </div>

      {/* BOTTOM ROW, stats + Follow */}
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
          <PersonIcon size={24} color={ICON_GREY} />
          <span
            style={{
              color: DARK_TEXT,
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-0.01em',
            }}
          >
            {formatCount(followersCount)}
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: CARD_PAD + 140,
            top:  0,
            height: BOTTOM_ROW_H,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            transform: `translateY(${stat2.translateY}px)`,
            opacity: stat2.opacity,
          }}
        >
          <GridIcon size={22} color={ICON_GREY} />
          <span
            style={{
              color: DARK_TEXT,
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-0.01em',
            }}
          >
            {formatCount(postsCount)}
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
            background: accentColor,
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
              fontSize: 20,
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

export const CharacterTeamCard: React.FC<CharacterTeamCardProps> = ({
  members,
  title,
  verified = true,
  bio,
  followersCount,
  postsCount,
  accentColor,
  timings,
}) => {
  const frame = useCurrentFrame();
  const n = members.length;

  const [handle] = useState(() =>
    delayRender('Loading CharacterTeamCard fonts'),
  );
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent.
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
  );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.6);

  // Re-mention pulse frames per member{i} (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `member${i}`)
      .map((p) => f(p.at));

  const cSetup = cue('setup');

  return (
    <AbsoluteFill style={{ background: CANVAS_BG, overflow: 'hidden' }}>
      {/* Phase 2, the card frame + portrait panel + team text chrome stage in
          (only when setup is scheduled). */}
      {cSetup && (
        <CardFrame
          frame={frame}
          startF={f(cSetup.at)}
          durF={f(durOf(cSetup))}
          title={title}
          verified={verified}
          bio={bio}
          followersCount={followersCount}
          postsCount={postsCount}
          accentColor={accentColor}
        />
      )}

      {/* Phase 3, the team members, each gated on its member{i} reveal and
          positioned inside the (setup-staged) card's portrait panel. */}
      {cSetup &&
        members.map((member, i) => {
          const c = cue(`member${i}`);
          return c ? (
            <div
              key={`member-${i}`}
              style={{
                position: 'absolute',
                left: CARD_LEFT + CARD_PAD,
                top:  CARD_TOP + CARD_PAD,
                width:  PORTRAIT_W,
                height: PORTRAIT_H,
                borderRadius: PORTRAIT_RADIUS,
                overflow: 'hidden',
              }}
            >
              <TeamMember
                member={member}
                i={i}
                n={n}
                frame={frame}
                startF={f(c.at)}
                durF={f(durOf(c))}
                accentColor={accentColor}
                pulseFrames={pulseFramesFor(i)}
              />
            </div>
          ) : null;
        })}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const characterTeamCardDefaultProps: CharacterTeamCardProps = {
  // Library presenter portraits only (NOT daniel/lena). Size + position are
  // fixed per slot, so just pick ids in reading order.
  members: [
    { characterId: 'female_earlycareer_black' },
    { characterId: 'male_middleage_white' },
    { characterId: 'male_middleage_black' },
  ],
  title:    'Product Team',
  verified: true,
  bio:      'Three of us, shipping the product roadmap end-to-end every sprint.',
  followersCount: 3897,
  postsCount:     268,
  accentColor:    '#0496FF',   // dodger blue
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2, in: 1.0 },
      { target: 'member0', at: 1.4 },
      { target: 'member1', at: 2.3 },
      { target: 'member2', at: 3.2 },
    ],
  },
};
