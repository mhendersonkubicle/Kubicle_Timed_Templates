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

// Points3Subtopics2, split-screen with 3 colour sections, each carrying 2 detail shells.
//   • setup (scaffolding): Oxford Blue right panel pans in from the right AND
//     the left icon frame (Icon_Base.png + anchor icon/character) fades in.
//     These two intro animations carry no text, so they fold into one target.
//   • Each colour band (Blue / Pink / Yellow) is split into THREE objects:
//       title{n}   , title pill scales in (easeOutBack, c1=0.9) + arrow/caption fade
//       detail{n}a , detail shell 0 scales in (easeOutBack, c1=0.45) + typewriter
//       detail{n}b , detail shell 1 scales in + typewriter
//     The per-character typewriter still kicks off only after that shell settles,
//     entirely within the object's own reveal window (`in`).
//   • Default composition length is 450 frames (15 s @ 30 fps).
//
// Anchor icon (graphic.svg) recoloured at port time: #052438 → #E6ECF2 base,
// #0496FF Dodger Blue accents preserved.

// ─── Schema ──────────────────────────────────────────────────────────────────

const sectionSchema = z.object({
  // Title pill caption, bold ink, Satoshi Black 55 px. Capped at 3 WORDS
  // (and ≤30 chars) so the phrase fits the pill on one line without ever
  // being cut off mid-word.
  mainText: z
    .string()
    .min(1)
    .max(30)
    .refine(
      s => s.trim().split(/\s+/).length <= 3,
      { message: 'mainText must be 3 words or fewer (one tight phrase per pill)' },
   ),
  // 1 OR 2 supporting detail POINTS that type out in the shells. Each is a
  // COMPLETE, INDEPENDENT point that fits in ONE shell (≤45 chars); never split
  // one sentence across the two shells. A section may carry 1 point (a single
  // centred shell) or 2 points (two stacked shells).
  detailTexts: z.array(z.string().min(1).max(45)).min(1).max(2),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas. Each
// step is one "object". All times are scene-relative SECONDS.
//
// This template uses FIXED named slots (the geometry hard-fixes exactly 3
// colour bands × (1 title + 2 details), each baked to its own colour and
// y-position). Addressable targets:
//   setup                       split-screen panel pans in + left anchor frame fades in
//   title0 / title1 / title2    the three colour-band title pills (blue/pink/yellow)
//   detail0a / detail0b         blue band's two detail shells (typewriter)
//   detail1a / detail1b         pink band's two detail shells
//   detail2a / detail2b         yellow band's two detail shells
export const revealStepSchema = z.object({
  target: z.enum([
    'setup',
    'title0', 'detail0a', 'detail0b',
    'title1', 'detail1a', 'detail1b',
    'title2', 'detail2a', 'detail2b',
  ]),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.7), // entrance duration (scale + fade / typewriter)
});
export type RevealStep = z.infer<typeof revealStepSchema>;
export type Points3Subtopics2Target = RevealStep['target'];

// Re-mention pulse: when an already-revealed content object is NAMED AGAIN
// later in the narration (>~2-3s after its reveal), it gives a brief, subtle
// brand pulse at the exact re-mention timestamp. `at` is the scene-relative
// second of the re-mention (taken from the SRT). Targets are the CONTENT slots
// only (the three title pills and the six detail shells); setup never pulses.
// See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.enum([
    'title0', 'detail0a', 'detail0b',
    'title1', 'detail1a', 'detail1b',
    'title2', 'detail2a', 'detail2b',
  ]),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const points3Subtopics2TimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const points3Subtopics2Schema = z.object({
  // Exactly 3 sections, in colour order: Dodger Blue → Wild Strawberry → Lemon Yellow.
  sections: z.array(sectionSchema).length(3),
  // Icon ID for the anchor on the left panel (e.g. "graphic"). Should be an
  // SVG patched to #E6ECF2 base + Dodger Blue accents.
  anchor: z.discriminatedUnion('kind', [
    // Icon anchor, locked to the -dark-suffix variant from the master
    // Icons/ catalogue. Those SVGs are platinum + Dodger-Blue line art and
    // read brightly on the Oxford-Blue panel; the -light variants disappear.
    z.object({
      kind: z.literal('icon'),
      id:   z.string().min(1).regex(/-dark$/, {
        message: 'Anchor icon must end with -dark (use a -dark-suffix id from the Icons/ catalogue)',
      }),
    }),
    z.object({ kind: z.literal('character'), id: z.string().min(1) }),
  ]),
  timings: points3Subtopics2TimingsSchema.optional(),
});

export type Points3Subtopics2Props = z.infer<typeof points3Subtopics2Schema>;

export const points3Subtopics2Meta = {
  description:
    'Split-screen layout: Oxford Blue right panel pans in with a large anchor ' +
    'icon on the left. Three colour sections (Blue / Pink / Yellow) appear ' +
    'sequentially on the right, each with a title pill and 2 detail shells ' +
    'that scale in + type out. Best for 3 main ideas with 2 supporting points each.',
  authoringNotes:
    'Always supply exactly 3 sections. mainText is the title pill caption, bold ' +
    'ink at 55 px, 3 WORDS OR FEWER and ≤30 chars so the phrase fits the pill on ' +
    'one line without being cut off mid-word. detailTexts[0] and [1] type out ' +
    'underneath, Satoshi Bold white at 33 px, ≤45 chars each. Keep parallel ' +
    'structure across sections (e.g. all noun phrases). GOOD mainText: ' +
    '"Plan", "Build", "Ship", "Measure Outcomes". GOOD detailTexts: ' +
    '"Define entities and goals", "Map data flows". BAD: long sentences, ' +
    "strip to noun phrases. anchor is a discriminated union: " +
    "{ kind: 'icon', id } MUST use a -dark-suffix id from the master Icons/ " +
    "catalogue (e.g. 'business-success-path-dark'), those SVGs are platinum + " +
    'Dodger Blue and read on the Oxford-Blue panel. ' +
    "{ kind: 'character', id } picks a PNG from the character library. " +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets are FIXED ' +
    'named slots: setup, title0/title1/title2 (blue/pink/yellow bands), and the ' +
    'two detail shells per band detail{n}a / detail{n}b. Each step is ' +
    '{ target, at (seconds), in? (entrance duration, default 0.7) }. A detail ' +
    'step scales its shell in then types its line out, all within its own `in` ' +
    'window. NARRATION MUST be linear top-to-bottom, band-complete: deliver one ' +
    'whole colour band (title then both details in order) before the next, ' +
    'never interleave details across bands. See GUIDANCE.md for full selection ' +
    'and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const BG_SRC        = staticFile('Template-Specific-Assets/Points3Subtopics2/oxford_blue_splitscreen.png');
const ICON_BASE_SRC = staticFile('Template-Specific-Assets/Points3Subtopics2/icon_base.png');

const TITLE_PILL_SRCS = {
  blue:   staticFile('Template-Specific-Assets/Points3Subtopics2/title_pill_dodger_blue.png'),
  pink:   staticFile('Template-Specific-Assets/Points3Subtopics2/title_pill_wild_strawberry.png'),
  yellow: staticFile('Template-Specific-Assets/Points3Subtopics2/title_pill_lemon_yellow.png'),
} as const;
const SHELL_SRCS = {
  blue:   staticFile('Template-Specific-Assets/Points3Subtopics2/pill_shell_dodger_blue.png'),
  pink:   staticFile('Template-Specific-Assets/Points3Subtopics2/pill_shell_wild_strawberry.png'),
  yellow: staticFile('Template-Specific-Assets/Points3Subtopics2/pill_shell_lemon_yellow.png'),
} as const;

const SATOSHI_BLACK_SRC = staticFile('fonts/Satoshi-Black.woff2');
const SATOSHI_BOLD_SRC  = staticFile('fonts/Satoshi-Bold.woff2');

// ─── Layout constants (lifted from the prototype) ─────────────────────────────

// BG slide travel, Oxford_Blue_Splitscreen.png covers the right 1078 px.
const SPLIT_TRAVEL = 1078;

// Left icon panel, Icon_Base.png solid bbox (71..777, 52..1040), centre (424, 546).
const PANEL_CX = 424;
const PANEL_CY = 546;
const PANEL_ICON_SIZE = 480;

// Character bbox, fills the dark panel (slight inset from the 71..777 × 52..1040
// solid bbox so the subject sits inside the rounded corners).
const CHAR_LEFT   = 75;
const CHAR_TOP    = 70;
const CHAR_WIDTH  = 700;
const CHAR_HEIGHT = 960;
const CHAR_RADIUS = 40;

// Right-side pill geometry (same x range for all three colours).
const TITLE_LEFT  = 942;
const TITLE_RIGHT = 1840;
const SHELL_LEFT  = 949;
const SHELL_RIGHT = 1835;
const TITLE_CX = (TITLE_LEFT + TITLE_RIGHT) / 2;
const SHELL_CX = (SHELL_LEFT + SHELL_RIGHT) / 2;

// Source-y centres for each colour band (verbatim from the assets).
const TITLE_SRC_CY = { blue: 98, pink: 436, yellow: 779 } as const;
const SHELL_SRC_CY = { blue: 211, pink: 551, yellow: 887 } as const;

// Detail row 2 sits +110 px below row 1.
const SHELL_ROW_GAP = 110;

// Text positioning inside the right-side pills.
const TEXT_LEFT_PAD  = 1040;
const TEXT_RIGHT_PAD = 1820;

// Title arrow sits left of the title text.
const ARROW_LEFT = 985;
const ARROW_SIZE = 56;

// Colours (constant across sections per the HTML).
const TITLE_TEXT_COLOUR  = '#0B1E33';
const DETAIL_TEXT_COLOUR = '#FFFFFF';

type ColourKey = 'blue' | 'pink' | 'yellow';
const COLOURS: readonly ColourKey[] = ['blue', 'pink', 'yellow'] as const;

// Within a detail object's `in` window, the shell scales in over the first
// portion, then the typewriter runs over the remainder. These split the window
// so the original "type after shell settles" beat is preserved per object.
const SHELL_SCALE_FRACTION = 0.5;  // shell scale-in occupies the first half
const SHELL_TYPE_FRACTION  = 0.5;  // typewriter runs over the second half
// Title text fades in over the back half of the title object's window.
const TITLE_TEXT_FADE_FRACTION = 0.55;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

const easeInOutCubic    = Easing.inOut(Easing.cubic);
const easeOutBackSubtle = Easing.out(Easing.back(0.9));   // title pills
const easeOutBackTiny   = Easing.out(Easing.back(0.45));  // detail shells

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
    const black = new FontFace('Satoshi', `url(${SATOSHI_BLACK_SRC}) format('woff2')`, { weight: '900', display: 'block' });
    const bold  = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,  { weight: '700', display: 'block' });
    const [k, b] = await Promise.all([black.load(), bold.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(k);
    fonts.add(b);
  })();
  return fontsPromise;
}

// ─── Arrow icon (fixed inline JSX, leading icon on each title) ──────────────

function ArrowIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size}>
      <path
        d="M18,12h0a2,2,0,0,0-.59-1.4l-4.29-4.3a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L15,11H5a1,1,0,0,0,0,2H15l-3.29,3.29a1,1,0,0,0,1.41,1.42l4.29-4.3A2,2,0,0,0,18,12Z"
        fill={color}
      />
    </svg>
 );
}

// ─── Title pill (one colour band's title pill + arrow + caption) ─────────────
// Gated on its title{n} reveal step. Scales in around the pill's source centre,
// then the arrow + caption fade in over the back of the window.

function TitlePill({
  frame,
  colour,
  startFrame,
  durFrames,
  mainText,
  pulseFrames,
}: {
  frame: number;
  colour: ColourKey;
  startFrame: number;
  durFrames: number;
  mainText: string;
  pulseFrames: number[];
}) {
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const titleSrcCY = TITLE_SRC_CY[colour];

  // Re-mention pulse: a brief scale bump around the pill's centre, additive on
  // top of the entrance scale (1 outside pulse windows, so it never disturbs
  // the reveal).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Pill scale-in over the full window.
  const titleScaleProg = interpolate(localFrame, [0, durFrames], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const titleSettled = localFrame >= durFrames;
  const titleScale   = titleSettled ? 1 : (titleScaleProg > 0 ? easeOutBackSubtle(titleScaleProg) : 0);

  // Title text fade, eases in over the back portion of the window.
  const textIn  = durFrames * (1 - TITLE_TEXT_FADE_FRACTION);
  const titleTextOp = interpolate(localFrame, [textIn, durFrames], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOutCubic,
  });

  return (
    <>
      {/* Title pill graphic, full-frame asset scaled around the pill's source centre */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${titleScale * pulse})`,
          transformOrigin: `${TITLE_CX}px ${titleSrcCY}px`,
          opacity: titleScaleProg > 0 ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        <Img
          src={TITLE_PILL_SRCS[colour]}
          alt=""
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* Title arrow + text, scaled with the pill so they pop in together */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${titleScale * pulse})`,
          transformOrigin: `${TITLE_CX}px ${titleSrcCY}px`,
          opacity: titleScaleProg > 0 ? 1 : 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: ARROW_LEFT,
            top:  titleSrcCY - ARROW_SIZE / 2,
            width:  ARROW_SIZE,
            height: ARROW_SIZE,
            opacity: titleTextOp,
          }}
        >
          <ArrowIcon size={ARROW_SIZE} color={TITLE_TEXT_COLOUR} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: TEXT_LEFT_PAD + 20,
            top:  titleSrcCY,
            transform: 'translateY(-50%)',
            width: TEXT_RIGHT_PAD - (TEXT_LEFT_PAD + 20),
            color: TITLE_TEXT_COLOUR,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 55,
            letterSpacing: '-0.005em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            opacity: titleTextOp,
          }}
        >
          {mainText}
        </div>
      </div>
    </>
 );
}

// ─── Detail shell (one detail row: shell scales in, then typewriter) ─────────
// Gated on its detail{n}a / detail{n}b reveal step. The shell scales in over the
// first half of the object's window; the per-character typewriter runs over the
// second half, preserving the prototype's "type after shell settles" beat
// entirely inside this object's own `in`.

function DetailShell({
  frame,
  colour,
  startFrame,
  durFrames,
  rowOffset,
  text,
  pulseFrames,
}: {
  frame: number;
  colour: ColourKey;
  startFrame: number;
  durFrames: number;
  rowOffset: number;
  text: string;
  pulseFrames: number[];
}) {
  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const shellSrcCY = SHELL_SRC_CY[colour];

  // Re-mention pulse: a brief scale bump around the shell's own centre
  // (SHELL_CX, shellSrcCY + rowOffset), applied to the whole object wrapper so
  // the shell and its typed line bump together. 1 outside pulse windows, so it
  // never disturbs the reveal.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  const scaleDur = durFrames * SHELL_SCALE_FRACTION;
  const typeDur  = durFrames * SHELL_TYPE_FRACTION;

  // Shell scale-in over the first half of the window.
  const sp = interpolate(localFrame, [0, scaleDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const settled = localFrame >= scaleDur;
  const drawScale = settled ? 1 : (sp > 0 ? easeOutBackTiny(sp) : 0);

  // Typewriter, kicks off after the shell settles.
  const typeStart = scaleDur;
  const typeProg  = interpolate(localFrame, [typeStart, typeStart + typeDur], [0, 1], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
  });
  const charsShow = Math.floor(text.length * typeProg);
  const visible   = text.slice(0, charsShow);

  const targetCY = shellSrcCY + rowOffset;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        transform: `scale(${pulse})`,
        transformOrigin: `${SHELL_CX}px ${shellSrcCY + rowOffset}px`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateY(${rowOffset}px) scale(${drawScale})`,
          transformOrigin: `${SHELL_CX}px ${shellSrcCY}px`,
          opacity: sp > 0 ? 1 : 0,
        }}
      >
        <Img
          src={SHELL_SRCS[colour]}
          alt=""
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: TEXT_LEFT_PAD,
          top:  targetCY,
          width: TEXT_RIGHT_PAD - TEXT_LEFT_PAD,
          transform: 'translateY(-50%)',
          color: DETAIL_TEXT_COLOUR,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 33,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          opacity: settled ? 1 : 0,
        }}
      >
        {visible}
      </div>
    </div>
 );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const Points3Subtopics2: React.FC<Points3Subtopics2Props> = ({
  sections,
  anchor,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading Points3Subtopics2 fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<Points3Subtopics2Target, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: Points3Subtopics2Target): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.7);

  // ── setup, split-screen panel pans in + left anchor frame fades in ───────
  const cSetup = cue('setup');
  const setupStart = cSetup ? f(cSetup.at) : 0;
  const setupDur   = cSetup ? f(durOf(cSetup)) : 0;
  // Panel travels the full window; the left frame fades in over the back ~60%.
  const bgX = cSetup
    ? interpolate(frame, [setupStart, setupStart + setupDur], [SPLIT_TRAVEL, 0], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
        easing: easeInOutCubic,
      })
    : SPLIT_TRAVEL;
  const frameOp = cSetup
    ? interpolate(frame, [setupStart + setupDur * 0.4, setupStart + setupDur], [0, 1], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
        easing: easeInOutCubic,
      })
    : 0;

  // Resolve the per-band title and detail steps once. FIXED named slots:
  // band index 0 = blue, 1 = pink, 2 = yellow.
  const titleCues: Array<RevealStep | undefined> = [
    cue('title0'), cue('title1'), cue('title2'),
  ];
  const detailACues: Array<RevealStep | undefined> = [
    cue('detail0a'), cue('detail1a'), cue('detail2a'),
  ];
  const detailBCues: Array<RevealStep | undefined> = [
    cue('detail0b'), cue('detail1b'), cue('detail2b'),
  ];

  // Re-mention pulse frames per content target (from timings.pulses).
  const pulseFramesFor = (target: PulseStep['target']): number[] =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));
  const titlePulseF: number[][] = [
    pulseFramesFor('title0'), pulseFramesFor('title1'), pulseFramesFor('title2'),
  ];
  const detailAPulseF: number[][] = [
    pulseFramesFor('detail0a'), pulseFramesFor('detail1a'), pulseFramesFor('detail2a'),
  ];
  const detailBPulseF: number[][] = [
    pulseFramesFor('detail0b'), pulseFramesFor('detail1b'), pulseFramesFor('detail2b'),
  ];

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {/* setup, Oxford Blue right panel + left anchor frame (only when scheduled) */}
      {cSetup && (
        <Img
          src={BG_SRC}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width:  '100%',
            height: '100%',
            display: 'block',
            transform: `translateX(${bgX}px)`,
          }}
        />
     )}

      {cSetup && (
        <div style={{ position: 'absolute', inset: 0, opacity: frameOp, pointerEvents: 'none' }}>
          <Img
            src={ICON_BASE_SRC}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
          />
          {anchor.kind === 'icon' ? (
            <div
              style={{
                position: 'absolute',
                left: PANEL_CX - PANEL_ICON_SIZE / 2,
                top:  PANEL_CY - PANEL_ICON_SIZE / 2,
                width:  PANEL_ICON_SIZE,
                height: PANEL_ICON_SIZE,
              }}
            >
              <Img
                src={staticFile(`icons/${anchor.id}.svg`)}
                alt=""
                style={{ width: PANEL_ICON_SIZE, height: PANEL_ICON_SIZE }}
              />
            </div>
         ) : (
            <div
              style={{
                position: 'absolute',
                left: CHAR_LEFT,
                top:  CHAR_TOP,
                width:  CHAR_WIDTH,
                height: CHAR_HEIGHT,
                borderRadius: CHAR_RADIUS,
                overflow: 'hidden',
              }}
            >
              <Img
                src={staticFile(`characters/${anchor.id}.png`)}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: '50% 100%',
                  display: 'block',
                }}
              />
            </div>
         )}
        </div>
     )}

      {/* Three colour bands, each title + 2 details gated on its own reveal step */}
      {COLOURS.map((colour, i) => {
        const section = sections[i]!;
        const oneDetail = section.detailTexts.length === 1;
        const cTitle = titleCues[i];
        const cDetailA = detailACues[i];
        const cDetailB = detailBCues[i];
        return (
          <div key={colour} style={{ position: 'absolute', inset: 0 }}>
            {cTitle && (
              <TitlePill
                frame={frame}
                colour={colour}
                startFrame={f(cTitle.at)}
                durFrames={f(durOf(cTitle))}
                mainText={section.mainText}
                pulseFrames={titlePulseF[i]!}
              />
           )}
            {cDetailA && (
              <DetailShell
                frame={frame}
                colour={colour}
                startFrame={f(cDetailA.at)}
                durFrames={f(durOf(cDetailA))}
                rowOffset={oneDetail ? SHELL_ROW_GAP / 2 : 0}
                text={section.detailTexts[0]!}
                pulseFrames={detailAPulseF[i]!}
              />
           )}
            {cDetailB && section.detailTexts[1] && (
              <DetailShell
                frame={frame}
                colour={colour}
                startFrame={f(cDetailB.at)}
                durFrames={f(durOf(cDetailB))}
                rowOffset={SHELL_ROW_GAP}
                text={section.detailTexts[1]!}
                pulseFrames={detailBPulseF[i]!}
              />
           )}
          </div>
       );
      })}
    </AbsoluteFill>
 );
};
