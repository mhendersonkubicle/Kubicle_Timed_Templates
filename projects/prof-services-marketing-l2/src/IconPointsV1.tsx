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

// IconPointsV1, conveyor-belt sequence of labelled pills inside a right-side
// container, mirrored by a fading "covered topics" stack on the left.
//
//   • setup       : platinum-blue background; the empty right-hand container
//     rises from below the canvas (easeOutCubic) into its docked position.
//   • pill{i}     : each point's pill (with its large icon) enters from the
//     LEFT edge of the container and HOLDS at the centre, staying on screen
//     until the NEXT point is revealed. When the next pill enters, this one
//     pans off the RIGHT as a faded copy rises into the growing "covered"
//     stack on the LEFT (and persists). The LAST revealed pill is never
//     replaced, so its image stays in the box to the end of the scene.
//   • Final frame : the last point's pill + icon held in the box on the right;
//     the earlier points stacked on the left, first at the top.
//
// All visuals (container, pill, badge, badge icon) are drawn in CSS / inline
// SVG, there are no PNG dependencies. The per-pill LARGE icon resolves from
// the shared Icons library via icons/<id>.svg at render time.

// ─── Content schema ────────────────────────────────────────────────────────

// Each pill has its own icon. `icon` is the stem of a LIGHT-MODE SVG from the
// shared Icons library (e.g. "ai-agent-chatbot-light" → icons/ai-agent-chatbot-light.svg).
// It must end in `-light` (optionally `-light-2`, …) so the glyph reads in the
// library's oxford-blue + dodger-blue palette against this scene's light
// container. This id drives the LARGE icon shown in the right-hand box.
const LIGHT_ICON_RE = /-light(-\d+)?$/i;

export const iconPointsV1PillSchema = z.object({
  // Label text. Capped at 18 chars so it always fits inside the pill; the
  // component also auto-shrinks the font as a safety net, so text never clips.
  label: z.string().min(1).max(18),
  // Any light-mode icon id from the Icons library (must end in `-light`).
  icon:  z.string().min(1).regex(LIGHT_ICON_RE, 'icon must be a light-mode library id ending in "-light"'),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage, no container, no pills). All times are scene-relative
// SECONDS.
//
// Addressable targets:
//   setup            the empty right-hand container rises up from below (Phase 2)
//   pill0..pillN-1   one point revealed as a single object: its pill enters the
//                    conveyor from the left, holds at centre to read, pans off
//                    right, and its faded copy materialises (and stays) as the
//                    next slot of the left covered-stack. N is pills.length
//                    (2-6). A pill{i} with i >= N is ignored.
//
// The whole enter -> hold -> exit -> left-stack-fade cycle is housed INSIDE one
// step's [at, at+in] window. `in` is the full conveyor cycle length; the
// default (1.8 s) matches the prototype's enter+hold+exit beat, so a step that
// only sets `at` still reads. Give consecutive pill cues at least `in` seconds
// of spacing so conveyor pills do not collide inside the container.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|pill[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.8), // full conveyor cycle (enter+hold+exit)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed pill is NAMED AGAIN later in the
// narration (>~2-3s after its reveal, while it is still held in the box), it
// gives a brief, subtle brand pulse at the exact re-mention timestamp. `at` is
// the scene-relative second of the re-mention (taken from the SRT). Targets are
// the content pill slots (pill{i}); `setup` is excluded. See README
// "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^pill[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const iconPointsV1TimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const iconPointsV1Schema = z.object({
  // Pill list in order (2-6), first pill ends up at the TOP of the left
  // stack, last at the BOTTOM. The right-hand conveyor mirrors this list
  // exactly: N pills on the left ⇒ N pills pan through the box on the right.
  // The box + stack resize and vertically centre to suit the chosen count.
  pills:   z.array(iconPointsV1PillSchema).min(2).max(6),
  timings: iconPointsV1TimingSchema.optional(),
});

export type IconPointsV1Props = z.infer<typeof iconPointsV1Schema>;

export const iconPointsV1Meta = {
  description:
    'A right-side container rises up; pills with an icon pan through it ' +
    'left-to-right like a conveyor belt, one at a time. As each pill exits ' +
    'the container on the right, a copy of it fades in on the left in a ' +
    'growing stack, signalling "covered topics". Final frame: container ' +
    'empty + all pills stacked on the left. Best for a guided agenda or ' +
    'walkthrough of 2-6 ordered points where each is a short icon-able label.',
  authoringNotes:
    'Supply 2-6 pills in walkthrough order. The right-hand conveyor mirrors ' +
    'the list exactly, N pills left ⇒ N pills panning on the right, and the ' +
    'box + left stack resize and vertically centre to suit the count. Each pill ' +
    'has: label (≤18 chars; the component also auto-shrinks the font so text ' +
    'never clips its box) and icon (the stem of any LIGHT-MODE icon from the ' +
    'Icons library, e.g. "ai-agent-chatbot-light", "business-motivation-rocket-light" ' +
    ', must end in "-light"). That icon is rendered LARGE inside the right box; ' +
    'the small blue badge on every pill is a fixed graduation cap and is not ' +
    'configurable. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step (the empty container rises) then one `pill{i}` per point in ' +
    'list order. Each pill{i} enters on its `at` and HOLDS its image in the box ' +
    'until the next pill{i+1} is revealed, then pans off right as the next ' +
    'slides in and a faded copy joins the left "covered" stack. The LAST pill ' +
    'holds in the box to the end of the scene (it never joins the stack). `in` ' +
    '(default 1.8) only sizes the enter/exit slides, not the hold, so just ' +
    'space pill cues to the narration; the box is never empty between points. ' +
    'NARRATION MUST be linear, one point at a time in list order, introduce ' +
    'pill0 fully before pill1, never naming a later pill before its conveyor ' +
    'entry. The first pill ends at the TOP of the left stack, so narration order ' +
    'matches list order top-to-bottom. See GUIDANCE.md for full selection and ' +
    'narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants ─────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Container, right-side rounded rectangle drawn in CSS. Height matches the
// vertical extent of the 6-pill stack on the left (top of pill 1 → bottom of
// pill 6) so the two halves of the frame feel balanced.
const CONTAINER_X      = 920;
const CONTAINER_WIDTH  = 900;
const CONTAINER_RADIUS = 32;
// Container Y + height are now derived per-render from the pill count
// (see "Count-adaptive layout" in the main component).

// Pill geometry (drawn in CSS).
const PILL_WIDTH  = 760;
const PILL_HEIGHT = 130;
const PILL_RADIUS = 24;

// Pill vertical position INSIDE the container, pinned near the top edge.
const PILL_TOP_INSIDE = 40;

// Pill horizontal travel inside the container's clip region.
const PILL_X_OFF_LEFT  = -(PILL_WIDTH + 20);
const PILL_X_CENTRE    = (CONTAINER_WIDTH - PILL_WIDTH) / 2;     // 70
const PILL_X_OFF_RIGHT = CONTAINER_WIDTH + 20;

// Left-side "covered topics" stack, sits in canvas-space, NOT inside the
// container. Each slot is a fixed (x, y) where the faded copy materialises.
const STACK_X     = 80;
const STACK_PITCH = 145;
// Stack top Y is derived per-render from the pill count (vertical centring).

// Container slide-up travel from below the canvas.
const CONTAINER_TRAVEL_Y = 1080;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// How a pill's `in` window sizes its enter + exit slides. The HOLD is no longer
// a fixed fraction: a pill holds at centre until the NEXT point is revealed
// (dynamic), so `in` only scales the enter/exit motion, not how long it stays.
const ENTER_FRAC = 0.31;
const EXIT_FRAC  = 0.27;
// The left-stack copy fades in over the back portion of the exit, then stays.
const STACK_FADE_FRAC = 0.25;

const easeOutCubic   = Easing.out(Easing.cubic);
const easeInCubic    = Easing.in(Easing.cubic);

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

const BG_COLOR = '#E6ECF2';

// Container, soft white → very-light-blue vertical gradient with subtle shadow.
const CONTAINER_BG =
  'linear-gradient(180deg, #FFFFFF 0%, #F7FAFD 40%, #E2EBF5 100%)';
const CONTAINER_SHADOW =
  '0 10px 30px rgba(20, 50, 90, 0.10), 0 2px 6px rgba(20, 50, 90, 0.06)';

// Pill body, clean white with a soft drop shadow.
const PILL_BG     = '#FFFFFF';
const PILL_SHADOW =
  '0 4px 14px rgba(20, 50, 90, 0.10), 0 1px 3px rgba(20, 50, 90, 0.08)';

// Blue badge that hosts the small white icon inside each pill, same on every pill.
const ICON_BADGE_BG =
  'linear-gradient(180deg, #57BBFF 0%, #1A9CFE 60%, #0A7FE0 100%)';

const TEXT_COLOR = '#0A0F18';

// Size of the large icon parented below each conveyor pill (centred in
// container horizontally on the pill's centre).
const LARGE_ICON_SIZE = 460;
const LARGE_ICON_TOP  = 270;

// ─── Font loading ─────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`, { weight: '700', display: 'block' });
    const b    = await bold.load();
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
  })();
  return fontsPromise;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ─── Pill badge icon (white graduation cap, the same on every pill) ─────────

function GradCapIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10L12 5 2 10l10 5 10-5z" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={1.2} />
      <path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" />
      <line x1="22" y1="10" x2="22" y2="15" />
      <circle cx="22" cy="16.5" r="1.2" fill="#FFFFFF" stroke="#FFFFFF" />
    </svg>
 );
}

// ─── Large per-pill icon (loaded from icons/<id>.svg) ────────────────────────
//
// The source SVGs in the shared Icons library are light-mode glyphs:
//   • paths with no explicit fill   → oxford blue  (#052438) via root <g fill>
//   • paths styled fill:#33CCCC     → dodger blue  (#1A9CFE)
// Rendered ~400 px below each conveyor pill, parented to its horizontal
// motion so they pan together and stay clipped by the container's matte.

function LargeIcon({ id, size }: { id: string; size: number }) {
  return (
    <Img
      src={staticFile(`icons/${id}.svg`)}
      alt=""
      style={{ width: size, height: size, display: 'block' }}
    />
 );
}

// ─── Shared pill visual (icon + label) ───────────────────────────────────────

function PillBody({
  label,
  background = PILL_BG,
}: {
  label: string;
  background?: string;
}) {
  const BADGE_SIZE  = 96;
  const ICON_MARGIN = (PILL_HEIGHT - BADGE_SIZE) / 2;

  // Width left for the label after the badge + gaps + padding.
  const TEXT_AVAIL = PILL_WIDTH - 2 * ICON_MARGIN - BADGE_SIZE - 24;
  // Auto-fit: estimate the rendered width with a conservative per-glyph advance
  // and scale the font down if it would exceed the available width. Combined
  // with the 18-char schema cap this guarantees the label never clips the box.
  const BASE_FONT = 55;
  const estWidth  = label.length * 0.6 * BASE_FONT;
  const fontSize  = estWidth > TEXT_AVAIL ? Math.max(36, (BASE_FONT * TEXT_AVAIL) / estWidth) : BASE_FONT;

  return (
    <div
      style={{
        width:  PILL_WIDTH,
        height: PILL_HEIGHT,
        borderRadius: PILL_RADIUS,
        background,
        boxShadow:    PILL_SHADOW,
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${ICON_MARGIN}px`,
        gap: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* Dodger-blue rounded badge with the white graduation-cap icon, same on every pill. */}
      <div
        style={{
          width:  BADGE_SIZE,
          height: BADGE_SIZE,
          borderRadius: 22,
          background:   ICON_BADGE_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <GradCapIcon size={56} />
      </div>
      <span
        style={{
          color: TEXT_COLOR,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize,
          letterSpacing: '-0.01em',
          // Roomy line box so descenders (g, y, p, q, j) are never clipped.
          // Horizontal fit is already guaranteed by the 18-char cap + auto-fit,
          // so no overflow clipping is needed here.
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          maxWidth: TEXT_AVAIL,
        }}
      >
        {label}
      </span>
    </div>
 );
}

// ─── Conveyor pill (inside the container, panning left → right) ─────────────
// Gated and driven by one pill{i} reveal step. The enter -> hold -> exit beats
// are proportions of the step's `in` window (durF frames). Before the step
// fires, or once the pill has fully exited, it renders nothing.

function ConveyorPill({
  frame,
  label,
  iconId,
  startFrame,
  durF,
  nextStartFrame,
  pulseFrames,
}: {
  frame: number;
  label: string;
  iconId: string;
  startFrame: number;
  durF: number;
  // Frame at which the NEXT pill begins entering, or null if this is the last
  // revealed pill. The pill HOLDS at centre until this frame (so its image
  // stays on screen until the next point is mentioned), then exits as the next
  // slides in. The last pill (null) holds at centre to the end of the scene.
  nextStartFrame: number | null;
  // Re-mention pulse frames for this pill (from timings.pulses).
  pulseFrames: number[];
}) {
  if (frame < startFrame) return null;

  const localFrame = frame - startFrame;
  const enterDur = durF * ENTER_FRAC;
  const exitDur  = durF * EXIT_FRAC;
  const enterEnd = enterDur;

  let x: number;
  if (localFrame < enterEnd) {
    // ENTERING, ease-OUT: fast in, decelerates as it settles at centre.
    x = interpolate(localFrame, [0, enterEnd], [PILL_X_OFF_LEFT, PILL_X_CENTRE], {
      easing: easeOutCubic,
    });
  } else if (nextStartFrame === null || frame < nextStartFrame) {
    // HOLDING at centre: persists until the next pill begins entering, or for
    // the rest of the scene if this is the last revealed pill.
    x = PILL_X_CENTRE;
  } else if (frame < nextStartFrame + exitDur) {
    // EXITING, ease-IN: drifts off centre and accelerates off-right exactly as
    // the next pill slides in from the left (a clean swap).
    x = interpolate(frame, [nextStartFrame, nextStartFrame + exitDur], [PILL_X_CENTRE, PILL_X_OFF_RIGHT], {
      easing: easeInCubic,
    });
  } else {
    return null;
  }

  // Re-mention pulse: a brief scale bump around the held pill's centre. It is
  // an ADDITIVE multiplier on the wrapper (composing with, never replacing, the
  // conveyor `x` translate) and returns 1 outside pulse windows, so an empty
  // pulses list leaves the conveyor motion untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Centre of the held pill + large-icon group, used as the pulse origin so the
  // bump grows symmetrically around the visible content.
  const groupCY = (PILL_TOP_INSIDE + LARGE_ICON_TOP + LARGE_ICON_SIZE) / 2;

  // Parent wrapper that holds BOTH the pill and the large icon, both pan
  // together with `x` and are clipped by the container's matte.
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top:  0,
        width:  PILL_WIDTH,
        transform: `scale(${pulse})`,
        transformOrigin: `${PILL_WIDTH / 2}px ${groupCY}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Pill at the top of the container. */}
      <div style={{ position: 'absolute', left: 0, top: PILL_TOP_INSIDE }}>
        {/* Conveyor pill uses the same platinum→white gradient as the stack
            and the container, so the whole composition stays consistent. */}
        <PillBody label={label} background={CONTAINER_BG} />
      </div>

      {/* Large icon, centred horizontally on the pill (so it lands at the
          container's centre when the pill is at its hold position). */}
      <div
        style={{
          position: 'absolute',
          left: (PILL_WIDTH - LARGE_ICON_SIZE) / 2,
          top:  LARGE_ICON_TOP,
          width:  LARGE_ICON_SIZE,
          height: LARGE_ICON_SIZE,
        }}
      >
        <LargeIcon id={iconId} size={LARGE_ICON_SIZE} />
      </div>
    </div>
 );
}

// ─── Stack pill (fades in on the left as the conveyor pill exits right) ──────
// Fades in over the back of the conveyor pill's exit, then PERSISTS for the
// rest of the scene (it never fades back out).

function StackPill({
  frame,
  label,
  stackIndex,
  stackTopY,
  fadeStartFrame,
  fadeDur,
}: {
  frame: number;
  label: string;
  stackIndex: number;
  stackTopY: number;
  fadeStartFrame: number;
  fadeDur: number;
}) {
  if (frame < fadeStartFrame) return null;

  const localFrame = frame - fadeStartFrame;
  const opacity = clamp01(easeOutCubic(clamp01(localFrame / fadeDur)));

  return (
    <div
      style={{
        position: 'absolute',
        left: STACK_X,
        top:  stackTopY + stackIndex * STACK_PITCH,
        opacity,
        pointerEvents: 'none',
      }}
    >
      {/* Left-stack pills use the container's platinum-blue → white gradient
          so the "covered" stack reads visually as the calm twin of the
          active container on the right. No large icon, that lives only
          inside the container, parented to the conveyor pill. */}
      <PillBody label={label} background={CONTAINER_BG} />
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const IconPointsV1: React.FC<IconPointsV1Props> = ({ pills, timings }) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading IconPointsV1 fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent
  // (blank-canvas default: no container, no pills).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 1.8);

  // Re-mention pulse frames per pill slot (from timings.pulses).
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // Setup, the empty container rises up from below across its window. No
  // setup step -> no container is drawn at all.
  const cSetup = cue('setup');
  const riseProg = cSetup
    ? clamp01((frame - f(cSetup.at)) / Math.max(1, f(durOf(cSetup))))
    : 0;
  const riseY = (1 - easeOutCubic(riseProg)) * CONTAINER_TRAVEL_Y;

  // ── Count-adaptive layout ───────────────────────────────────────────────
  // The left stack spans (N-1) pitches + one pill height. The right box must
  // also be tall enough to frame the large icon. Both are vertically centred
  // as one group, and the stack is centred within the box, so 2-6 pills stay
  // balanced rather than stranded at the top of a 6-tall container.
  const N = pills.length;
  const STACK_EXTENT  = (N - 1) * STACK_PITCH + PILL_HEIGHT;
  const ICON_MIN_H    = LARGE_ICON_TOP + LARGE_ICON_SIZE + 40; // frame the large icon
  const CONTAINER_H   = Math.max(STACK_EXTENT, ICON_MIN_H);
  const GROUP_TOP     = Math.round((CANVAS_H - CONTAINER_H) / 2);
  const STACK_TOP     = GROUP_TOP + Math.round((CONTAINER_H - STACK_EXTENT) / 2);

  return (
    <AbsoluteFill style={{ background: BG_COLOR, overflow: 'hidden' }}>
      {/* LEFT-SIDE STACK, each slot is gated on its pill{i} step. The copy
          fades in over the back of that pill's conveyor exit, then PERSISTS,
          building a "covered topics" list. */}
      {pills.map((p, i) => {
        const c = cue(`pill${i}`);
        if (!c) return null;
        // A pill only joins the "covered" left stack once it is REPLACED, i.e.
        // when the next pill begins entering. The last revealed pill is never
        // replaced, so it stays in the box and never appears in the stack.
        const next = cue(`pill${i + 1}`);
        if (!next) return null;
        const durF = f(durOf(c));
        const fadeStart = f(next.at);
        return (
          <StackPill
            key={`stack-${i}`}
            frame={frame}
            label={p.label}
            stackIndex={i}
            stackTopY={STACK_TOP}
            fadeStartFrame={fadeStart}
            fadeDur={Math.max(1, Math.round(durF * STACK_FADE_FRAC))}
          />
       );
      })}

      {/* CONTAINER, only drawn once `setup` is scheduled. Rounded rectangle on
          the right with overflow: hidden so conveyor pills are clipped to the
          container's bounds. */}
      {cSetup && (
        <div
          style={{
            position: 'absolute',
            left:   CONTAINER_X,
            top:    GROUP_TOP,
            width:  CONTAINER_WIDTH,
            height: CONTAINER_H,
            borderRadius: CONTAINER_RADIUS,
            background:   CONTAINER_BG,
            boxShadow:    CONTAINER_SHADOW,
            overflow: 'hidden',
            transform: `translateY(${riseY}px)`,
            pointerEvents: 'none',
          }}
        >
          {pills.map((p, i) => {
            const c = cue(`pill${i}`);
            if (!c) return null;
            const next = cue(`pill${i + 1}`);
            return (
              <ConveyorPill
                key={`pill-${i}`}
                frame={frame}
                label={p.label}
                iconId={p.icon}
                startFrame={f(c.at)}
                durF={f(durOf(c))}
                nextStartFrame={next ? f(next.at) : null}
                pulseFrames={pulseFramesFor(`pill${i}`)}
              />
           );
          })}
        </div>
     )}
    </AbsoluteFill>
 );
};
