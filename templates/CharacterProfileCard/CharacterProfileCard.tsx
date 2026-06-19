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

// CharacterProfileCard, a Pinterest-style social-profile card that introduces a
// person by their workplace role. A single centred white card carries a top
// portrait, the role + verified tick, a short bio, a row of countable stats,
// and a Follow pill. Rebuilt on the STANDARD reveal-sequence timing model.
//
//   • setup    , the white card itself pops in with overshoot + squash & stretch
//                (scaleX briefly exceeds scaleY at the overshoot peak, then both
//                settle to 1:1). This is the scaffolding/frame brought on screen,
//                so the stage is never static (no dead air). Content reveals only
//                when later steps schedule them.
//   • portrait , the portrait inside the card scales 0.92 -> 1.0, settling into
//                its frame.
//   • name     , the workplace-title row slides up 32 px while fading in.
//   • badge    , the verified badge pops in with a back-overshoot tap beside the
//                name (only rendered when `verified` is true).
//   • bio      , the bio slides up + fades in.
//   • stat0..N , the stats row reveals item-by-item, one indexed object per cue.
//   • follow   , the Follow button bounces in (scale 0 -> 1.12 -> 1.0 with a
//                half-cycle squash modulation, like a button pressed + rebounding).
//
// Reveal order is strictly reading order down the card: setup -> portrait ->
// name -> badge -> bio -> stat0 -> stat1 (-> stat2) -> follow. Fixed single card
// instance; the only count variation is the number of stats (1-3).

// ─── Schema ──────────────────────────────────────────────────────────────────

// One countable stat in the bottom row, e.g. followers, posts, projects. The
// icon shape is chosen from a small fixed set so each stat reads at a glance.
const statSchema = z.object({
  // Which glyph to draw beside the value (fixed inline icon set, no library).
  icon:  z.enum(['followers', 'posts', 'likes']),
  // The number to display (non-negative int; formatted with thousands commas).
  value: z.number().int().nonnegative(),
});
export type CharacterProfileStat = z.infer<typeof statSchema>;

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (the
// soft cool-grey stage with nothing on it). Each step is one "object". All
// times are scene-relative SECONDS.
//
// Addressable targets (FIXED named slots + ONE indexed family for the stats):
//   setup        the white card pops in (scaffolding/frame, the staging beat)
//   portrait     the portrait settles into the card frame
//   name         the workplace-title row slides up
//   badge        the verified badge pops in (only if `verified`)
//   bio          the bio slides up + fades in
//   stat0..statN-1  one stat (icon + value) revealed as a single object; N is
//                stats.length (1-3). A stat{i} with i >= N is ignored.
//   follow       the Follow button bounces in
export const revealStepSchema = z.object({
  target: z
    .string()
    .regex(/^(setup|portrait|name|badge|bio|follow|stat[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.5), // entrance duration
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed object is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a content object (not setup). See
// README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z
    .string()
    .regex(/^(portrait|name|badge|bio|follow|stat[0-9]+)$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const characterProfileCardTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const characterProfileCardSchema = z.object({
  // Character PNG id, resolves to characters/<id>.png. Use a consistently-
  // framed library presenter portrait.
  characterId: z.string().min(1),
  // Workplace title / role, bold dark, ≤30 chars so the verified badge sits
  // beside it (e.g. "Product Strategist", "Founder & CEO"). NOT a personal name.
  title:       z.string().min(1).max(30),
  // Shows a dodger-blue tick after the title when true. Default true.
  verified:    z.boolean().optional(),
  // Brief bio, medium grey, wraps to ~2 lines at ≤95 chars.
  bio:         z.string().min(1).max(95),
  // 1-3 countable stats (followers / posts / likes). The row auto-centres and
  // spaces for whatever count is supplied so 1, 2 or 3 all read cleanly.
  stats:       z.array(statSchema).min(1).max(3),
  // Accent colour, one of three brand colours only: dodger blue, wild
  // strawberry, or ocean green. Tints the portrait backing, the verified tick,
  // and the Follow button.
  accentColor: z.enum(['#0496FF', '#F865B0', '#3AB795']),
  timings:     characterProfileCardTimingSchema.optional(),
});

export type CharacterProfileCardProps = z.infer<
  typeof characterProfileCardSchema
>;

export const characterProfileCardMeta = {
  description:
    'A modern Pinterest-style social-profile card introducing a character: ' +
    'a centred white rounded card with a portrait on top, the workplace ' +
    'title + dodger-blue verified badge below, a short bio, a row of 1-3 ' +
    'countable stats (followers / posts / likes), and a Follow pill on the ' +
    'right. Use to introduce a course presenter, panellist, or any single ' +
    'character by their role.',
  authoringNotes:
    'characterId is a PNG ID in characters/<id>.png, use a consistently-' +
    'framed library presenter portrait. The portrait fills a fixed height, so ' +
    'size is uniform, just pick the id. title ≤30 chars, the character\'s ' +
    'workplace role (e.g. "Product Strategist", "Founder & CEO"), NOT their ' +
    'personal name. bio ≤95 chars (wraps to ~2 lines). stats is 1-3 entries, ' +
    'each { icon: followers|posts|likes, value: int }; large values format ' +
    'with commas and the row auto-centres for the count. accentColor is one of ' +
    'three brand colours only: #0496FF (dodger blue), #F865B0 (wild ' +
    'strawberry), or #3AB795 (ocean green), tints the portrait backing, the ' +
    'verified tick, and the Follow button. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every ' +
    'element appears only when a step in `timings.sequence` targets it. ' +
    'Targets are FIXED named slots plus one indexed family: setup, portrait, ' +
    'name, badge, bio, stat0..statN-1, follow. Each step is { target, at ' +
    '(seconds), in? (entrance duration, default 0.5) }. setup brings the white ' +
    'card on screen (the staging beat, never a blank stall); the rest reveal in ' +
    'reading order down the card. NARRATION MUST follow that reading order: ' +
    'introduce the role, then the bio, then the stats one at a time, then the ' +
    'call to follow, never describing an element before its reveal. Re-mention ' +
    'pulses (timings.pulses) give a brief brand pulse when an already-revealed ' +
    'object is named again. See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (1920×1080 canvas) ─────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;
const CANVAS_CX = CANVAS_W / 2;
const CANVAS_CY = CANVAS_H / 2;

// Card, vertical phone-card proportion. Centred on canvas.
const CARD_W = 640;
const CARD_H = 1000;
const CARD_LEFT = CANVAS_CX - CARD_W / 2;            // 640
const CARD_TOP  = CANVAS_CY - CARD_H / 2;            // 40
const CARD_PAD  = 30;
const CARD_RADIUS = 40;

// Portrait area inside the card.
const PORTRAIT_W = CARD_W - 2 * CARD_PAD;            // 580
const PORTRAIT_H = 620;
const PORTRAIT_LEFT = CARD_PAD;                      // local to card
const PORTRAIT_TOP  = CARD_PAD;                      // local to card
const PORTRAIT_RADIUS = 28;

// Vertical layout below portrait (in card-local coords).
const NAME_Y       = PORTRAIT_TOP + PORTRAIT_H + 32; // 30 + 620 + 32 = 682
const BIO_Y        = NAME_Y + 70;                    // 752
const BOTTOM_ROW_Y = CARD_H - CARD_PAD - 56;         // 30 from bottom; 56 tall
const BOTTOM_ROW_H = 56;

// Stats row, auto-laid-out for 1-3 stats. Each stat is an icon + a value; the
// stats are left-anchored in a horizontal band and spaced by a fixed pitch so
// the Follow button (pinned right) always has room. The pitch is chosen so up
// to 3 stats sit clear of the button.
const STAT_PITCH   = 140;                            // gap between stat columns
const STAT_GAP     = 8;                              // icon -> value gap

// Follow button (right side of the bottom row).
const FOLLOW_W = 150;
const FOLLOW_H = 56;
const FOLLOW_LEFT = CARD_W - CARD_PAD - FOLLOW_W;    // pinned right

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutCubic       = Easing.out(Easing.cubic);
const easeOutBackCard    = Easing.out(Easing.back(1.8));
const easeOutBackBadge   = Easing.out(Easing.back(2.4));
const easeOutBackButton  = Easing.out(Easing.back(2.6));

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

const CANVAS_BG     = '#EDEFF3';                     // soft cool-grey backdrop
const CARD_BG       = '#FFFFFF';                     // crisp white card
const DARK_TEXT     = '#0A0F18';
const MUTED_TEXT    = '#6B7280';
const ICON_GREY     = '#9CA3AF';
const VERIFIED_FG   = '#FFFFFF';

const CARD_SHADOW =
  '0 30px 60px rgba(15, 25, 45, 0.10), ' +
  '0 10px 25px rgba(15, 25, 45, 0.06)';
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
  // Twitter/Instagram-style serrated badge in the accent colour, with a centred
  // white tick. Tick is sized so its visual centre sits at the badge's centre.
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

function HeartIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20 C12 20 3.5 14.5 3.5 8.8 C3.5 6 5.7 4 8.2 4 C9.9 4 11.3 5 12 6.3 C12.7 5 14.1 4 15.8 4 C18.3 4 20.5 6 20.5 8.8 C20.5 14.5 12 20 12 20 Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
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

// Maps a stat icon id to its inline glyph component.
function StatGlyph({
  icon, size, color,
}: { icon: CharacterProfileStat['icon']; size: number; color: string }) {
  if (icon === 'posts') return <GridIcon size={size} color={color} />;
  if (icon === 'likes') return <HeartIcon size={size} color={color} />;
  return <PersonIcon size={size} color={color} />;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCount = (n: number) => n.toLocaleString('en-US');

// Slide-up + fade-in helper. Returns { translateY, opacity } given a local
// frame and duration, with an offset travel in pixels.
function slideUp(localFrame: number, dur: number, travel = 32) {
  const p = clamp01(localFrame / dur);
  const eased = easeOutCubic(p);
  return {
    translateY: (1 - eased) * travel,
    opacity:    eased,
  };
}

// ─── Stat (one bottom-row stat, an indexed reveal object) ────────────────────
// Driven by a single reveal step {at, in}: the stat slides up + fades in, then
// holds. A re-mention pulse composes into its own outer transform around its
// centre. frame < startF -> absent.

function Stat({
  frame,
  i,
  stat,
  startF,
  durF,
  pulseFrames,
}: {
  frame: number;
  i: number;
  stat: CharacterProfileStat;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  if (frame < startF) return null;

  const anim  = slideUp(frame - startF, durF, 20);
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const left  = CARD_PAD + i * STAT_PITCH;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top:  0,
        height: BOTTOM_ROW_H,
        display: 'flex',
        alignItems: 'center',
        gap: STAT_GAP,
        // Pulse scales the stat about its own centre; the reveal slide composes
        // into the same transform (translate first, then the pulse scale).
        transform: `translateY(${anim.translateY}px) scale(${pulse})`,
        transformOrigin: '50% 50%',
        opacity: anim.opacity,
      }}
    >
      <StatGlyph icon={stat.icon} size={stat.icon === 'posts' ? 24 : 26} color={ICON_GREY} />
      <span
        style={{
          color: DARK_TEXT,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '-0.01em',
        }}
      >
        {formatCount(stat.value)}
      </span>
    </div>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const CharacterProfileCard: React.FC<CharacterProfileCardProps> = ({
  characterId,
  title,
  verified = true,
  bio,
  stats,
  accentColor,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() =>
    delayRender('Loading CharacterProfileCard fonts'),
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

  // Re-mention pulse frames per target (from timings.pulses).
  const pulseFramesFor = (target: string): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === target)
      .map((p) => f(p.at));

  // Resolve each fixed target's step once.
  const cSetup    = cue('setup');
  const cPortrait = cue('portrait');
  const cName     = cue('name');
  const cBadge    = cue('badge');
  const cBio      = cue('bio');
  const cFollow   = cue('follow');

  // ── setup: card pop-in with squash & stretch (the staging beat) ──
  // easeOutBack carries the overshoot. We add a sine-driven asymmetric squash
  // that's only active during the overshoot phase (when the base scale is past
  // 1.0), so during the bounce-up the card briefly stretches horizontally and
  // squashes vertically, then settles to 1:1.
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupDurF   = cSetup ? f(durOf(cSetup)) : 0;
  const cardProg    = cSetup ? clamp01((frame - setupStartF) / setupDurF) : 0;
  const cardBase    = easeOutBackCard(cardProg);
  const overshoot   = Math.max(0, cardBase - 1) / 0.15;        // 0-1 during overshoot
  const stretch     = clamp01(overshoot) * 0.06;               // up to ±6%
  const cardScaleX  = cardBase * (1 + stretch);
  const cardScaleY  = cardBase * (1 - stretch);
  const cardOpacity = easeOutCubic(cardProg);
  // setup is scaffolding, not a content object, so the card carries no pulse.

  // ── portrait reveal (settles into its slot) ──
  const portraitStartF = cPortrait ? f(cPortrait.at) : 0;
  const portraitDurF   = cPortrait ? f(durOf(cPortrait)) : 1;
  const portraitProg   = cPortrait
    ? clamp01((frame - portraitStartF) / portraitDurF)
    : 0;
  const portraitScale   = interpolate(easeOutCubic(portraitProg), [0, 1], [0.92, 1]);
  const portraitOpacity = easeOutCubic(portraitProg);
  const portraitPulse   = pulseScale(frame, pulseFramesFor('portrait'), f(PULSE_DUR_S));

  // ── text reveals ──
  const nameAnim  = cName ? slideUp(frame - f(cName.at), f(durOf(cName)), 32) : null;
  const namePulse = pulseScale(frame, pulseFramesFor('name'), f(PULSE_DUR_S));
  const bioAnim   = cBio ? slideUp(frame - f(cBio.at), f(durOf(cBio)), 28) : null;
  const bioPulse  = pulseScale(frame, pulseFramesFor('bio'), f(PULSE_DUR_S));

  // ── verified badge pop-in ──
  const badgeStartF  = cBadge ? f(cBadge.at) : 0;
  const badgeDurF    = cBadge ? f(durOf(cBadge)) : 1;
  const badgeProg    = cBadge ? clamp01((frame - badgeStartF) / badgeDurF) : 0;
  const badgeScale   = easeOutBackBadge(badgeProg);
  const badgeOpacity = easeOutCubic(badgeProg);
  const badgePulse   = pulseScale(frame, pulseFramesFor('badge'), f(PULSE_DUR_S));

  // ── Follow button bounce with squash modulation ──
  // Same pattern as the card: easeOutBack drives the scale, plus a half-sine
  // squash that fires during the overshoot peak so the button feels tactile.
  const followStartF    = cFollow ? f(cFollow.at) : 0;
  const followDurF      = cFollow ? f(durOf(cFollow)) : 1;
  const followProg      = cFollow ? clamp01((frame - followStartF) / followDurF) : 0;
  const followBase      = easeOutBackButton(followProg);
  const followOvershoot = Math.max(0, followBase - 1) / 0.18;
  const followStretch   = clamp01(followOvershoot) * 0.08;
  const followPulse     = pulseScale(frame, pulseFramesFor('follow'), f(PULSE_DUR_S));
  const followScaleX    = followBase * (1 + followStretch) * followPulse;
  const followScaleY    = followBase * (1 - followStretch) * followPulse;
  const followOpacity   = easeOutCubic(followProg);

  return (
    <AbsoluteFill style={{ background: CANVAS_BG, overflow: 'hidden' }}>
      {/* setup, the white card pops in (scaffolding/frame). The card only
          renders once setup is scheduled; its content is gated separately. */}
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
            transform: `scale(${cardScaleX}, ${cardScaleY})`,
            transformOrigin: '50% 50%',
            opacity: cardOpacity,
            overflow: 'hidden',
          }}
        >
          {/* portrait, gated on its own reveal step */}
          {cPortrait && (
            <div
              style={{
                position: 'absolute',
                left: PORTRAIT_LEFT,
                top:  PORTRAIT_TOP,
                width:  PORTRAIT_W,
                height: PORTRAIT_H,
                borderRadius: PORTRAIT_RADIUS,
                background: accentColor,
                overflow: 'hidden',
                transform: `scale(${portraitScale * portraitPulse})`,
                transformOrigin: '50% 100%',
                opacity: portraitOpacity,
              }}
            >
              <Img
                src={staticFile(`characters/${characterId}.png`)}
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width:  '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  filter:
                    'drop-shadow(0 18px 24px rgba(2, 18, 36, 0.45)) ' +
                    'drop-shadow(0 4px 8px rgba(2, 18, 36, 0.35))',
                }}
              />
            </div>
          )}

          {/* name, the workplace-title row (+ badge), gated on its reveal step.
              The badge is a separate object gated on its own `badge` step. */}
          {cName && (
            <div
              style={{
                position: 'absolute',
                left: CARD_PAD,
                top:  NAME_Y,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transform:
                  `translateY(${nameAnim!.translateY}px) scale(${namePulse})`,
                transformOrigin: '0% 50%',
                opacity: nameAnim!.opacity,
              }}
            >
              <span
                style={{
                  color: DARK_TEXT,
                  fontFamily: "'Satoshi', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 42,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {title}
              </span>
              {verified && cBadge && (
                <div
                  style={{
                    transform: `scale(${badgeScale * badgePulse})`,
                    transformOrigin: '50% 50%',
                    opacity: badgeOpacity,
                    display: 'flex',
                  }}
                >
                  <VerifiedBadge size={32} fill={accentColor} />
                </div>
              )}
            </div>
          )}

          {/* bio, gated on its reveal step */}
          {cBio && (
            <div
              style={{
                position: 'absolute',
                left: CARD_PAD,
                top:  BIO_Y,
                width:  CARD_W - 2 * CARD_PAD,
                color: MUTED_TEXT,
                fontFamily: "'Satoshi', system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 24,
                lineHeight: 1.35,
                letterSpacing: '-0.005em',
                transform:
                  `translateY(${bioAnim!.translateY}px) scale(${bioPulse})`,
                transformOrigin: '0% 50%',
                opacity: bioAnim!.opacity,
              }}
            >
              {bio}
            </div>
          )}

          {/* bottom row, stats (indexed objects) + Follow button (named slot) */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top:  BOTTOM_ROW_Y,
              width:  CARD_W,
              height: BOTTOM_ROW_H,
            }}
          >
            {/* stat0..statN-1, each gated and timed by its own stat{i} step */}
            {stats.map((stat, i) => {
              const c = cue(`stat${i}`);
              return c ? (
                <Stat
                  key={`stat-${i}`}
                  frame={frame}
                  i={i}
                  stat={stat}
                  startF={f(c.at)}
                  durF={f(durOf(c))}
                  pulseFrames={pulseFramesFor(`stat${i}`)}
                />
              ) : null;
            })}

            {/* Follow button, gated on its reveal step */}
            {cFollow && (
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
                  gap: 6,
                  transform: `scale(${followScaleX}, ${followScaleY})`,
                  transformOrigin: '50% 50%',
                  opacity: followOpacity,
                }}
              >
                <span
                  style={{
                    color: '#FFFFFF',
                    fontFamily: "'Satoshi', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Follow
                </span>
                <PlusIcon size={20} color="#FFFFFF" />
              </div>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const characterProfileCardDefaultProps: CharacterProfileCardProps = {
  characterId: 'male_middleage_white',
  title: 'Product Strategist',
  verified: true,
  bio: 'Helping early-stage teams ship faster, sharper, and with confidence.',
  stats: [
    { icon: 'followers', value: 1248 },
    { icon: 'posts',     value: 86 },
  ],
  accentColor: '#0496FF',   // dodger blue
  timings: {
    sequence: [
      { target: 'setup',    at: 0.2, in: 0.65 },
      { target: 'portrait', at: 0.9, in: 0.65 },
      { target: 'name',     at: 1.6, in: 0.50 },
      { target: 'badge',    at: 2.0, in: 0.40 },
      { target: 'bio',      at: 2.5, in: 0.45 },
      { target: 'stat0',    at: 3.2, in: 0.40 },
      { target: 'stat1',    at: 3.6, in: 0.40 },
      { target: 'follow',   at: 4.2, in: 0.50 },
    ],
    pulses: [],
  },
};
