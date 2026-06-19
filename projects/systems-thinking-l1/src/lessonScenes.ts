// Auto-authored lesson scene data for the "Systems Thinking, Lesson 1" bench.
//
// SCENE_SPANS are [start, end] in SECONDS, derived from lesson1.srt by matching
// the first words of each scene's linearizedVO to the cue that speaks them.
// Scenes run consecutively: scene k end = scene k+1 start; scene 10 ends at the
// final cue end. FPS = 30. TOTAL_SECONDS = final cue end.
//
// Per-scene props are mapped from scene-plan.json slots onto each template's
// REAL schema. timings.sequence times are SCENE-RELATIVE seconds. `pulses` are
// intentionally left empty for every scene (the parent runs re-mention
// detection separately).

import type { LessonTitleProps }        from './LessonTitle';
import type { Timeline5TilesProps }     from './Timeline5Tiles';
import type { YinYang2PointsProps }     from './YinYang2Points';
import type { Process5StepsProps }      from './Process5Steps';
import type { Points3Subtopics2Props }  from './Points3Subtopics2';
import type { WordDefinitionProps }     from './WordDefinition';
import type { ComparativePoints2Props } from './ComparativePoints2';
import type { SplitscreenPointsV1Props } from './SplitscreenPointsV1';
import type { BulletList6PillsProps }   from './BulletList6Pills';
import type { LessonSummaryProps }      from './LessonSummary';

export const FPS = 30;

// ─── Scene spans (seconds) ────────────────────────────────────────────────────
// start matched-VO-snippet -> SRT cue:
//  1 LessonTitle        0.000   "Lesson 1: A Different Way of Thinking."   (cue 1)
//  2 Timeline5Tiles    20.276   "Let's begin with an example."            (cue 6)
//  3 YinYang2Points    41.503   "The problem is linear thinking."         (cue 14)
//  4 Flywheel4Petals   76.100   "In our customer service example,"        (cue 23)
//  5 Points3Subtopics2 100.624  "So, how do we know when a problem is..." (cue 28)
//  6 WordDefinition    160.263  "To tackle systemic problems,"            (cue 43)
//  7 ComparativePoints2 175.566 "'Systems thinking' is an extension..."   (cue 47)
//  8 SplitscreenPoints 192.098  "It's worth being clear about what..."    (cue 51)
//  9 BulletList6Pills  212.721  "In this course, we'll define what a..."  (cue 56)
// 10 LessonSummary     251.901  "Let's stop the lesson here."             (cue 65)
//    final cue end     269.316  (cue 70)
export const SCENE_SPANS: ReadonlyArray<readonly [number, number]> = [
  [0.000, 20.276],
  [20.276, 41.503],
  [41.503, 76.100],
  [76.100, 100.624],
  [100.624, 160.263],
  [160.263, 175.566],
  [175.566, 192.098],
  [192.098, 212.721],
  [212.721, 251.901],
  [251.901, 269.316],
];

export const TOTAL_SECONDS = 269.316;

// Loose cast helper: the zod-defaulted `in` field makes the inferred sequence
// element type strict (in required). Author times with `in` optional and cast.
type Seq = { target: string; at: number; in?: number }[];
const seq = (s: Seq) => s as unknown as { target: never; at: number; in: number }[];

// ─── Scene 1, LessonTitle (chrome / single-beat opener) ───────────────────────
// Title card: front-load the whole build within ~1.5 s. No spoken per-element
// cue; logo/label/title/badge are all chrome.
export const scene1: LessonTitleProps = {
  courseTitle: 'Systems Thinking',
  lessonNumber: 1,
  lessonTitle: 'A Different Way of Thinking',
  timings: {
    sequence: seq([
      { target: 'setup', at: 0.2, in: 0.6 },
      { target: 'logo',  at: 0.5 },
      { target: 'label', at: 0.8 },
      { target: 'title', at: 1.1, in: 0.6 },
      { target: 'badge', at: 1.5 },
    ]),
    pulses: [],
  },
};

// ─── Scene 2, Timeline5Tiles (4 steps) ────────────────────────────────────────
// Span 20.276 -> 41.503. Cues within: setup chrome early; steps cued.
//  step0 "Under pressure"        cue 7  @23.180 "...team is under pressure" -> ~2.9
//  step1 "Hire more staff"       cue 9  @28.196 "...hire more staff"        -> ~7.9
//  step2 "Brief relief"          cue 9  @28.196 "For a few weeks, things"   -> ~11.0 (cue10 @33.302 "improve")
//  step3 "Backlog returns worse" cue 11 @33.862 "Six months later...backlog"-> ~13.6
export const scene2: Timeline5TilesProps = {
  steps: ['Under pressure', 'Hire more staff', 'Brief relief', 'Backlog returns worse'],
  anchor: { kind: 'icon', id: 'business-strategy-network-light' },
  timings: {
    sequence: seq([
      { target: 'setup', at: 0.2, in: 1.4 },
      { target: 'step0', at: 2.9 },
      { target: 'step1', at: 7.9 },
      { target: 'step2', at: 11.0 },
      { target: 'step3', at: 13.6 },
    ]),
    pulses: [],
  },
};

// ─── Scene 3, YinYang2Points (2 + 2) ──────────────────────────────────────────
// Span 41.503 -> 76.100 (scene start = cue 14 @41.503).
//  leftTitle "Where linear thinking works"  cue 16 @49.537 "It works well..."   -> ~8.0
//  leftBox0  "Broken equipment"             cue 17 @53.868 "broken...equipment" -> ~12.4
//  leftBox1  "Missing data point"           cue 17 @53.868 "single missing...data"-> ~14.5
//  rightTitle "Where it fails"              cue 18 @57.478 "However, most prof." -> ~16.0
//  rightBox0 "Many actors, pressures"       cue 19 @1:02.036 "multiple actors"   -> ~20.5
//  rightBox1 "Slow, wrong outcomes"         cue 21 @1:10.717 "wrong over time"   -> ~29.2
export const scene3: YinYang2PointsProps = {
  // Titles <=18 chars, captions <=16 chars: single word or short 2-4 word phrase
  // so nothing overflows the title bar / footer boxes (template char-limit rule).
  leftTitle: 'Where it works',
  rightTitle: 'Where it fails',
  leftBoxes: [
    { icon: 'construction-wrench-light',     text: 'Equipment' },
    { icon: 'database-and-servers-api-light', text: 'Missing data' },
  ],
  rightBoxes: [
    { icon: 'business-strategy-team-light', text: 'Many actors' },
    { icon: 'finance-hourglass-light',      text: 'Wrong over time' },
  ],
  timings: {
    sequence: seq([
      { target: 'setup',      at: 0.2, in: 1.6 },
      { target: 'leftTitle',  at: 8.0 },
      { target: 'leftBox0',   at: 12.4 },
      { target: 'leftBox1',   at: 14.5 },
      { target: 'rightTitle', at: 16.0 },
      { target: 'rightBox0',  at: 20.5 },
      { target: 'rightBox1',  at: 29.2 },
    ]),
    // (no re-mention pulse: the old pulse keyed off the title text 'linear
    // thinking', which the shortened 'Where it works' title no longer carries.)
    pulses: [],
  },
};

// ─── Scene 4, Flywheel4Petals (4 petals) ──────────────────────────────────────
// Span 76.100 -> 100.624 (scene start = cue 23 @76.100).
// Hub title/subtitle/centerIcon are chrome (setup). Petals cued:
//  petal0 "Add Staff"        cue 23 @76.100 "adding staff reduced..."      -> ~1.6
//  petal1 "Pressure Drops"   cue 24 @80.698 "reduced pressure changed..."  -> ~4.6
//  petal2 "Priorities Shift" cue 24 @80.698 "...how leadership prioritised"-> ~6.5
//  petal3 "Problem Returns"  cue 27 @94.769 "the problem returned"         -> ~18.7
export const scene4: Process5StepsProps = {
  // The 'fix that failed' is a one-time causal chain, NOT a self-reinforcing
  // system, so it uses a linear chevron process (not the Flywheel cycle).
  // Labels <=14 chars; icons are -dark (light artwork) so they read on the
  // dark oxford-blue chevrons (icon-contrast rule).
  steps: [
    { label: 'Add staff',      icon: 'business-strategy-team-dark' },
    { label: 'Pressure eases', icon: 'check-mark-computer-dark' },
    { label: 'Urgency gone',   icon: 'signal-cancel-dark' },
    { label: 'Problem back',   icon: 'arrows-refresh-dark' },
  ],
  timings: {
    sequence: seq([
      { target: 'setup', at: 0.2, in: 1.2 },
      { target: 'step0', at: 1.6 },
      { target: 'step1', at: 4.6 },
      { target: 'step2', at: 6.5 },
      { target: 'step3', at: 18.7 },
    ]),
    pulses: [],
  },
};

// ─── Scene 5, Points3Subtopics2 (3 bands x 2 details) ─────────────────────────
// Span 100.624 -> 160.263 (scene start = cue 28 @100.624).
// setup chrome early. Bands cued:
//  title0 "Problem returns"     cue 30 @107.383 "The first is that the same..." -> ~6.8
//  detail0a                     cue 30 @107.383 "...same problem keeps returning"-> ~7.5
//  detail0b                     cue 31 @111.852 "If a solution that worked..."  -> ~11.2
//  title1 "Teams blame others"  cue 33 @119.947 "The second signal..."         -> ~19.3
//  detail1a                     cue 34 @124.063 "experience...differently"      -> ~23.4
//  detail1b                     cue 36 @131.127 "in the interactions between..."-> ~30.5
//  title2 "Fixes backfire"      cue 38 @139.244 "The third is..."              -> ~38.6
//  detail2a                     cue 39 @143.006 "If every fix creates a new..." -> ~42.4
//  detail2b                     cue 39 @143.006 "the system is pushing back"    -> ~46.6
export const scene5: Points3Subtopics2Props = {
  sections: [
    {
      mainText: 'Problem returns',
      detailTexts: ['Same issue recurs after a fix', 'Old solutions no longer work'],
    },
    {
      mainText: 'Teams blame others',
      detailTexts: ['Each part sees the problem differently', 'Fault lies between teams, not within'],
    },
    {
      mainText: 'Fixes backfire',
      detailTexts: ['Each fix creates a new problem', 'The system pushes back on changes'],
    },
  ],
  anchor: { kind: 'icon', id: 'check-mark-magnifyingglass-dark' },
  timings: {
    sequence: seq([
      { target: 'setup',    at: 0.2, in: 1.8 },
      { target: 'title0',   at: 6.8 },
      { target: 'detail0a', at: 7.5 },
      { target: 'detail0b', at: 11.2 },
      { target: 'title1',   at: 19.3 },
      { target: 'detail1a', at: 23.4 },
      { target: 'detail1b', at: 30.5 },
      { target: 'title2',   at: 38.6 },
      { target: 'detail2a', at: 42.4 },
      { target: 'detail2b', at: 46.6 },
    ]),
    pulses: [{ target: 'title1', at: 25.05 }, { target: 'title2', at: 46.65 }],
  },
};

// ─── Scene 6, WordDefinition ──────────────────────────────────────────────────
// Span 160.263 -> 175.566 (scene start = cue 43 @160.263).
// setup chrome; title is cued, description cued.
//  title "Systems thinking"   cue 43 @160.263 "we'll use 'systems thinking'" -> ~3.0
//  description                cue 44 @164.303 "Systems thinking is a..."      -> ~4.0
export const scene6: WordDefinitionProps = {
  title: 'Systems thinking',
  description:
    'A discipline focused on structures, relationships, and patterns of behaviour over time, rather than individual events and single causes.',
  timings: {
    sequence: seq([
      { target: 'setup',       at: 0.2, in: 0.6 },
      { target: 'title',       at: 3.0, in: 0.8 },
      { target: 'description', at: 4.0, in: 0.8 },
    ]),
    pulses: [],
  },
};

// ─── Scene 7, ComparativePoints2 (2 points) ───────────────────────────────────
// Span 175.566 -> 192.098 (scene start = cue 47 @175.566).
// setup chrome (bg + chain connector). Points cued:
//  leftPoint "Analytical thinking" cue 48 @179.281 "Where analytical thinking" -> ~3.7
//  rightPoint "Systems thinking"   cue 48 @179.281 "...systems thinking asks"   -> ~6.5
export const scene7: ComparativePoints2Props = {
  points: [
    { icon: 'critical-thinking-analysis-dark', label: 'Analytical thinking' },
    { icon: 'network-system-dark',             label: 'Systems thinking' },
  ],
  timings: {
    sequence: seq([
      { target: 'setup',      at: 0.2, in: 1.4 },
      { target: 'leftPoint',  at: 3.7 },
      { target: 'rightPoint', at: 6.5 },
    ]),
    pulses: [{ target: 'leftPoint', at: 10.32 }],
  },
};

// ─── Scene 8, SplitscreenPointsV1 (2 + 2) ─────────────────────────────────────
// Span 192.098 -> 212.721 (scene start = cue 51 @192.098).
// setup chrome (dark panel pans in). Cued:
//  leftTitle "What it is not"         cue 51 @192.098 "...systems thinking is not"  -> ~1.5
//  leftPill0 "Not every variable"     cue 51 @192.098 "It isn't a method analysing"-> ~3.2
//  leftPill1 "Not big diagrams"       cue 52 @196.461 "building elaborate diagrams"-> ~8.6
//  rightTitle "What it is"            cue 54 @203.198 "It's a practical discipline"-> ~11.1
//  rightPill0 "Practical discipline"  cue 54 @203.198 "a practical discipline"     -> ~11.5
//  rightPill1 "Accessible vocabulary" cue 54 @203.198 "the vocabulary it uses..."  -> ~13.5
export const scene8: SplitscreenPointsV1Props = {
  left: {
    title: 'What it is not',
    pills: [
      { text: 'Not every variable', icon: 'science-magnifyingglass-dark' },
      { text: 'Not big diagrams',   icon: 'info-diagram-dark' },
    ],
  },
  right: {
    title: 'What it is',
    pills: [
      { text: 'Practical discipline',  icon: 'construction-toolbox-dark' },
      { text: 'Accessible vocabulary', icon: 'grammar-vocabulary-dark' },
    ],
  },
  timings: {
    sequence: seq([
      { target: 'setup',      at: 0.2, in: 1.0 },
      { target: 'leftTitle',  at: 1.5 },
      { target: 'leftPill0',  at: 3.2 },
      { target: 'leftPill1',  at: 8.6 },
      { target: 'rightTitle', at: 11.1 },
      { target: 'rightPill0', at: 11.5 },
      { target: 'rightPill1', at: 13.5 },
    ]),
    pulses: [],
  },
};

// ─── Scene 9, BulletList6Pills (3 pills) ──────────────────────────────────────
// Span 212.721 -> 251.901 (scene start = cue 56 @212.721).
//  pill0 "The building blocks of a system" cue 56 @212.721 "define what a system is" -> ~0.4
//  pill1 "The behaviours systems produce"  cue 58 @221.569 "We'll then explore..."   -> ~8.8
//  pill2 "Applying a systems lens at work"  cue 60 @231.068 "Finally, we'll discuss"  -> ~18.3
export const scene9: BulletList6PillsProps = {
  bullets: [
    { label: 'The building blocks of a system' },
    { label: 'The behaviours systems produce' },
    { label: 'Applying a systems lens at work' },
  ],
  timings: {
    sequence: seq([
      { target: 'pill0', at: 0.4 },
      { target: 'pill1', at: 8.8 },
      { target: 'pill2', at: 18.3 },
    ]),
    pulses: [],
  },
};

// ─── Scene 10, LessonSummary (3 pills) ────────────────────────────────────────
// Span 251.901 -> 269.316 (scene start = cue 65 @251.901).
// setup chrome (bg) + title chrome (locked "Lesson Summary"). Pills cued:
//  pill0 "Limits of linear thinking"     cue 66 @254.037 "we first examined why linear"-> ~2.1
//  pill1 "Signals of a systemic problem" cue 68 @261.049 "the signals that tell us..." -> ~9.1
//  pill2 "What systems thinking is"      cue 70 @265.879 "Finally, we clarified what..."-> ~14.0
export const scene10: LessonSummaryProps = {
  recaps: [
    'Limits of linear thinking',
    'Signals of a systemic problem',
    'What systems thinking is',
  ],
  timings: {
    sequence: seq([
      { target: 'setup', at: 0.2, in: 0.6 },
      { target: 'title', at: 0.6, in: 0.45 },
      { target: 'pill0', at: 2.1 },
      { target: 'pill1', at: 9.1 },
      { target: 'pill2', at: 14.0 },
    ]),
    pulses: [],
  },
};
