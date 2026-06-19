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

// CharacterTeam6Card, ONE extra-wide Pinterest-style profile card holding a row
// of UP TO SIX characters, rebuilt on the STANDARD reveal-sequence timing model.
//
//   • setup    , the card shell pops in (scale 0.94 -> 1.0, easeOutBack) carrying
//                its empty portrait panel (accent fill) and the empty bottom
//                scaffolding row. This is the staging animation: a frame is
//                brought on screen before any team member or text is named, so
//                the scene never opens on dead air.
//   • member0  , the first portrait slot (its cropped character) plus that
//     ..memberN  character's light-grey title label, revealed as ONE unit. Each
//                member appears one at a time in reading order (left -> right).
//   • title    , the team name + (optional) verified tick.
//   • bio       , the supporting bio line under the title.
//   • stats    , the followers + posts counts in the bottom row.
//   • follow    , the accent-filled Follow button.
//
// Layout: a single white card centred on a platinum stage. The portrait panel
// splits into N equal shoulder-to-shoulder slots (N = characters.length, 2-6);
// the row auto-fills the panel for whatever count is supplied and every head is
// framed identically. Character size is fixed per slot so all faces match.

// ─── Schema ──────────────────────────────────────────────────────────────────

const slotSchema = z.object({
  // Character PNG id. Framing is FIXED for every slot (CHARACTER_HEIGHT /
  // CHARACTER_Y) so all heads come out the same size, no per-character tuning.
  // Use consistently-framed library presenter portraits (NOT daniel/lena).
  characterId:    z.string().min(1),
  // Per-character title (e.g. "Designer", "Engineer", "PM"). Rendered as subtle
  // light-grey text directly below each character's portrait slot. ≤18 chars to
  // fit the slot.
  characterTitle: z.string().min(1).max(18),
});

export type CharacterSlotData = z.infer<typeof slotSchema>;

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just the
// platinum stage). Each step is one "object". All times are scene-relative
// SECONDS.
//
// Addressable targets:
//   setup            the white card shell + empty portrait panel + bottom
//                    scaffolding row pop in (staging, no text)
//   member0..memberN-1
//                    one team member revealed as a single object: their cropped
//                    portrait slot + their per-character title label. N is
//                    characters.length (2-6). A member{i} with i >= N is ignored.
//   title            the team name + optional verified tick
//   bio              the supporting bio line
//   stats            the followers + posts counts (bottom row)
//   follow           the accent-filled Follow button
export const revealStepSchema = z.object({
  target: z
    .string()
    .regex(/^(setup|member[0-9]+|title|bio|stats|follow)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.5), // entrance duration
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed object is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). Targets are the CONTENT objects only (each
// member{i} plus title / bio / stats / follow); setup never pulses. See README
// "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z
    .string()
    .regex(/^(member[0-9]+|title|bio|stats|follow)$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const characterTeam6CardTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const characterTeam6CardSchema = z.object({
  // 2 to 6 team members, in reading (left -> right) order.
  characters: z.array(slotSchema).min(2).max(6),
  title:      z.string().min(1).max(24),
  verified:   z.boolean().optional(),
  bio:        z.string().min(1).max(95),
  followersCount: z.number().int().nonnegative(),
  postsCount:     z.number().int().nonnegative(),
  // Single accent colour, one of three brand colours only: dodger blue, wild
  // strawberry, or ocean green. Tints the portrait BG, verified tick, and
  // Follow button.
  accentColor:    z.enum(['#0496FF', '#F865B0', '#3AB795']),
  timings:        characterTeam6CardTimingsSchema.optional(),
});

export type CharacterTeam6CardProps = z.infer<typeof characterTeam6CardSchema>;

export const characterTeam6CardMeta = {
  description:
    'An extra-wide profile card with up to SIX characters in a single, evenly-' +
    'spaced row. Use to introduce a larger team, a squad, founding crew, or ' +
    'advisory board. The card shell stages in first, then each team member ' +
    'arrives one at a time in reading order, followed by the team name, bio, ' +
    'stats, and Follow button.',
  authoringNotes:
    'Supply 2 to 6 characters in reading (left -> right) order. Each is ' +
    '{ characterId (PNG in characters/<id>.png), characterTitle (≤18 chars) }. ' +
    'Use consistently-framed library presenter portraits; do NOT use daniel.png ' +
    'or lena.png. Character framing is FIXED per slot so all heads match, and ' +
    'the row auto-fills the portrait panel for whatever count you supply, so 2, ' +
    '3, 4, 5 or 6 all read cleanly. title ≤24 chars (e.g. "Founding Team"). bio ' +
    '≤95 chars (wraps, kept inside the card). accentColor is one of three brand ' +
    'colours only: #0496FF (dodger blue), #F865B0 (wild strawberry), or #3AB795 ' +
    '(ocean green), tints the portrait BG, the verified tick, and the Follow ' +
    'button. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (the card shell + empty portrait panel + bottom scaffolding ' +
    'stage in, the no-dead-air staging beat), then one `member{i}` per team ' +
    'member in reading order (each reveals that portrait slot + its title label ' +
    'as one object), then `title`, `bio`, `stats`, `follow`. Each step is ' +
    '{ target, at (seconds), in? (entrance duration, default 0.5) }. The reveal ' +
    'order is inherently LINEAR: members come left -> right, so reveal order = ' +
    'reading order. Re-mention pulses (`timings.pulses`) give a brief brand bump ' +
    'when an already-revealed member or block is named again. See GUIDANCE.md ' +
    'for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants ────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Extra-wide card to comfortably fit up to 6 characters in a row.
const CARD_W      = 1800;
const CARD_H      = 920;
const CARD_LEFT   = (CANVAS_W - CARD_W) / 2;     // 60
const CARD_TOP    = (CANVAS_H - CARD_H) / 2;     // 80
const CARD_PAD    = 30;
const CARD_RADIUS = 36;

// Portrait area inside the card.
const PORTRAIT_W = CARD_W - 2 * CARD_PAD;        // 1740
const PORTRAIT_H = 600;
const PORTRAIT_RADIUS = 24;

// Fixed character framing for EVERY slot, not authorable, so all heads match.
// Sized for consistently-framed library presenter portraits (NOT daniel/lena).
const CHARACTER_HEIGHT = 620;
const CHARACTER_Y      = 0;

// Per-character title row sits directly below the portrait, subtle, light-grey
// labels (one per character, centred on each slot).
const PER_CHAR_TITLE_Y = CARD_PAD + PORTRAIT_H + 14;  // 644
const PER_CHAR_TITLE_H = 28;

// Main title + bio shifted down to make room for the per-character labels.
const TITLE_Y      = PER_CHAR_TITLE_Y + PER_CHAR_TITLE_H + 22;  // 694
const BOTTOM_ROW_Y = CARD_H - CARD_PAD - 48;                    // 842
const BOTTOM_ROW_H = 48;

const FOLLOW_W = 132;
const FOLLOW_H = 48;
const FOLLOW_LEFT = CARD_W - CARD_PAD - FOLLOW_W;

// Auto-layout: the portrait panel splits into N equal slots that fill its full
// width shoulder-to-shoulder, so the row stays centred and balanced for any
// count in range. slotW shrinks as N grows; head framing stays fixed.
const slotWidth = (n: number) => PORTRAIT_W / n;

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutCubic       = Easing.out(Easing.cubic);
const easeOutBackCard    = Easing.out(Easing.back(1.25));
const easeOutBackBadge   = Easing.out(Easing.back(1.8));
const easeOutBackButton  = Easing.out(Easing.back(2.0));

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

// Slide-up + fade entrance driven by an object's own reveal window.
function slideUp(localFrame: number, dur: number, travel = 24) {
  const p = clamp01(localFrame / dur);
  const eased = easeOutCubic(p);
  return { translateY: (1 - eased) * travel, opacity: eased };
}

// ─── Team member (portrait slot + its title label, one revealed object) ──────
// Gated on its member{i} reveal step. The cropped portrait scales up from 0.94
// while it fades in, then the title label settles a touch after, all within the
// object's own `in` window. A re-mention pulse bumps the whole slot around its
// own centre, composing with the entrance (never replacing it).

function TeamMember({
  slot,
  slotX,
  slotW,
  frame,
  startF,
  durF,
  pulseFrames,
}: {
  slot:  CharacterSlotData;
  slotX: number;
  slotW: number;
  frame: number;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  // Portrait scales/fades over the first ~70% of the window; the title label
  // slides up over the back ~50% (internal sub-stagger, late label flourish).
  const portrait = slideUp(local, durF * 0.7, 0);
  const portraitScale = interpolate(local, [0, durF * 0.7], [0.94, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const titleAnim = slideUp(local - durF * 0.5, durF * 0.5, 14);

  // Re-mention pulse, multiplied into the slot's outer transform around its own
  // centre. 1 outside pulse windows so the entrance is untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const slotCX = slotX + slotW / 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${slotCX}px ${CARD_PAD + PORTRAIT_H / 2}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Cropped portrait, clipped to its slot inside the portrait panel */}
      <div
        style={{
          position: 'absolute',
          left: CARD_PAD + slotX,
          top:  CARD_PAD,
          width:  slotW,
          height: PORTRAIT_H,
          overflow: 'hidden',
          opacity: portrait.opacity,
          transform: `scale(${portraitScale})`,
          transformOrigin: '50% 100%',
        }}
      >
        <Img
          src={staticFile(`characters/${slot.characterId}.png`)}
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

      {/* Per-character title label, centred on the slot below the portrait */}
      <div
        style={{
          position: 'absolute',
          left: CARD_PAD + slotX,
          top:  PER_CHAR_TITLE_Y,
          width: slotW,
          height: PER_CHAR_TITLE_H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 18,
          color: ICON_GREY,
          letterSpacing: '0.02em',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          transform: `translateY(${titleAnim.translateY}px)`,
          opacity: titleAnim.opacity,
        }}
      >
        {slot.characterTitle}
      </div>
    </div>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const CharacterTeam6Card: React.FC<CharacterTeam6CardProps> = ({
  characters,
  title,
  verified = true,
  bio,
  followersCount,
  postsCount,
  accentColor,
  timings,
}) => {
  const frame = useCurrentFrame();
  const n = characters.length;
  const slotW = slotWidth(n);

  const [handle] = useState(() =>
    delayRender('Loading CharacterTeam6Card fonts'),
  );
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
  );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.5);

  // Re-mention pulse frames per content target (from timings.pulses).
  const pulseFramesFor = (target: string): number[] =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // setup, the card shell + empty portrait panel + bottom scaffolding pop in.
  const cSetup = cue('setup');
  const setupProg = cSetup
    ? clamp01((frame - f(cSetup.at)) / f(durOf(cSetup)))
    : 0;
  const cardScale   = easeOutBackCard(setupProg);
  const cardOpacity = easeOutCubic(setupProg);

  // Content blocks, each gated + timed by its own reveal step.
  const cTitle  = cue('title');
  const cBio    = cue('bio');
  const cStats  = cue('stats');
  const cFollow = cue('follow');

  const titleAnim = cTitle
    ? slideUp(frame - f(cTitle.at), f(durOf(cTitle)), 24)
    : { translateY: 24, opacity: 0 };
  const titlePulse = pulseScale(frame, pulseFramesFor('title'), f(PULSE_DUR_S));

  const badgeProg    = cTitle
    ? clamp01((frame - f(cTitle.at + durOf(cTitle) * 0.4)) / f(durOf(cTitle) * 0.6))
    : 0;
  const badgeScale   = easeOutBackBadge(badgeProg);
  const badgeOpacity = easeOutCubic(badgeProg);

  const bioAnim = cBio
    ? slideUp(frame - f(cBio.at), f(durOf(cBio)), 22)
    : { translateY: 22, opacity: 0 };
  const bioPulse = pulseScale(frame, pulseFramesFor('bio'), f(PULSE_DUR_S));

  // Stats, two counts with a slight internal stagger inside the stats window.
  const statsDur     = cStats ? durOf(cStats) : 0.5;
  const statsStagger = statsDur * 0.16;
  const stat1 = cStats
    ? slideUp(frame - f(cStats.at), f(statsDur), 18)
    : { translateY: 18, opacity: 0 };
  const stat2 = cStats
    ? slideUp(frame - f(cStats.at + statsStagger), f(statsDur), 18)
    : { translateY: 18, opacity: 0 };
  const statsPulse = pulseScale(frame, pulseFramesFor('stats'), f(PULSE_DUR_S));

  const followProg = cFollow
    ? clamp01((frame - f(cFollow.at)) / f(durOf(cFollow)))
    : 0;
  const followScale   = easeOutBackButton(followProg);
  const followOpacity = easeOutCubic(followProg);
  const followPulse = pulseScale(frame, pulseFramesFor('follow'), f(PULSE_DUR_S));

  return (
    <AbsoluteFill style={{ background: CANVAS_BG, overflow: 'hidden' }}>
      {/* setup, the white card shell + empty portrait panel + bottom scaffolding
          row pop in (staging, only when the sequence schedules it). */}
      {cSetup && (
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
          {/* Empty portrait panel (accent fill), scaffolding for the members */}
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

          {/* member{i}, each portrait slot + its title label, gated on its
              own reveal step. Rendered inside the card so the card clip keeps
              every head off the canvas background. */}
          {characters.map((slot, i) => {
            const c = cue(`member${i}`);
            return c ? (
              <TeamMember
                key={`member-${i}`}
                slot={slot}
                slotX={i * slotW}
                slotW={slotW}
                frame={frame}
                startF={f(c.at)}
                durF={f(durOf(c))}
                pulseFrames={pulseFramesFor(`member${i}`)}
              />
            ) : null;
          })}

          {/* title, team name + optional verified tick (one object) */}
          {cTitle && (
            <div
              style={{
                position: 'absolute',
                left: CARD_PAD,
                top:  TITLE_Y,
                width: CARD_W - 2 * CARD_PAD,
                transform: `scale(${titlePulse})`,
                transformOrigin: `${CARD_PAD}px ${TITLE_Y + 24}px`,
              }}
            >
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
            </div>
          )}

          {/* bio, supporting line under the title (one object) */}
          {cBio && (
            <div
              style={{
                position: 'absolute',
                left: CARD_PAD,
                top:  TITLE_Y + 56,
                width: CARD_W - 2 * CARD_PAD,
                transform: `scale(${bioPulse})`,
                transformOrigin: `${CARD_PAD}px ${TITLE_Y + 56}px`,
              }}
            >
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
          )}

          {/* stats, followers + posts counts (one object), and follow button */}
          {cStats && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top:  BOTTOM_ROW_Y,
                width:  CARD_W,
                height: BOTTOM_ROW_H,
                transform: `scale(${statsPulse})`,
                transformOrigin: `${CARD_PAD}px ${BOTTOM_ROW_Y + BOTTOM_ROW_H / 2}px`,
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
            </div>
          )}

          {/* follow, accent-filled Follow button (one object) */}
          {cFollow && (
            <div
              style={{
                position: 'absolute',
                left: FOLLOW_LEFT,
                top:  BOTTOM_ROW_Y,
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
                transform: `scale(${followScale * followPulse})`,
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
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const characterTeam6CardDefaultProps: CharacterTeam6CardProps = {
  // 6 library presenter portraits (NOT daniel/lena). Framing is fixed per slot,
  // so just pick ids + per-character titles.
  characters: [
    { characterId: 'male_middleage_white',     characterTitle: 'Product Lead' },
    { characterId: 'male_earlycareer_black',   characterTitle: 'Engineer' },
    { characterId: 'female_earlycareer_white', characterTitle: 'Designer' },
    { characterId: 'male_middleage_black',     characterTitle: 'Founder' },
    { characterId: 'female_midcareer_white',   characterTitle: 'Researcher' },
    { characterId: 'female_earlycareer_black', characterTitle: 'Operations' },
  ],
  title:    'Founding Team',
  verified: true,
  bio:      'Six of us, building the product, shipping the roadmap, owning the outcome.',
  followersCount: 8214,
  postsCount:     541,
  accentColor:    '#0496FF',   // dodger blue
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2, in: 0.6 },
      { target: 'member0', at: 1.0 },
      { target: 'member1', at: 1.6 },
      { target: 'member2', at: 2.2 },
      { target: 'member3', at: 2.8 },
      { target: 'member4', at: 3.4 },
      { target: 'member5', at: 4.0 },
      { target: 'title',   at: 4.8 },
      { target: 'bio',     at: 5.4 },
      { target: 'stats',   at: 6.0 },
      { target: 'follow',  at: 6.6 },
    ],
  },
};
