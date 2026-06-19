import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { z } from 'zod';

// BulletList6Pills, up to six dark-navy pills with a dodger-blue chevron block
// on the left; under the reveal-sequence model each pill (body + chevron +
// typed label) reveals as a single object at its own cue, scaling up from its
// own centre then typing its label on character-by-character with a blinking
// cursor.
//
//   • A pill reveal (one step) scales the pill body up from 0 -> 1 around its
//     own centre over the first ~40% of its `in` window (easeOutCubic, opacity
//     riding along so very-small scales don't read as dust on the platinum
//     background), then types its label across the remaining window. A vertical
//     "|" cursor blinks beside the typed substring while typing, then
//     disappears when the label is complete.
//   • Optional `setup` step: all N empty pill bodies + chevron blocks (no
//     labels) scale/fade in first as an agenda-frame scaffold; each label then
//     types on at its own pillN cue. With no setup step, each pill reveals
//     wholesale (body + chevron + typed label) at its own cue, the cleaner
//     mapping and the recommended default.
//
// All visuals (background, pill body, chevron block, glyph, cursor) drawn in
// CSS / inline SVG, no PNG dependencies.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const bulletList6PillsBulletSchema = z.object({
  // Bullet label, Satoshi Bold white inside the dark-navy pill. ≤40 chars
  // so it stays comfortably on one line at 60 px.
  label: z.string().min(1).max(40),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup            OPTIONAL scaffold: all N empty pill bodies + chevron
//                    blocks (no labels) scale/fade in together.
//   pill0..pillN-1   one bullet row revealed as a single object: its pill body
//                    + chevron block scale in, then its label types on. N is
//                    bullets.length (1-6). A pill{i} with i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|pill[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.8), // entrance duration (scale-in + typing)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed pill is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `target` is the indexed pill slot (pill{i},
// matching the sequence's pill targets, setup excluded); `at` is the
// scene-relative second of the re-mention (taken from the SRT). See README
// "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^pill[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const bulletList6PillsTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const bulletList6PillsSchema = z.object({
  // 1 to 6 bullets. Fewer than 6 still reads as a centred stack, the whole
  // group is vertically centred on the canvas, not anchored to the top.
  bullets: z.array(bulletList6PillsBulletSchema).min(1).max(6),
  timings: bulletList6PillsTimingsSchema.optional(),
});

export type BulletList6PillsProps = z.infer<typeof bulletList6PillsSchema>;

export const bulletList6PillsMeta = {
  description:
    'A stack of up to 6 dark-navy pills with a dodger-blue »-chevron block on ' +
    'the left of each. Each pill scales in from its own centre then its label ' +
    'types on character-by-character with a visible cursor. Best for content ' +
    'that should read as "here are the N things, said one at a time", ' +
    'agendas, key takeaways, talking points, syllabus rows.',
  authoringNotes:
    'Supply 1 to 6 bullets, the stack is vertically centred on the canvas ' +
    'whatever the count, so 3 bullets sit centred rather than top-anchored. ' +
    'Labels ≤40 chars each (one line of Satoshi Bold 60 px in a 1600-px-wide ' +
    'pill). Aim for short, parallel phrasing, these read as a list, so ' +
    'consistent grammar across rows matters. GOOD: "Define the brief", ' +
    '"Sketch the structure". BAD: "Once you have defined the brief, sketch ' +
    'the structure" (too long). ' +
    'TIMING (reveal-sequence model): nothing shows by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets: an ' +
    'optional `setup` (scaffolds all N empty pills) then one `pill{i}` per ' +
    'bullet in top-to-bottom order. Each pill{i} reveals its pill body + ' +
    'chevron + typed label as one object; pill{i} beyond bullets.length is ' +
    'ignored. Each step is { target, at (seconds), in? (entrance duration, ' +
    'default 0.8) }. NARRATION MUST be linear: introduce the bullets strictly ' +
    'top-to-bottom, one at a time, syncing each pill{i}.at to the cue that ' +
    'introduces that bullet, no interleaving or jumping back up the list. ' +
    'See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants ────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Pill placement, left-anchored with a small margin, spanning ~83% of the
// canvas width to match the reference proportions.
const PILL_LEFT = 160;
const PILL_W    = 1600;
const PILL_H    = 140;
const PILL_RADIUS = 28;
const PILL_GAP    = 28;
const PILL_PITCH  = PILL_H + PILL_GAP;

// Top edge of the first pill so the whole stack is vertically centred on the
// canvas, for any count of pills (1-6). 6 pills → 50; 3 pills → 326; etc.
const firstPillTopFor = (count: number) =>
  (CANVAS_H - (count * PILL_H + (count - 1) * PILL_GAP)) / 2;

// Chevron block, rounded square sitting inside the pill on the left.
const CHEVRON_SIZE   = 120;
const CHEVRON_INSET  = 14;                  // inset from pill's left/top edges
const CHEVRON_RADIUS = 22;

// Where the label text begins (just to the right of the chevron block).
const TEXT_INSET_LEFT = CHEVRON_INSET + CHEVRON_SIZE + 30;

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Per-pill reveal split: the pill body scales in over the first SCALE_FRACTION
// of the step's `in` window; the label then types across the remaining window.
// Folds the prototype's two global clocks (scale-in + typewriter) into one cue.
const SCALE_FRACTION = 0.4;   // fraction of `in` spent scaling the body up
const TYPE_FRACTION  = 0.85;  // fraction of the typing window spent actively typing

const easeOutCubic = Easing.out(Easing.cubic);

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ─── Re-mention pulse (brand: brief + subtle) ────────────────────────────────
// A revealed pill that is named again later gives a quick scale pulse at the
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

const BG_COLOR = '#E6ECF2';                   // platinum blue background
const WHITE    = '#FFFFFF';

// Pill body: dark navy with a subtle top-to-bottom gradient (top brighter so
// the pill reads as having a soft inner light).
const PILL_BG =
  'linear-gradient(180deg, #0B2C44 0%, #062338 45%, #03182A 100%)';
const PILL_SHADOW =
  '0 8px 22px rgba(3, 24, 42, 0.30), ' +
  '0 2px 6px rgba(3, 24, 42, 0.20)';

// Chevron block: dodger-blue gradient, lighter on top, deeper on bottom.
const CHEVRON_BG =
  'linear-gradient(180deg, #5DBDFF 0%, #1A9CFE 55%, #0A8FEE 100%)';
const CHEVRON_GLYPH_COLOR = '#052438';        // oxford-blue glyph on the blue block

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
    const b = await bold.load();
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
  })();
  return fontsPromise;
}

// ─── Chevron glyph (»» in oxford-blue) ───────────────────────────────────────

function ChevronGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block' }}
    >
      <g
        stroke={CHEVRON_GLYPH_COLOR}
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <polyline points="28,28 50,50 28,72" />
        <polyline points="52,28 74,50 52,72" />
      </g>
    </svg>
 );
}

// ─── Single pill ─────────────────────────────────────────────────────────────

function Pill({
  rowIndex,
  firstPillTop,
  scale,
  opacity,
  typedText,
  showCursor,
  pulse,
}: {
  rowIndex: number;
  firstPillTop: number; // top edge of row 0 (depends on pill count)
  scale:   number;      // 0 → 1 scale-up at the pill's own centre
  opacity: number;      // 0 → 1 fade-in alongside scale
  typedText: string;    // substring currently revealed
  showCursor: boolean;
  pulse:   number;      // re-mention pulse multiplier (1 at rest)
}) {
  const top = firstPillTop + rowIndex * PILL_PITCH;

  return (
    <div
      style={{
        position: 'absolute',
        left:   PILL_LEFT,
        top,
        width:  PILL_W,
        height: PILL_H,
        borderRadius: PILL_RADIUS,
        background: PILL_BG,
        boxShadow:  PILL_SHADOW,
        overflow: 'hidden',
        // Re-mention pulse composes WITH the entrance scale around the pill's
        // own centre; pulse is 1 at rest, so this is a no-op until a pulse fires.
        transform: `scale(${scale * pulse})`,
        transformOrigin: '50% 50%',
        opacity,
      }}
    >
      {/* Chevron block on the left. */}
      <div
        style={{
          position: 'absolute',
          left: CHEVRON_INSET,
          top:  (PILL_H - CHEVRON_SIZE) / 2,
          width:  CHEVRON_SIZE,
          height: CHEVRON_SIZE,
          borderRadius: CHEVRON_RADIUS,
          background: CHEVRON_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronGlyph size={CHEVRON_SIZE - 28} />
      </div>

      {/* Typed label + cursor. */}
      <div
        style={{
          position: 'absolute',
          left: TEXT_INSET_LEFT,
          top:  0,
          height: PILL_H,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <span
          style={{
            color: WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 60,
            letterSpacing: '-0.005em',
            lineHeight: 1,
            whiteSpace: 'pre',                // preserve trailing spaces while typing
          }}
        >
          {typedText}
        </span>
        {showCursor && (
          <span
            style={{
              display: 'inline-block',
              width: 4,
              height: 60,
              marginLeft: 4,
              background: '#0496FF',
              // Subtle blink: 50% duty cycle at 2 Hz feels close to the reference.
              opacity: 0.95,
            }}
          />
       )}
      </div>
    </div>
 );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const BulletList6Pills: React.FC<BulletList6PillsProps> = ({
  bullets,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() =>
    delayRender('Loading BulletList6Pills fonts'),
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
  const durOf = (s: RevealStep) => (s.in ?? 0.8);

  // Re-mention pulse frames per pill slot (from timings.pulses).
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // Blink cadence: 2 Hz toggle (cursor on/off every 15 frames at 30 fps).
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // Centre the stack vertically for however many pills were supplied.
  const firstPillTop = firstPillTopFor(bullets.length);

  // Optional setup scaffold, scales/fades all N empty pills in together over
  // its own window. When present, pills are already on screen before their
  // labels type; the per-pill scale-in is then a no-op (already at full scale).
  const cSetup = cue('setup');

  return (
    <AbsoluteFill style={{ background: BG_COLOR, overflow: 'hidden' }}>
      {bullets.map((bullet, i) => {
        const cSelf = cue(`pill${i}`);

        // A pill renders only if its own pill{i} step is scheduled, OR the
        // optional setup step has scaffolded the empty pills in.
        if (!cSelf && !cSetup) return null;

        // ── Body scale-in ──
        // From `setup` (all pills together) if present, else from this pill's
        // own cue across the first SCALE_FRACTION of its `in` window. Opacity
        // rides the same window so very-small scales don't read as dust on the
        // platinum background.
        let scale: number;
        let opacity: number;
        if (cSetup) {
          const sp = clamp01(
            interpolate(
              frame,
              [f(cSetup.at), f(cSetup.at + durOf(cSetup))],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
           ),
         );
          const eased = easeOutCubic(sp);
          scale = eased;
          opacity = eased;
        } else {
          const scaleEnd = cSelf!.at + durOf(cSelf!) * SCALE_FRACTION;
          const sp = clamp01(
            interpolate(frame, [f(cSelf!.at), f(scaleEnd)], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
         );
          const eased = easeOutCubic(sp);
          scale = eased;
          opacity = eased;
        }

        // ── Typewriter ──
        // The label types on at this pill's OWN cue (pill{i}). With a setup
        // scaffold the body is already in, so typing simply runs across the
        // pill's window; without setup, typing starts after the scale-in phase.
        // Active typing occupies TYPE_FRACTION of the window, then holds.
        let typedCount = 0;
        let typing = false;
        if (cSelf) {
          const typeStart = cSetup
            ? cSelf.at
            : cSelf.at + durOf(cSelf) * SCALE_FRACTION;
          const typeWindow = cSetup
            ? durOf(cSelf)
            : durOf(cSelf) * (1 - SCALE_FRACTION);
          const typeActive = typeWindow * TYPE_FRACTION;
          const intoType = (frame - f(typeStart)) / FPS; // seconds into typing
          if (intoType <= 0) {
            typedCount = 0;
            typing = false;
          } else if (intoType >= typeActive) {
            typedCount = bullet.label.length;
            typing = false;
          } else {
            // Linear character reveal, feels mechanical/deliberate, like the
            // reference. easeOutCubic would feel too "soft" for typing.
            const charProg = intoType / typeActive;
            typedCount = Math.floor(charProg * bullet.label.length);
            typing = true;
          }
        }
        const typedText = bullet.label.slice(0, typedCount);

        // Cursor is visible only while THIS pill is mid-type, and blinks
        // during that window.
        const showCursor = typing && cursorVisible;

        // Re-mention pulse: a brief additive scale bump around the pill's own
        // centre. pulseScale returns 1 outside pulse windows, so an empty/absent
        // pulses array leaves the entrance animation untouched.
        const pulse = pulseScale(frame, pulseFramesFor(`pill${i}`), f(PULSE_DUR_S));

        return (
          <Pill
            key={i}
            rowIndex={i}
            firstPillTop={firstPillTop}
            scale={scale}
            opacity={opacity}
            typedText={typedText}
            showCursor={showCursor}
            pulse={pulse}
          />
       );
      })}
    </AbsoluteFill>
 );
};
