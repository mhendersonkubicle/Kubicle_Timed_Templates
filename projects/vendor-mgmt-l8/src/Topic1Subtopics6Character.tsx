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

// Topic1Subtopics6Character, character-only variant of Topic1Subtopics6
// (the renamed OnePoint7Subtopics).
//
// Same layout, animation, and waterfall typing as the icon version. The
// only difference is the left-panel anchor: instead of a 520×520 line-art
// icon floating on the platinum-blue background, this variant draws a
// dodger-blue rounded panel on the left half of the canvas and renders a
// character portrait inside it, with:
//   • the figure horizontally centred in the panel,
//   • the FACE landing at the panel's vertical centrepoint (tuned via
//     characterHeight + characterY),
//   • a silhouette drop shadow that lifts the figure off the dodger blue,
//   • lower body clipped by the panel's bottom edge via overflow: hidden
//     so the framing always reads as a clean head-and-shoulders portrait.
//
// Timing now follows the STANDARD reveal-sequence model (see GUIDANCE.md):
// the character is silent scaffolding, it folds into the `setup` cue with
// the background slide. Narrated content reveals one object at a time:
// `title`, then `row0..rowN` top-to-bottom.

// ─── Schema ──────────────────────────────────────────────────────────────────

const characterAnchorSchema = z.object({
  id:              z.string().min(1),
  // Rendered height of the character image in px (width preserved by aspect).
  characterHeight: z.number().min(200).max(1500).optional(),
  // Top offset inside the panel, in px. Negative crops the top of the image.
  characterY:      z.number().optional(),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas. All
// times are scene-relative SECONDS.
//
// Addressable targets for this template:
//   setup            scaffolding, oxford-blue background slides in from the
//                    right AND the dodger-blue character panel + portrait fade
//                    in (one unit; the character is decoration, not a beat).
//   title            header pill slides in: title icon + mainTitle together.
//   row0..rowN-1     one detail pill revealed as a single object: its outline
//                    scales in, THEN its caption types out. N is details.length
//                    (1-6). A row{i} with i >= N is ignored.
//
// NOTE: a row's `in` covers BOTH the outline scale and the typewriter, so the
// per-row default is ~1.4 s (longer than the model-wide 0.5 s default). The
// scale runs over the first ~43 % of the window, the type over the remainder.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|title|row[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(1.4), // entrance duration (scale + type)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed content object is NAMED AGAIN
// later in the narration (>~2-3s after its reveal), it gives a brief, subtle
// brand pulse at the exact re-mention timestamp. `at` is the scene-relative
// second of the re-mention (taken from the SRT). Targets are the CONTENT
// objects only (title + row{i}); setup is silent scaffolding and never pulses.
// See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^(title|row[0-9]+)$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const topic1Subtopics6CharacterTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const topic1Subtopics6CharacterSchema = z.object({
  // The bold headline in the header pill, locked to 3 WORDS OR FEWER
  // (and ≤30 chars) so the phrase always fits the pill on one line
  // without being clipped mid-word.
  mainTitle: z
    .string()
    .min(1)
    .max(30)
    .refine(
      s => s.trim().split(/\s+/).length <= 3,
      { message: 'mainTitle must be 3 words or fewer (one tight phrase per pill)' },
   ),
  // master Icons/ (-dark) id (white-pre-coloured) shown inside the header pill, to
  // the left of the title. Resolves to icons/<id>.svg.
  titleIcon: z.string().min(1),
  // 1 to 6 detail lines, one per pill. Each types out sequentially and
  // the title pill + row band auto-centre vertically together for the
  // count (3 rows sit centred with the title pill directly above them,
  // etc.). Each line capped at 38 chars, the largest comfortable fit
  // inside the 780 px text region at Satoshi Bold 33 px.
  details:   z.array(z.string().min(1).max(38)).min(1).max(6),
  character: characterAnchorSchema,
  timings:   topic1Subtopics6CharacterTimingsSchema.optional(),
});

export type Topic1Subtopics6CharacterProps = z.infer<
  typeof topic1Subtopics6CharacterSchema
>;

export const topic1Subtopics6CharacterMeta = {
  description:
    'Split-screen elaboration: a dodger-blue panel on the left holding a ' +
    'character portrait (face at the centrepoint); an oxford-blue panel ' +
    'on the right with a bold header pill announcing one core concept and ' +
    'up to six detail pills that type in sequentially (waterfall). Same ' +
    'animation as Topic1Subtopics6; only the left-panel anchor differs.',
  authoringNotes:
    'mainTitle goes in the header pill, bold white, 3 WORDS OR FEWER and ' +
    '≤30 chars so the phrase always fits the pill on one line without ' +
    'clipping. GOOD: "Data Modelling", "Cost Drivers", "Risk Factors". ' +
    'titleIcon is a master Icons/ (-dark) id (e.g. "benefit-hand", "ai-assistant", ' +
    '"arrow-trend-up"), pre-coloured white, sits cleanly in the header pill. ' +
    'details is 1 to 6 items, each typing into its own pill row; the title ' +
    'pill + row band auto-centre together for the count. Each line is ' +
    'capped at 38 chars, the largest comfortable fit inside the shell at ' +
    'Satoshi Bold 33 px. character.id is a PNG in characters/<id>.png. ' +
    'characterHeight + characterY tune the face position inside the ' +
    'dodger-blue panel (layout tuning, NOT timing); defaults work for typical ' +
    'presenter PNGs (face ~35% from PNG top). ' +
    'TIMING (reveal-sequence model): nothing shows by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets: setup ' +
    '(background slide + character panel/portrait fade, one unit, the character ' +
    'is silent scaffolding, NOT a narrated beat), title (header pill), and ' +
    'row0..rowN-1 (one detail pill each, N = details.length). Each step is ' +
    '{ target, at (seconds), in? (entrance duration, default 1.4, a row needs ' +
    'enough time for its outline to scale AND its caption to type) }. NARRATION ' +
    'MUST be a linear top-to-bottom list: name the topic (title), then deliver ' +
    'each detail in row order, one at a time, never introduce a lower pill ' +
    'before it has typed in, and never jump back up. See GUIDANCE.md for full ' +
    'selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BG_SRC          = staticFile('Template-Specific-Assets/Topic1Subtopics6Character/oxford_blue_splitscreen_bg.png');
const TITLE_PILL_SRC  = staticFile('Template-Specific-Assets/Topic1Subtopics6Character/title_pill.png');
const PILL_OUTLINE_SRC = staticFile('Template-Specific-Assets/Topic1Subtopics6Character/pill_outline.png');
const SATOSHI_BOLD_SRC  = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_BLACK_SRC = staticFile('fonts/Satoshi-Black.woff2');

// ─── Layout constants (measured from the supplied PNGs) ───────────────────────

// Detail pill graphic in Pill_Outline.png lives at x=949..1835, y=228..313.
const PILL_SRC_CX = 1392;
const PILL_SRC_CY = 270;

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
// the title pill always sits the same distance above the band; when the
// band auto-centres down for fewer rows, the title follows it.
const TITLE_TO_FIRST_ROW_GAP = 112;

// Bulb icon inside the title pill, left-aligned.
const BULB_SIZE = 64;
const BULB_X    = 985;

// Dodger-blue character panel on the left half. Positioned where the
// icon used to sit (centred around the original ANCHOR_CX = 432) so the
// rest of the composition still feels balanced.
const PANEL_LEFT   = 100;
const PANEL_TOP    = 60;
const PANEL_WIDTH  = 660;
const PANEL_HEIGHT = 920;
const PANEL_RADIUS = 40;
const PANEL_CENTER_Y = PANEL_HEIGHT / 2;          // 460
// Vertical dodger-blue gradient, lighter at the top, deeper toward the
// bottom. Gives the panel a subtle sense of dimension instead of a flat
// fill.
const PANEL_FILL   =
  'linear-gradient(180deg, #38B0FF 0%, #0496FF 50%, #0274C9 100%)';

// Default character framing, chosen so presenter-grey (face ~35 % from
// the top of the PNG) lands the face at the panel centrepoint.
const DEFAULT_CHARACTER_HEIGHT = 850;
const DEFAULT_CHARACTER_Y      = 163;             // ≈ PANEL_CENTER_Y − 0.35 × 850

// Oxford Blue BG travel distance: slides in from the right.
const NAVY_TRAVEL = 1080;

// Within a row's reveal window, the outline scales over the first portion
// and the caption types over the remainder. The split reproduces the
// original cadence (0.60 s scale + 0.80 s type = 1.40 s) at the default
// `in`, but scales proportionally if a step overrides `in`.
const ROW_SCALE_FRACTION = 0.6 / 1.4;   // ≈ 0.4286

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

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

// ─── Character anchor (dodger-blue panel + portrait) ─────────────────────────

function CharacterAnchor({
  frame,
  id,
  characterHeight,
  characterY,
  iconFadeStart,
  iconFadeDur,
}: {
  frame: number;
  id: string;
  characterHeight: number;
  characterY:      number;
  iconFadeStart:   number;
  iconFadeDur:     number;
}) {
  const opacity = interpolate(
    frame,
    [iconFadeStart, iconFadeStart + iconFadeDur],
    [0, 1],
    {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: cubicInOut,
    },
 );

  return (
    <div
      style={{
        position: 'absolute',
        left:   PANEL_LEFT,
        top:    PANEL_TOP,
        width:  PANEL_WIDTH,
        height: PANEL_HEIGHT,
        borderRadius: PANEL_RADIUS,
        background:   PANEL_FILL,
        overflow:     'hidden',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <Img
        src={staticFile(`characters/${id}.png`)}
        alt=""
        style={{
          position: 'absolute',
          left: '50%',
          top:  characterY,
          height: characterHeight,
          width:  'auto',
          transform: 'translateX(-50%)',
          display: 'block',
          // Two-layer silhouette drop shadow against the dodger-blue panel.
          filter:
            'drop-shadow(0 18px 24px rgba(2, 18, 36, 0.45)) ' +
            'drop-shadow(0 4px 8px rgba(2, 18, 36, 0.35))',
        }}
      />
    </div>
 );
}

// ─── Header pill ──────────────────────────────────────────────────────────────

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
  // after it has fully landed (pulseScale returns 1 outside its windows).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Title text is width-capped so the rightmost edge sits inside the
  // dodger-blue pill (~x=1840) and overflow is clipped, long copy can
  // never spill onto the oxford-blue background.
  const titleLeft  = BULB_X + BULB_SIZE + 22;
  const titleWidth = 1840 - titleLeft - 16;

  // For counts <6 the band auto-centres down; the title pill must follow
  // so the composition stays grouped. Shift everything by the same delta.
  const verticalShift = titleCY - TITLE_CY;

  // Pill's resting visual centre (within this full-canvas element's own
  // coordinate space, before the translate). The pulse scales about it so
  // the whole header swells/settles in place.
  const pillCX = (BULB_X + 1840) / 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translate(${slideX}px, ${verticalShift}px) scale(${pulse})`,
        transformOrigin: `${pillCX}px ${TITLE_CY}px`,
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

// ─── Detail pill ──────────────────────────────────────────────────────────────

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

  const settled   = frame >= scaleEnd;
  const scaleProg = interpolate(frame, [rowStart, scaleEnd], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const drawScale = settled ? 1 : (scaleProg > 0 ? subtleBackEase(scaleProg) : 0);

  const typeProg  = interpolate(frame, [scaleEnd, scaleEnd + typeDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const charsShow = Math.floor(text.length * typeProg);
  const visible   = text.slice(0, charsShow);

  // Re-mention pulse: a brief scale bump about the row's own centre, only
  // after it has settled (pulseScale returns 1 outside its windows, so this
  // composes with the entrance scale without disturbing it).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateY(${offsetY}px) scale(${drawScale * pulse})`,
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
          transform: `translateY(-50%) scale(${pulse})`,
          transformOrigin: `${PILL_SRC_CX - TEXT_LEFT}px 0px`,
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
    </>
 );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const Topic1Subtopics6Character: React.FC<Topic1Subtopics6CharacterProps> = ({
  mainTitle,
  titleIcon,
  details,
  character,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() =>
    delayRender('Loading Topic1Subtopics6Character fonts'),
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
  const durOf = (s: RevealStep) => (s.in ?? 1.4);

  // Re-mention pulse frames per content target (from timings.pulses).
  const pulseFramesFor = (target: string) =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // Resolve the scaffolding + title cues once.
  const cSetup = cue('setup');
  const cTitle = cue('title');

  const characterHeight = character.characterHeight ?? DEFAULT_CHARACTER_HEIGHT;
  const characterY      = character.characterY      ?? DEFAULT_CHARACTER_Y;

  // Setup, background slides in from the right AND the character panel/portrait
  // fade in, both across the setup window (one unit).
  const navyX = cSetup
    ? interpolate(
        frame,
        [f(cSetup.at), f(cSetup.at + durOf(cSetup))],
        [NAVY_TRAVEL, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: cubicInOut },
     )
    : NAVY_TRAVEL;

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* Phase 2, setup scaffolding: background slide + character panel/portrait
          fade (only when the sequence schedules `setup`). */}
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
        <CharacterAnchor
          frame={frame}
          id={character.id}
          characterHeight={characterHeight}
          characterY={characterY}
          iconFadeStart={f(cSetup.at)}
          iconFadeDur={f(durOf(cSetup))}
        />
     )}

      {/* Phase 3, header pill (gated on its `title` reveal). */}
      {cTitle && (
        <HeaderPill
          frame={frame}
          mainTitle={mainTitle}
          titleIcon={titleIcon}
          titleCY={rowCyFor(details.length, 0) - TITLE_TO_FIRST_ROW_GAP}
          slideStart={f(cTitle.at)}
          slideDur={f(durOf(cTitle))}
          pulseFrames={pulseFramesFor('title')}
        />
     )}

      {/* Phase 3, detail pills, each gated on its row{i} reveal. A row's `in`
          covers both the outline scale and the caption type; split internally. */}
      {details.map((text, i) => {
        const c = cue(`row${i}`);
        if (!c) return null;
        const total    = f(durOf(c));
        const scaleDur = Math.max(1, Math.round(total * ROW_SCALE_FRACTION));
        const typeDur  = Math.max(1, total - scaleDur);
        return (
          <DetailPill
            key={i}
            cy={rowCyFor(details.length, i)}
            frame={frame}
            text={text}
            rowStart={f(c.at)}
            scaleDur={scaleDur}
            typeDur={typeDur}
            pulseFrames={pulseFramesFor(`row${i}`)}
          />
       );
      })}
    </AbsoluteFill>
 );
};

// ─── Demo / test props ────────────────────────────────────────────────────────

export const topic1Subtopics6CharacterDefaultProps: Topic1Subtopics6CharacterProps = {
  mainTitle: 'Data Modelling',
  titleIcon: 'ai-assistant',
  character: {
    id: 'presenter-grey',
    // 1414×1441 PNG with the face centred horizontally; face is ~35 %
    // from the top of the PNG. At 850 px tall with characterY=163 the
    // eyes/nose land at the dodger-blue panel's vertical centre.
    characterHeight: 850,
    characterY:      163,
  },
  details: [
    'Define entities and relationships',
    'Choose a normalisation level',
    'Map primary and foreign keys',
    'Validate against business rules',
    'Review with stakeholders',
    'Document the final schema',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 0.8 },
      { target: 'title', at: 0.5, in: 0.8 },
      { target: 'row0', at: 1.3 },
      { target: 'row1', at: 2.7 },
      { target: 'row2', at: 4.1 },
      { target: 'row3', at: 5.5 },
      { target: 'row4', at: 6.9 },
      { target: 'row5', at: 8.3 },
    ],
  },
};
