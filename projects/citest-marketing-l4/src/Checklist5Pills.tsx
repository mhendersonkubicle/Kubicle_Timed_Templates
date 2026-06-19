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

// Checklist5Pills, hero icon (or character panel) on the left + up to 6 dark
// pills with tick reveals on the right, on the reveal-sequence timing model.
//   • setup: the hero (icon at 520×520, or the dodger-blue character panel)
//     fades in on the left. This is the scene-establishing scaffolding reveal.
//     Unlike YinYang/Process there is NO empty-pill scaffold, pills do not
//     pre-exist as empty containers; each pill arrives only with its own
//     content object, so `setup` reveals only the hero.
//   • item{i}: one pill revealed as a SINGLE object. Within its `in` window the
//     reveal cascades: the pill fades up + slides 60 px from below, the white
//     circle slides left from the pill's right edge to its anchor, the tick
//     trim-reveals, then the responsibility text fades in.
//
// Hero icon (e.g. strategy.svg) renders with its native colours: Oxford Blue
// body + Dodger Blue accents (it sits on a light Platinum Blue background).

// ─── Schema ──────────────────────────────────────────────────────────────────

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum background). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup            the hero (icon or character panel) fades in (left-side
//                    scaffolding). NO empty-pill scaffold is shown.
//   item0..itemN-1   one checklist pill revealed as a single object: pill
//                    fades up -> circle slides left -> tick trim-reveals ->
//                    text fades in, all cascading inside the step's `in`
//                    window. N is responsibilities.length (1-6). An item{i}
//                    with i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|item[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.7), // entrance duration (pill cascade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed pill is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). `target` is an item{i} content slot (setup
// is excluded, the hero scaffold is not pulsed). See README "re-mention pulse".
export const pulseStepSchema = z.object({
  target: z.string().regex(/^item[0-9]+$/),
  at: z.number().nonnegative(),
});

export const checklist5PillsTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const checklist5PillsSchema = z.object({
  // 1 to 6 responsibility lines, ordered top → bottom. The pill band auto-
  // centres vertically for the count. Bold white at 37 px inside the pill,
  // ≤30 chars (clipped to the pill if longer, so keep it short).
  responsibilities: z.array(z.string().min(1).max(30)).min(1).max(6),
  // Hero icon ID (e.g. "strategy"). Resolved to icons/<id>.svg.
  hero: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('icon'),     id: z.string().min(1) }),
    z.object({ kind: z.literal('character'), id: z.string().min(1) }),
  ]),
  timings: checklist5PillsTimingSchema.optional(),
});

export type Checklist5PillsProps = z.infer<typeof checklist5PillsSchema>;

export const checklist5PillsMeta = {
  description:
    'Hero icon on the left + up to 6 dark-pill checklist items on the right. For ' +
    'each row in turn, a white circle slides from the pill\'s right edge to a left ' +
    'anchor, a tick trim-reveals, then the line of text fades in. Best for ' +
    'content that should read as items being ticked off, responsibilities, ' +
    'ownership lists, must-haves, compliance items, completed deliverables.',
  authoringNotes:
    'Supply 1 to 6 responsibilities, the pill band auto-centres vertically for ' +
    'the count (3 pills sit centred in the frame, etc.). Each is bold white at ' +
    '37 px inside a pill, 30-char max, single line, clipped to the pill so it ' +
    'never spills onto the background (keep it short / summarised). Aim for ' +
    'parallel imperative phrasing. GOOD: "Define project scope", "Lead daily ' +
    'stand-ups". BAD: "It\'s your responsibility to define project scope" (too long). ' +
    "hero is a discriminated union: { kind: 'icon', id } renders icons/<id>.svg " +
    "(520×520 line art on the left); { kind: 'character', id } renders " +
    'characters/<id>.png centred and scaled up to fill a dodger-blue gradient ' +
    'rounded panel on the left, matched to the pill height. ' +
    'TIMING (reveal-sequence model): nothing shows by default, schedule a ' +
    '`setup` step (the hero fades in; there is NO empty-pill scaffold) then one ' +
    '`item{i}` per responsibility in top-to-bottom order. Each item{i} reveals ' +
    'one pill as a single object, pill fade-up -> circle slide -> tick -> text ' +
    'all cascade inside its `in` window (default 1.7 s to preserve the slow ' +
    'tick-off cadence). Sync each item{i}.at to the narration cue that ticks off ' +
    'that item. NARRATION MUST be linear top-to-bottom: introduce each item in ' +
    'list order, one at a time, never naming a lower item before its pill ticks ' +
    'or jumping back up. See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const PILL_BASE_SRC   = staticFile('Template-Specific-Assets/Checklist5Pills/pill_base.png');
const PILL_CIRCLE_SRC = staticFile('Template-Specific-Assets/Checklist5Pills/pill_circle.png');
const TICK_SRC        = staticFile('Template-Specific-Assets/Checklist5Pills/tick.png');
const SATOSHI_BOLD_SRC = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants (lifted directly from the prototype) ────────────────────

// Pill_Base.png pill region.
const PILL_LEFT  = 845;
const PILL_RIGHT = 1738;
const PILL_TOP   = 217;

// Pill_Circle.png white circle region.
const CIRCLE_CX = 906;
const CIRCLE_R  = 45;

// Row layout, pills are ROW_PITCH apart; the band of `count` pills (1-6)
// auto-centres vertically on the canvas. PILL_HEIGHT is the pill's alpha-bbox
// height in pill_base.png (215..329 = 114).
const ROW_PITCH   = 142;
const PILL_HEIGHT = 114;
const CANVAS_CY   = 540;
// Top edge fed to the pill_base translate so the band is vertically centred for
// any count. (+2 reconciles PILL_TOP 217 vs the pill's actual alpha top 215.)
const firstPillTopFor = (count: number) =>
  CANVAS_CY - ((count - 1) * ROW_PITCH + PILL_HEIGHT) / 2 + (PILL_TOP - 215);
const rowOffsetY = (n: number, firstPillTop: number) =>
  (firstPillTop + n * ROW_PITCH) - PILL_TOP;

// Hero icon (left).
const HERO_SIZE = 520;
const HERO_CX   = 425;
const HERO_CY   = 540;

// Character hero, a dodger-blue gradient rounded rectangle on the left, a FIXED
// size centred vertically in the frame (does NOT follow the pill count), with
// the character centred horizontally and scaled up to FILL the panel
// (object-fit: cover), clipped to the rounded rect.
const CHAR_PANEL_W      = 560;
const CHAR_PANEL_HEIGHT = 682;
const CHAR_PANEL_TOP    = (1080 - CHAR_PANEL_HEIGHT) / 2;      // 199, centred
const CHAR_PANEL_LEFT   = HERO_CX - CHAR_PANEL_W / 2;          // 145
const CHAR_PANEL_RADIUS = 44;
const CHAR_PANEL_GRADIENT =
  'linear-gradient(160deg, #2AACFF 0%, #0496FF 55%, #0A78D0 100%)';

// Responsibility text. Width-capped so it stays INSIDE the pill (clipped with an
// ellipsis rather than spilling past the rounded end), keeps text contained.
const TEXT_LEFT = 985;
const TEXT_CY   = 273;
const TEXT_MAX_WIDTH = PILL_RIGHT - TEXT_LEFT - 56;   // 697

// Tick.png tick region.
const TICK_LEFT  = 884;
const TICK_WIDTH = 47;

// White circle parks 18 px inset from the pill's right edge before sliding.
const CIRCLE_RIGHT_INSET = 18;
const PILL_FADE_UP_PX    = 60;

// ─── Per-item cascade proportions ─────────────────────────────────────────────
// Each pill reveals as ONE object: the internal pill-up -> circle-slide -> tick
// -> text beats are now fixed PROPORTIONS of the step's `in` window (mirrors
// Process5Steps' icon/number/label cascade) rather than independent props. The
// reference cadence at the default in = 1.7 s reproduces the prototype timing:
//   pill fade-up   ~0.80 s   = 0.47 × in
//   circle slide   ~1.20 s   = 0.71 × in  (starts at step start)
//   tick trim      ~0.70 s   = 0.41 × in, beginning at 0.85 s = 0.50 × in
//   text fade      ~0.50 s   = 0.29 × in, beginning once the circle anchors
const PILL_FADE_DUR_FRAC = 0.47;
const CIRCLE_SLIDE_FRAC  = 0.71;
const TICK_START_FRAC    = 0.50;
const TICK_TRIM_FRAC     = 0.41;
const TEXT_START_FRAC    = 0.71;   // == circle slide end
const TEXT_FADE_FRAC     = 0.29;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeOutCubic = Easing.out(Easing.cubic);

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

// ─── Font loading ─────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`, {
      weight: '700',
      display: 'block',
    });
    const loaded = await bold.load();
    (document.fonts as FontFaceSet & { add(f: FontFace): void }).add(loaded);
  })();
  return fontsPromise;
}

// ─── Pill row ────────────────────────────────────────────────────────────────
// Gated by its item{i} reveal step. `startF` is the step start (frame); `durF`
// is the step's `in` window (frame). The four internal beats run as fixed
// fractions of durF so the whole pill reads as one tick-off object.

function PillRow({
  index,
  firstPillTop,
  frame,
  text,
  startF,
  durF,
  pulseFrames,
}: {
  index: number;
  firstPillTop: number;
  frame: number;
  text: string;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const oy = rowOffsetY(index, firstPillTop);

  // Re-mention pulse: a brief scale bump around this pill's own centre, only
  // after it has landed (pulseScale is 1 outside pulse windows, so an empty
  // pulses list leaves the reveal untouched). Composed on the outer wrapper.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const pillCX = (PILL_LEFT + PILL_RIGHT) / 2;
  // PRE-translate local centre (the wrapper's own translateY(oy) shifts it on
  // screen). Must NOT include `oy` or the scale pivot drifts and the pill hops
  // vertically during a pulse.
  const pillCY = PILL_TOP + PILL_HEIGHT / 2;

  // Internal cascade windows, all relative to the step start (local frame).
  const pillFadeDur  = durF * PILL_FADE_DUR_FRAC;
  const circleSlide  = durF * CIRCLE_SLIDE_FRAC;
  const tickStart    = durF * TICK_START_FRAC;
  const tickTrimDur  = durF * TICK_TRIM_FRAC;
  const textStart    = durF * TEXT_START_FRAC;
  const textFadeDur  = durF * TEXT_FADE_FRAC;

  // Pill fade-up from below.
  const fadeUpProg = interpolate(local, [0, pillFadeDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const pillTY      = (1 - fadeUpProg) * PILL_FADE_UP_PX;
  const pillOpacity = fadeUpProg;

  // Circle slide from right edge to left anchor.
  const startDx     = (PILL_RIGHT - CIRCLE_R - CIRCLE_RIGHT_INSET) - CIRCLE_CX;
  const slideProg   = interpolate(local, [0, circleSlide], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const currentDx   = startDx * (1 - slideProg);

  // Tick trim, reveal left → right.
  const tickProg    = interpolate(local, [tickStart, tickStart + tickTrimDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const tickRightInset    = (1 - tickProg) * TICK_WIDTH;
  const tickCanvasRightBg = 1920 - (TICK_LEFT + TICK_WIDTH);
  const tickShow = tickProg > 0;

  // Text, fades in once the circle has anchored.
  const textOp    = interpolate(local, [textStart, textStart + textFadeDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });

  const fullAssetStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top:  0,
    width:  1920,
    height: 1080,
    display: 'block',
    pointerEvents: 'none',
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top:  0,
        width:  1920,
        height: 1080,
        transform: `translateY(${oy}px) scale(${pulse})`,
        transformOrigin: `${pillCX}px ${pillCY}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Pill base, fades up from below */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateY(${pillTY}px)`,
          opacity: pillOpacity,
        }}
      >
        <Img src={PILL_BASE_SRC} alt="" style={fullAssetStyle} />
      </div>

      {/* White circle (+ tick), fades up with its pill, then slides left */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${currentDx}px, ${pillTY}px)`,
          opacity: pillOpacity,
        }}
      >
        <Img src={PILL_CIRCLE_SRC} alt="" style={fullAssetStyle} />
        {tickShow && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: `inset(0 ${tickCanvasRightBg + tickRightInset}px 0 ${TICK_LEFT}px)`,
            }}
          >
            <Img src={TICK_SRC} alt="" style={fullAssetStyle} />
          </div>
       )}
      </div>

      {/* Responsibility text, fades in as the circle anchors */}
      <div
        style={{
          position: 'absolute',
          left: TEXT_LEFT,
          top:  TEXT_CY,
          transform: 'translateY(-50%)',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 37,
          color: '#FFFFFF',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
          // Capped to the pill width and clipped with an ellipsis so a long line
          // never spills past the pill onto the background.
          maxWidth: TEXT_MAX_WIDTH,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          opacity: textOp,
          pointerEvents: 'none',
        }}
      >
        {text}
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const Checklist5Pills: React.FC<Checklist5PillsProps> = ({
  responsibilities,
  hero,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading Checklist5Pills fonts'));
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
  const durOf = (s: RevealStep) => (s.in ?? 1.7);

  // Setup, the hero fades in across its window.
  const cSetup = cue('setup');
  const heroOpacity = cSetup
    ? interpolate(frame, [f(cSetup.at), f(cSetup.at + durOf(cSetup))], [0, 1], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Re-mention pulse frames per pill (from timings.pulses), keyed by item slot.
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // Vertically centre the pill band for however many pills (1-6) were supplied.
  const firstPillTop = firstPillTopFor(responsibilities.length);

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* setup, hero fades in (icon OR character), only when scheduled */}
      {cSetup && (
        hero.kind === 'icon' ? (
          <div
            style={{
              position: 'absolute',
              left: HERO_CX - HERO_SIZE / 2,
              top:  HERO_CY - HERO_SIZE / 2,
              width:  HERO_SIZE,
              height: HERO_SIZE,
              opacity: heroOpacity,
              pointerEvents: 'none',
            }}
          >
            <Img
              src={staticFile(`icons/${hero.id}.svg`)}
              alt=""
              style={{ width: HERO_SIZE, height: HERO_SIZE, display: 'block' }}
            />
          </div>
       ) : (
          <div
            style={{
              position: 'absolute',
              left: CHAR_PANEL_LEFT,
              top:  CHAR_PANEL_TOP,
              width:  CHAR_PANEL_W,
              height: CHAR_PANEL_HEIGHT,
              borderRadius: CHAR_PANEL_RADIUS,
              background: CHAR_PANEL_GRADIENT,
              overflow: 'hidden',
              opacity: heroOpacity,
              pointerEvents: 'none',
            }}
          >
            <Img
              src={staticFile(`characters/${hero.id}.png`)}
              alt=""
              style={{
                // Centred horizontally and scaled up to fill the dodger panel;
                // object-position favours the head, clipped to the rounded rect.
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: '50% 18%',
                display: 'block',
                // Drop shadow lifts the figure off the dodger-blue gradient.
                filter:
                  'drop-shadow(0 16px 22px rgba(2, 18, 36, 0.40)) ' +
                  'drop-shadow(0 4px 8px rgba(2, 18, 36, 0.30))',
              }}
            />
          </div>
       )
     )}

      {/* item{i}, one pill per responsibility (1-6), each gated on its step */}
      {responsibilities.map((text, i) => {
        const c = cue(`item${i}`);
        return c ? (
          <PillRow
            key={i}
            index={i}
            firstPillTop={firstPillTop}
            frame={frame}
            text={text}
            startF={f(c.at)}
            durF={f(durOf(c))}
            pulseFrames={pulseFramesFor(`item${i}`)}
          />
       ) : null;
      })}
    </AbsoluteFill>
 );
};
