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

// Topic1Subtopics6, split-screen header pill + up to 6 detail pills typing in
// a top-to-bottom waterfall.
//   • setup: Oxford Blue right panel pans in from the right (easeInOutCubic),
//     and the large left-panel anchor icon fades in. Both are content-free
//     scaffolding, so they fold into one `setup` reveal (the panel pans over
//     the first half of the step, the icon fades over the second half).
//   • header: the header pill slides in from the right carrying its titleIcon
//     + mainTitle as one always-present unit.
//   • detail0..detailN-1: each detail pill scales in with a subtle easeOutBack
//     and then its text types out character-by-character, revealed as one
//     object. Count = details.length (1-6); the row band + header pill
//     auto-centre vertically together for the count.
//
// TIMING MODEL: reveal-sequence (standard). Timing lives in a separate
// `timings.sequence` block, kept apart from content props. An element renders
// ONLY when a step targets it; the default (empty sequence) is a BLANK canvas.
// All times are scene-relative SECONDS. See GUIDANCE.md.

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum-blue left panel). All times are scene-relative SECONDS.
//
// Addressable targets (INDEXED, mirrors Process5Steps' step{i}):
//   setup              the oxford-blue right panel pans in + the left-panel
//                      anchor icon fades in (scaffolding; no content)
//   header             the header pill slides in carrying titleIcon + mainTitle
//   detail0..detailN-1 each detail pill: outline scales in then text types out,
//                      revealed as one object. N = details.length (1-6); a
//                      detail{i} with i >= N has no content and is ignored.
//
// NOTE: the per-pill entrance is compound (scale-in THEN typewriter), so the
// `in` default here is ~1.4 s, long enough to encompass both phases, rather
// than the 0.5-0.8 s used by the simpler reference templates.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|header|detail[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.4), // entrance duration (scale + typewriter)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed object is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). Targets are the CONTENT objects only
// (header + detail{i}); setup is scaffolding and is not pulsable. See README
// "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^(header|detail[0-9]+)$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const topic1Subtopics6TimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

// ─── Content schema ───────────────────────────────────────────────────────────

export const topic1Subtopics6Schema = z.object({
  // The bold headline in the header pill, locked to 3 WORDS OR FEWER (and
  // ≤30 chars) so the phrase always fits the pill on one line without
  // being clipped mid-word.
  mainTitle: z
    .string()
    .min(1)
    .max(30)
    .refine(
      s => s.trim().split(/\s+/).length <= 3,
      { message: 'mainTitle must be 3 words or fewer (one tight phrase per pill)' },
   ),
  // master Icons/ (-dark) id (white-pre-coloured) shown inside the header pill, to
  // the left of the title. Resolves to icons/<id>.svg, pick any
  // id from the master Icons/ library (-dark variants) ("benefit-hand", "ai-assistant",
  // "search (1)", "arrow-trend-up", …).
  titleIcon: z.string().min(1),
  // 1 to 6 detail lines, one per pill. Each types out sequentially and
  // the title pill + row band auto-centre vertically together for the
  // count (3 rows sit centred in the frame with the title pill directly
  // above them, etc.). Each line is capped at 38 chars, the largest
  // comfortable fit inside the 780 px text region at Satoshi Bold 33 px.
  // The overflow:hidden clip is a defensive backstop.
  details: z.array(z.string().min(1).max(38)).min(1).max(6),
  // Master Icons/ catalogue id for the large left-panel anchor. MUST end
  // with `-light`, those SVGs have light-coloured strokes that read on
  // the platinum-blue left panel; -dark variants would vanish into it.
  anchor: z.object({
    id: z.string().min(1).regex(/-light$/, {
      message: 'Anchor icon must end with -light (use a -light-suffix id from the Icons/ catalogue)',
    }),
  }),
  timings: topic1Subtopics6TimingsSchema.optional(),
});

export type Topic1Subtopics6Props = z.infer<typeof topic1Subtopics6Schema>;

export const topic1Subtopics6Meta = {
  description:
    'Split-screen elaboration: a large line-art anchor icon on a light-blue left ' +
    'panel; an oxford-blue right panel holds a bold header pill announcing one ' +
    'core concept, with up to six detail pills beneath that type in sequentially ' +
    '(waterfall). Best for unpacking a single idea into its main supporting ' +
    'facts, drivers, dimensions, or examples, one concept fanning out into its ' +
    'supporting points.',
  authoringNotes:
    'mainTitle goes in the header pill, bold white, 3 WORDS OR FEWER and ≤30 ' +
    'chars so the phrase always fits the pill on one line without clipping. ' +
    'GOOD: "Data modelling", "Cost drivers", "Risk factors". BAD: "Cost ' +
    'drivers in cloud SRE 24/7" (4+ words, will fail validation). ' +
    'titleIcon is a master Icons/ (-dark) id (e.g. "benefit-hand", "ai-assistant", ' +
    '"arrow-trend-up"), those SVGs are pre-coloured white and sit cleanly ' +
    'inside the header pill. details is 1 to 6 items, each typing into its ' +
    'own pill row; the row band + header pill auto-centre vertically for the ' +
    'count. Each line is capped at 38 chars. Aim for parallel phrasing, noun ' +
    'phrases or short sentences. anchor is { id: "<…>-light" }, pick a ' +
    '-light-suffix id from the master Icons/ catalogue ("ai-agent-aibrain-light", ' +
    '"business-strategy-checklist-light"). For the character-anchor variant ' +
    'of this layout, use the sibling template Topic1Subtopics6Character. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets: setup ' +
    '(right panel pan + anchor fade), header (pill + title), and indexed ' +
    'detail0..detailN-1 (one per detail line). Each step is { target, at ' +
    '(seconds), in? (entrance duration, default 1.4 to cover scale + typewriter) }. ' +
    'A detail step reveals its pill outline AND typed text as one object. The ' +
    'vertical layout is centred on details.length, so the sequence MUST reveal ' +
    'one detail{i} for EVERY supplied detail (partial reveals leave blank gaps). ' +
    'NARRATION MUST be linear top-to-bottom: state the core concept (header) ' +
    'first, then each detail in waterfall order, one at a time, never jumping to ' +
    'a lower pill before the ones above it are spoken. See GUIDANCE.md for full ' +
    'selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BG_SRC          = staticFile('Template-Specific-Assets/Topic1Subtopics6/oxford_blue_splitscreen_bg.png');
const TITLE_PILL_SRC  = staticFile('Template-Specific-Assets/Topic1Subtopics6/title_pill.png');
const PILL_OUTLINE_SRC = staticFile('Template-Specific-Assets/Topic1Subtopics6/pill_outline.png');
const SATOSHI_BOLD_SRC  = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_BLACK_SRC = staticFile('fonts/Satoshi-Black.woff2');

// ─── Layout constants (measured from the supplied PNGs) ───────────────────────

// Detail pill graphic in Pill_Outline.png lives at x=949..1835, y=228..313.
const PILL_SRC_CX = 1392;   // (949 + 1835) / 2
const PILL_SRC_CY = 270;    // (228 + 313) / 2

// Detail row band, auto-centres vertically for the supplied count (1-6).
// At count=6 these reproduce the original positions [270, 378, 490, 601,
// 711, 821] exactly; pitch is the original 110 px.
const ROW_BAND_CY = 545;
const ROW_PITCH   = 110;
const rowCyFor = (count: number, i: number) =>
  ROW_BAND_CY - ((count - 1) * ROW_PITCH) / 2 + i * ROW_PITCH;

// Text bounds inside each pill.
const TEXT_LEFT  = 1040;
const TEXT_RIGHT = 1820;

// Title pill, centre of Title_Pill.png asset in its original layout.
const TITLE_CY = 158;
// Vertical gap between the title pill centre and the first detail row
// centre in the original 6-row layout (270 - 158 = 112). Kept constant so
// the title pill always sits the same distance above the band, no matter
// the count, when the band auto-centres down for fewer rows, the title
// follows it.
const TITLE_TO_FIRST_ROW_GAP = 112;

// Bulb icon inside the title pill, left-aligned.
const BULB_SIZE = 64;
const BULB_X    = 985;

// Anchor icon, large illustration on the left panel.
const ANCHOR_SIZE = 520;
const ANCHOR_CX   = 432;
const ANCHOR_CY   = 540;

// Oxford Blue BG travel distance: slides in from the right.
const NAVY_TRAVEL = 1080;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Per-step entrance split (proportions of a detail step's `in` window): the
// pill outline scales over the first ~43 %, then the text types over the rest.
// At the default in = 1.4 s this reproduces the prototype's 0.60 s scale +
// 0.80 s typewriter exactly.
const SCALE_FRAC = 0.6 / 1.4;   // ≈ 0.4286

// easeOutBack with a subtle overshoot (c1=0.6), lively but not bouncy.
const subtleBackEase = Easing.out(Easing.back(0.6));
const cubicInOut     = Easing.inOut(Easing.cubic);

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
    const bold  = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`, { weight: '700', display: 'block' });
    const black = new FontFace('Satoshi', `url(${SATOSHI_BLACK_SRC}) format('woff2')`, { weight: '900', display: 'block' });
    const [b, k] = await Promise.all([bold.load(), black.load()]);
    const fonts = document.fonts as FontFaceSet & { add(f: FontFace): void };
    fonts.add(b);
    fonts.add(k);
  })();
  return fontsPromise;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnchorIcon({
  frame,
  anchorId,
  iconFadeStart,
  iconFadeDur,
}: {
  frame: number;
  anchorId: string;
  iconFadeStart: number;
  iconFadeDur: number;
}) {
  const opacity = interpolate(frame, [iconFadeStart, iconFadeStart + iconFadeDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: cubicInOut,
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: ANCHOR_CX - ANCHOR_SIZE / 2,
        top:  ANCHOR_CY - ANCHOR_SIZE / 2,
        width:  ANCHOR_SIZE,
        height: ANCHOR_SIZE,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={staticFile(`icons/${anchorId}.svg`)}
        alt=""
        style={{ width: ANCHOR_SIZE, height: ANCHOR_SIZE }}
      />
    </div>
 );
}

function HeaderPill({
  frame,
  mainTitle,
  titleIcon,
  titleCY,
  slideStart,
  slideDur,
  pulseFrames,
}: {
  frame: number;
  mainTitle: string;
  titleIcon: string;
  titleCY: number;
  slideStart: number;
  slideDur: number;
  pulseFrames: number[];
}) {
  const slideX = interpolate(frame, [slideStart, slideStart + slideDur], [1920, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: cubicInOut,
  });

  // Re-mention pulse: a brief scale bump around the pill's own centre, only
  // after it has fully landed (pulseScale returns 1 outside pulse windows).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Title text starts just after the bulb glyph; we cap its width so the
  // rightmost edge sits inside the dodger-blue pill (~x=1840) and clip
  // any overflow so long copy can never spill onto the oxford-blue bg.
  const titleLeft  = BULB_X + BULB_SIZE + 22;
  const titleWidth = 1840 - titleLeft - 16;

  // For counts <6 the band auto-centres down; the title pill must follow
  // so the composition stays together. Shift the full-canvas title pill
  // PNG and the icon/text positions by the same delta.
  const verticalShift = titleCY - TITLE_CY;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${slideX}px, ${verticalShift}px) scale(${pulse})`,
        transformOrigin: `${PILL_SRC_CX}px ${TITLE_CY + verticalShift}px`,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={TITLE_PILL_SRC}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
      <div
        style={{
          position: 'absolute',
          left: BULB_X,
          top:  TITLE_CY - BULB_SIZE / 2,
          width:  BULB_SIZE,
          height: BULB_SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img
          src={staticFile(`icons/${titleIcon}.svg`)}
          alt=""
          style={{ width: BULB_SIZE, height: BULB_SIZE, display: 'block' }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: titleLeft,
          top:  TITLE_CY,
          width: titleWidth,
          transform: 'translateY(-50%)',
          color: '#FFFFFF',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 900,
          fontSize: 55,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {mainTitle}
      </div>
    </div>
 );
}

function DetailPill({
  cy,
  frame,
  text,
  rowStart,
  scaleDur,
  typeDur,
  pulseFrames,
}: {
  cy: number;
  frame: number;
  text: string;
  rowStart: number;
  scaleDur: number;
  typeDur: number;
  pulseFrames: number[];
}) {
  const targetCY = cy;
  const offsetY  = targetCY - PILL_SRC_CY;
  const scaleEnd = rowStart + scaleDur;

  // Re-mention pulse: a brief scale bump around the row's own centre, applied
  // to the whole pill object (outline + text) on top of its entrance. Returns
  // 1 outside pulse windows, so default/empty pulses change nothing.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Scale-in with subtle easeOutBack, locks to 1 once settled.
  const settled   = frame >= scaleEnd;
  const scaleProg = interpolate(frame, [rowStart, scaleEnd], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const drawScale = settled ? 1 : (scaleProg > 0 ? subtleBackEase(scaleProg) : 0);

  // Typewriter, characters revealed proportionally over typeDur frames.
  const typeProg  = interpolate(frame, [scaleEnd, scaleEnd + typeDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const charsShow = Math.floor(text.length * typeProg);
  const visible   = text.slice(0, charsShow);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${PILL_SRC_CX}px ${targetCY}px`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateY(${offsetY}px) scale(${drawScale})`,
          transformOrigin: `${PILL_SRC_CX}px ${PILL_SRC_CY}px`,
          pointerEvents: 'none',
        }}
      >
        <Img
          src={PILL_OUTLINE_SRC}
          alt=""
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left:  TEXT_LEFT,
          top:   targetCY,
          width: TEXT_RIGHT - TEXT_LEFT,
          transform: 'translateY(-50%)',
          color: '#FFFFFF',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 33,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: settled ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        {visible}
      </div>
    </div>
 );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const Topic1Subtopics6: React.FC<Topic1Subtopics6Props> = ({
  mainTitle,
  titleIcon,
  details,
  anchor,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading Topic1Subtopics6 fonts'));
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
  const durOf = (s: RevealStep) => (s.in ?? 1.4);

  // Re-mention pulse frames per content target (from timings.pulses).
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // ── setup, scaffolding. One step folds two independent sub-animations:
  // the oxford-blue right panel pans over the first half of the window, and
  // the anchor icon fades over the second half (re-derived offsets, as
  // Process5Steps does for its internal cascade).
  const cSetup = cue('setup');
  const navyX = cSetup
    ? interpolate(
        frame,
        [f(cSetup.at), f(cSetup.at + durOf(cSetup) * 0.5)],
        [NAVY_TRAVEL, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: cubicInOut },
     )
    : NAVY_TRAVEL;

  // ── header, pill + title slide in across its window.
  const cHeader = cue('header');

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* setup, oxford-blue right panel pans in + anchor icon fades in. */}
      {cSetup && (
        <Img
          src={BG_SRC}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            transform: `translateX(${navyX}px)`,
          }}
        />
     )}

      {cSetup && (
        <AnchorIcon
          frame={frame}
          anchorId={anchor.id}
          iconFadeStart={f(cSetup.at + durOf(cSetup) * 0.5)}
          iconFadeDur={f(durOf(cSetup) * 0.5)}
        />
     )}

      {/* header, the header pill slides in carrying titleIcon + mainTitle. */}
      {cHeader && (
        <HeaderPill
          frame={frame}
          mainTitle={mainTitle}
          titleIcon={titleIcon}
          titleCY={rowCyFor(details.length, 0) - TITLE_TO_FIRST_ROW_GAP}
          slideStart={f(cHeader.at)}
          slideDur={f(durOf(cHeader))}
          pulseFrames={pulseFramesFor('header')}
        />
     )}

      {/* detail0..detailN-1, each pill scales in then types out, gated on
          its own reveal step. The vertical band centres on details.length,
          so every supplied detail should be scheduled (see GUIDANCE.md). */}
      {details.map((text, i) => {
        const c = cue(`detail${i}`);
        if (!c) return null;
        const dur      = durOf(c);
        const scaleDur = f(dur * SCALE_FRAC);
        const typeDur  = f(dur) - scaleDur;
        return (
          <DetailPill
            key={i}
            cy={rowCyFor(details.length, i)}
            frame={frame}
            text={text}
            rowStart={f(c.at)}
            scaleDur={scaleDur}
            typeDur={typeDur}
            pulseFrames={pulseFramesFor(`detail${i}`)}
          />
       );
      })}
    </AbsoluteFill>
 );
};
