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

// Timeline5Tiles, split-screen 1-5 step list with anchor icon/character and a
// progress bar.
//   • Left: blue panel with a large white line-art icon OR a full-bleed
//     character portrait.
//   • Right: an oxford-blue rounded container that AUTO-SIZES to the number of
//     steps (1-5) and stays vertically centred, so there is never empty space
//     below the last step. Each step reveals with a circle pop-in and a single
//     typewritten phrase; a progress bar beneath fills 1/N per step.
//   • setup reveals the static scaffolding together: the left panel slides in
//     from off-canvas left, the anchor (icon/character) fades in, and the right
//     oxford-blue container fades + slides up 30 px with its EMPTY progress-bar
//     track at 0 % fill.
//   • Each step{i} then reveals row i as one object: numbered circle pop-in,
//     typewritten phrase, and the progress bar advancing toward (i+1)/N.
//   • Default composition length is 450 frames (15 s @ 30 fps).
//
// The left icon is auto-recoloured to solid white, so any line-art SVG from the
// icon catalogue works without a per-file recolour. Characters come from the
// shared character library (enum) and render large/bottom-anchored.

// ─── Schema ──────────────────────────────────────────────────────────────────

// Character library, every PNG in the shared CHARACTER LIBRARY (PNG) set.
// Swapping a character is just changing its id; all render at one fixed framing.
export const CHARACTER_IDS = [
  'Female_middleage_Asian',
  'female_earlycareer_black',
  'female_earlycareer_middleeastern',
  'female_earlycareer_white',
  'female_earlycareer_white2',
  'female_earlycareer_white3',
  'female_midcareer_white',
  'female_middleage_white',
  'female_middleage_white2',
  'female_middleage_white3',
  'male_earlycareer_black',
  'male_middleage_asian',
  'male_middleage_black',
  'male_middleage_white',
  'male_middleage_white2',
  'male_middleage_white3',
] as const;

export const characterIdSchema = z.enum(CHARACTER_IDS);

// Anchor accepts either an SVG icon or a character portrait PNG.
//   • icon:      any line-art id from the icon catalogue (resolved to
//                icons/<id>.svg), auto-recoloured to solid white.
//   • character: an id from the character library (resolved to
//                characters/<id>.png), rendered large, bottom-anchored.
export const timeline5TilesAnchorSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('icon'),     id: z.string().min(1) }),
  z.object({ kind: z.literal('character'), id: characterIdSchema }),
]);

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup            the scaffolding reveals together: left panel slides in,
//                    anchor fades in, right container + empty progress-bar
//                    track appear.
//   step0..stepN-1   one process step revealed as a single object: numbered
//                    circle pop-in, typewritten phrase, and the progress bar
//                    advancing toward (i+1)/N. N is steps.length (1-5). A
//                    step{i} with i >= N is ignored.
//
// `in` defaults high (1.8 s) because each step{i} carries an internal cascade
// (circle scale-in, number fade, typewriter over ~1.3 s) that must complete
// inside the step's own window.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|step[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.8), // entrance duration (circle + type + bar advance)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed step is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). `target` is a step{i} (setup is scaffolding,
// not a narrated content beat, so it is excluded). See README "re-mention
// pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^step[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const timeline5TilesTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const timeline5TilesSchema = z.object({
  // 1 to 5 step lines, ordered top → bottom. Bold white at 37 px in the
  // Satoshi family. ≤30 chars each so the typewriter completes in 1.3 s. The
  // oxford-blue container resizes to fit however many you supply.
  steps: z.array(z.string().min(1).max(30)).min(1).max(5),
  // Left-panel anchor: icon (line-art SVG) or character (portrait PNG).
  anchor: timeline5TilesAnchorSchema,
  timings: timeline5TilesTimingSchema.optional(),
});

export type Timeline5TilesProps = z.infer<typeof timeline5TilesSchema>;

export const timeline5TilesMeta = {
  description:
    'Split-screen compact 1-5 step list. Large white anchor icon (or a ' +
    'character portrait) on a blue left panel; on the right an oxford-blue ' +
    'container that auto-sizes to the number of steps, each revealing with a ' +
    'circle pop-in and a single typewritten phrase, accompanied by a progress ' +
    'bar filling beneath. One line per step, no supporting body copy. Best for ' +
    'a fast-reading short process where each step is a short imperative phrase.',
  authoringNotes:
    'Supply 1 to 5 steps in chronological order. Each is a short one-line ' +
    'description (Satoshi Bold 37 px white, ≤30 chars). Aim for parallel ' +
    'imperative phrasing. GOOD: "Plan the project scope". BAD: "You should ' +
    'plan the project carefully" (too long). The oxford-blue container ' +
    'auto-sizes and stays vertically centred for whatever count you supply, so ' +
    '1, 2, 3, 4 or 5 all read with no empty space. anchor is a discriminated ' +
    "union: { kind: 'icon', id } renders icons/<id>.svg (any line-art id from " +
    'the icon catalogue), the icon is auto-recoloured to solid white, so no ' +
    "pre-whitening is needed; { kind: 'character', id } renders " +
    'characters/<id>.png from the character library (use a CHARACTER_IDS value) ' +
    'rendered large and bottom-anchored. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every ' +
    'element appears only when a step in `timings.sequence` targets it. ' +
    'Schedule a `setup` step (left panel + anchor + right container + empty ' +
    'progress-bar track) then one `step{i}` per step in top-to-bottom order. ' +
    'Each step{i} reveals its circle + typewritten phrase as one object and ' +
    'advances the progress bar to (i+1)/N. Each step is { target, at (seconds), ' +
    'in? (entrance duration, default 1.8, kept high so the typewriter ' +
    'completes inside the window) }. The anchor is decorative scaffolding set ' +
    'at setup, NOT a narrated reveal beat. NARRATION MUST be linear, ' +
    'step-by-step: introduce steps strictly in execution order, one at a time, ' +
    'matching the top-to-bottom build, never describe a later step before its ' +
    'row is on screen, and never jump back. See GUIDANCE.md for full selection ' +
    'and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const ICON_BASE_SRC       = staticFile('Template-Specific-Assets/Timeline5Tiles/icon_base.png');
const INTER_EXTRABOLD_SRC = staticFile('fonts/Inter-ExtraBold.woff2');
const SATOSHI_BOLD_SRC     = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants (1920×1080 canvas) ─────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Left icon panel (icon_base.png bbox: x 0..858, y 50..1021 → centre 428, 535).
const ICON_PANEL_CX = 428;
const ICON_PANEL_CY = 535;
const ICON_SIZE     = 540;

// Character anchor. Two things to get right:
//   1. The library PNGs are hard-cropped at the torso (the figure runs to the
//      very bottom edge of the source). Rendering the portrait LARGER than the
//      panel and top-anchored pushes that flat cut below the panel, leaving a
//      clean head-and-shoulders/chest framing.
//   2. The portrait is matted to the blue panel's exact shape using
//      icon_base.png's alpha as a CSS mask, so it can never spill past the panel
//      onto the platinum background (the panel has a large right-corner radius
//      and a flush left edge, the mask matches it precisely).
const CHAR_IMG_W    = 1060;                          // portrait size (square)
const CHAR_IMG_TOP  = 48;                            // portrait top (canvas-y)
const CHAR_IMG_LEFT = ICON_PANEL_CX - CHAR_IMG_W / 2; // centred on the panel

// Right oxford-blue container, horizontal extent fixed; height derived from N.
const CONTAINER_LEFT   = 944;
const CONTAINER_W      = 877;
const CONTAINER_RADIUS = 40;

// Vertical model inside the container (measured from container top):
const BAR_FROM_TOP   = 85;     // progress-bar centre
const ROW0_FROM_TOP  = 215;    // first step's circle centre
const ROW_PITCH      = 157.25; // centre-to-centre between steps
const BOTTOM_PAD      = 131;    // below the last step's circle centre

function containerHeight(n: number): number {
  return ROW0_FROM_TOP + (n - 1) * ROW_PITCH + BOTTOM_PAD;
}
function containerTop(n: number): number {
  return (CANVAS_H - containerHeight(n)) / 2;
}

// Progress bar (relative to container left).
const BAR_LEFT_REL = 83;       // 1027 − CONTAINER_LEFT
const BAR_WIDTH    = 710;
const BAR_HEIGHT   = 44;

// Numbered circle.
const CIRCLE_CX = 1059;
const CIRCLE_R  = 63;          // diameter 126

// Step text region.
const TEXT_LEFT  = 1185;
const TEXT_WIDTH = 615;

// Left panel slides in from this far off-canvas left.
const PANEL_TRAVEL = 1100;
// Right container's slide-up + fade-up offset.
const CONTAINER_TY_FROM = 30;

// ─── Palette (sampled from the original prototype PNGs) ──────────────────────

const CONTAINER_BG = 'linear-gradient(180deg, #041E2E 0%, #020D14 100%)';
// Track is the dodger blue darkened (matches the original base PNG at 50%).
const BAR_TRACK    = '#024B80';
// Bar fill + circles share the same top-lit vertical gradient as the source
// PNGs: light blue at the top falling to dodger blue at the bottom.
const BAR_FILL     = 'linear-gradient(180deg, #45B1FF 0%, #0496FF 100%)';
const CIRCLE_BG    = 'linear-gradient(180deg, #5ABAFF 0%, #1A9FFF 52%, #0496FF 100%)';

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Internal cascade timings (seconds), as proportions of a step's `in` window.
// The circle scale-in fires immediately; the typewriter starts a beat later and
// runs across most of the window so a ≤30-char phrase finishes inside it.
const CIRCLE_SCALE_FRAC = 0.30;  // circle scale-in over first 30 % of `in`
const TYPE_OFFSET_FRAC  = 0.22;  // typewriter starts after 22 % of `in`
const TYPE_DUR_FRAC     = 0.72;  // typewriter runs over 72 % of `in`

const easeInOutCubic    = Easing.inOut(Easing.cubic);
const easeOutBackSubtle = Easing.out(Easing.back(1.05));

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
    const inter   = new FontFace('Inter',  `url(${INTER_EXTRABOLD_SRC}) format('woff2')`, { weight: '800', display: 'block' });
    const satoshi = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,   { weight: '700', display: 'block' });
    const [i, s]  = await Promise.all([inter.load(), satoshi.load()]);
    const fonts   = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(i);
    fonts.add(s);
  })();
  return fontsPromise;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type AnchorProp = Timeline5TilesProps['anchor'];

function IconPanel({
  frame,
  splitStart,
  splitEnd,
  anchor,
}: {
  frame: number;
  splitStart: number;
  splitEnd: number;
  anchor: AnchorProp;
}) {
  const x = interpolate(frame, [splitStart, splitEnd], [-PANEL_TRAVEL, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const iconOp = interpolate(frame, [splitStart + Math.round((splitEnd - splitStart) * 0.25), splitEnd + 3], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateX(${x}px)`,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={ICON_BASE_SRC}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
      {anchor.kind === 'icon' ? (
        <div
          style={{
            position: 'absolute',
            left: ICON_PANEL_CX - ICON_SIZE / 2,
            top:  ICON_PANEL_CY - ICON_SIZE / 2,
            width:  ICON_SIZE,
            height: ICON_SIZE,
            opacity: iconOp,
          }}
        >
          <Img
            src={staticFile(`icons/${anchor.id}.svg`)}
            alt=""
            // Force the line-art icon to solid white regardless of its source
            // ink, so any catalogue SVG reads correctly on the blue panel
            // without a per-file recolour. brightness(0) → black, invert(1) → white.
            style={{
              width: ICON_SIZE,
              height: ICON_SIZE,
              filter: 'brightness(0) invert(1)',
            }}
          />
        </div>
     ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: iconOp,
            // Matte the portrait to the blue panel's exact alpha shape.
            WebkitMaskImage: `url(${ICON_BASE_SRC})`,
            maskImage:       `url(${ICON_BASE_SRC})`,
            WebkitMaskSize: `${CANVAS_W}px ${CANVAS_H}px`,
            maskSize:       `${CANVAS_W}px ${CANVAS_H}px`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat:       'no-repeat',
            WebkitMaskPosition: '0px 0px',
            maskPosition:       '0px 0px',
          }}
        >
          <Img
            src={staticFile(`characters/${anchor.id}.png`)}
            alt=""
            style={{
              position: 'absolute',
              left: CHAR_IMG_LEFT,
              top:  CHAR_IMG_TOP,
              width:  CHAR_IMG_W,
              height: CHAR_IMG_W,
              display: 'block',
            }}
          />
        </div>
     )}
    </div>
 );
}

function RightContainer({
  frame,
  splitStart,
  splitEnd,
  cTop,
  cHeight,
  fillProg,
}: {
  frame: number;
  splitStart: number;
  splitEnd: number;
  cTop: number;
  cHeight: number;
  fillProg: number;
}) {
  const op = interpolate(frame, [splitStart, splitEnd], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });
  const ty = interpolate(frame, [splitStart, splitEnd], [CONTAINER_TY_FROM, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: CONTAINER_LEFT,
        top:  cTop,
        width:  CONTAINER_W,
        height: cHeight,
        borderRadius: CONTAINER_RADIUS,
        background: CONTAINER_BG,
        opacity: op,
        transform: `translateY(${ty}px)`,
        pointerEvents: 'none',
      }}
    >
      {/* Progress bar track */}
      <div
        style={{
          position: 'absolute',
          left: BAR_LEFT_REL,
          top:  BAR_FROM_TOP - BAR_HEIGHT / 2,
          width:  BAR_WIDTH,
          height: BAR_HEIGHT,
          borderRadius: BAR_HEIGHT / 2,
          background: BAR_TRACK,
        }}
      />
      {/* Progress bar fill */}
      <div
        style={{
          position: 'absolute',
          left: BAR_LEFT_REL,
          top:  BAR_FROM_TOP - BAR_HEIGHT / 2,
          width:  Math.max(BAR_HEIGHT, BAR_WIDTH * fillProg),
          height: BAR_HEIGHT,
          borderRadius: BAR_HEIGHT / 2,
          background: BAR_FILL,
        }}
      />
    </div>
 );
}

function Step({
  index,
  frame,
  text,
  startFrame,
  rowCenterY,
  circleScaleDur,
  typeStartOffset,
  typeDur,
  pulseFrames,
}: {
  index: number;
  frame: number;
  text: string;
  startFrame: number;
  rowCenterY: number;
  circleScaleDur: number;
  typeStartOffset: number;
  typeDur: number;
  pulseFrames: number[];
}) {
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  // Re-mention pulse: a brief scale bump around the row's centre, only after
  // it has been revealed (pulseScale returns 1 outside its windows, so it never
  // disturbs the entrance cascade). Origin sits between the numbered circle and
  // the text column at the row's vertical centre.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const rowOriginX = (CIRCLE_CX + TEXT_LEFT + TEXT_WIDTH / 2) / 2;

  // Circle scale-in.
  const scaleProg = interpolate(localFrame, [0, circleScaleDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const settled   = localFrame >= circleScaleDur;
  const drawScale = settled ? 1 : (scaleProg > 0 ? easeOutBackSubtle(scaleProg) : 0);

  // Number digit fade.
  const numberOp = interpolate(localFrame, [Math.round(circleScaleDur * 0.36), circleScaleDur + 1.5], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });

  // Typewriter, starts midway through the scale-in.
  const typeProg = interpolate(localFrame, [typeStartOffset, typeStartOffset + typeDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const charsShow = Math.floor(text.length * typeProg);
  const visible   = text.slice(0, charsShow);

  return (
    <div
      style={{
        // Re-mention pulse wrapper: additive scale around the row's centre,
        // composed on top of (never replacing) the per-element entrance
        // animations below. inset 0 keeps child absolute coords canvas-relative.
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${rowOriginX}px ${rowCenterY}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Numbered circle */}
      <div
        style={{
          position: 'absolute',
          left: CIRCLE_CX - CIRCLE_R,
          top:  rowCenterY - CIRCLE_R,
          width:  CIRCLE_R * 2,
          height: CIRCLE_R * 2,
          borderRadius: '50%',
          background: CIRCLE_BG,
          transform: `scale(${drawScale})`,
          transformOrigin: 'center center',
          opacity: scaleProg > 0 ? 1 : 0,
          display: 'flex',
          alignItems:     'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 60,
            lineHeight: 1,
            opacity: numberOp,
          }}
        >
          {index + 1}
        </span>
      </div>

      {/* Step text, typewriter, vertically centred against the circle */}
      <div
        style={{
          position: 'absolute',
          left: TEXT_LEFT,
          top:  rowCenterY,
          width: TEXT_WIDTH,
          transform: 'translateY(-50%)',
          color: '#FFFFFF',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 37,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
          opacity: localFrame >= typeStartOffset ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        {visible}
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const Timeline5Tiles: React.FC<Timeline5TilesProps> = ({
  steps,
  anchor,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading Timeline5Tiles fonts'));
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
  const durOf = (s: RevealStep) => (s.in ?? 1.8);

  const n      = steps.length;
  const cHeight = containerHeight(n);
  const cTop    = containerTop(n);

  // Re-mention pulse frames per step (from timings.pulses), grouped by target.
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // Setup, scaffolding (left panel + anchor + right container + empty track)
  // animates in across its window.
  const cSetup = cue('setup');

  // Progress-bar fill, re-derived for the reveal-sequence model: each step{i}
  // ramps the fill from i/N toward (i+1)/N across that step's OWN [at, at+in]
  // window, and holds at i/N between cues. Unscheduled steps never advance it.
  const seg = n > 0 ? 1 / n : 0;
  let fillProg = 0;
  for (let i = 0; i < n; i++) {
    const c = cue(`step${i}`);
    if (!c) continue;
    const startF = f(c.at);
    const endF   = f(c.at + durOf(c));
    if (frame >= endF) {
      fillProg = (i + 1) * seg;
    } else if (frame >= startF) {
      const local = (frame - startF) / Math.max(1, endF - startF);
      fillProg = i * seg + easeInOutCubic(Math.max(0, Math.min(1, local))) * seg;
      break;
    }
  }

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* setup, left panel + anchor + right container + empty progress track,
          only when the sequence schedules it. */}
      {cSetup && (
        <IconPanel
          frame={frame}
          splitStart={f(cSetup.at)}
          splitEnd={f(cSetup.at + durOf(cSetup))}
          anchor={anchor}
        />
     )}

      {cSetup && (
        <RightContainer
          frame={frame}
          splitStart={f(cSetup.at)}
          splitEnd={f(cSetup.at + durOf(cSetup))}
          cTop={cTop}
          cHeight={cHeight}
          fillProg={fillProg}
        />
     )}

      {/* Per-step rows, each gated on its step{i} reveal. */}
      {steps.map((text, i) => {
        const c = cue(`step${i}`);
        if (!c) return null;
        const startF = f(c.at);
        const winF   = f(durOf(c));
        return (
          <Step
            key={i}
            index={i}
            frame={frame}
            text={text}
            startFrame={startF}
            rowCenterY={cTop + ROW0_FROM_TOP + i * ROW_PITCH}
            circleScaleDur={Math.max(1, Math.round(winF * CIRCLE_SCALE_FRAC))}
            typeStartOffset={Math.round(winF * TYPE_OFFSET_FRAC)}
            typeDur={Math.max(1, Math.round(winF * TYPE_DUR_FRAC))}
            pulseFrames={pulseFramesFor(`step${i}`)}
          />
       );
      })}
    </AbsoluteFill>
 );
};
