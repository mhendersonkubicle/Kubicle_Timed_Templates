import { staticFile } from 'remotion';
import type { LessonTitleProps } from './LessonTitle';
import type { WordDefinitionProps } from './WordDefinition';
import type { Cards5FallingProps } from './Cards5Falling';
import type { YinYang2PointsProps } from './YinYang2Points';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { CaseStudyIntroProps } from './CaseStudyIntro';
import type { Checklist5PillsProps } from './Checklist5Pills';
import type { LessonSummaryProps } from './LessonSummary';

// Lesson 4, Marketing in Professional Services, Core Principles of Marketing.
// Timing is SRT-derived (lesson.srt / Chapter_4.srt): every scene span is an SRT
// cue boundary and every `at` is the introducing cue's start time converted to
// scene-relative seconds.
//
// QA fix at assembly: the bench draft folded the "value and exchange" principle
// (cues 5 to 8) and the "three sources of value" (cues 9 to 10) into one
// Cards5Falling scene. Cards5Falling has a no-op setup (staging: none), so its
// first card did not land until ~16.75 s into the scene, leaving a long blank
// stage while value and exchange were narrated, a no-dead-air violation. Per the
// no-dead-air principle (add a scene when no staging-capable template fits the
// lead-in), the beat was split: WordDefinition (animated setup) carries the value
// and exchange definition, then Cards5Falling carries the three sources with its
// first card at rel 0.887 s. This also aligns the scene plan with the lesson's
// own summary, which names "value and exchange" as a distinct takeaway.

export const FPS = 30;

// Scene spans (scene-relative seconds run from each span start). Each boundary is
// an SRT cue start time.
export const SCENE_SPANS: [number, number][] = [
  [0.0, 13.935],     // 1 LessonTitle
  [13.935, 29.798],  // 2 WordDefinition (value and exchange)
  [29.798, 41.944],  // 3 Cards5Falling (three sources of value)
  [41.944, 66.006],  // 4 YinYang2Points (weak vs strong value proposition)
  [66.006, 95.27],   // 5 Topic1Subtopics6 (client lifetime value)
  [95.27, 100.032],  // 6 CaseStudyIntro (FinSage)
  [100.032, 112.317],// 7 Checklist5Pills (FinSage through CLV)
  [112.317, 133.361],// 8 LessonSummary (closing recap)
];

export const TOTAL_SECONDS = 133.361;

// ── Scene 1, LessonTitle (lesson opener, mandatory) ──────────────────────────
// Course identity (courseTitle + courseIconUrl) copied verbatim from earlier
// lessons of this course, never re-derived.
export const scene1: LessonTitleProps = {
  courseTitle: 'Marketing in Professional Services',
  lessonNumber: 4,
  lessonTitle: 'Core Principles of Marketing',
  courseIconUrl: staticFile('icons/marketing-automation-megaphone-dark.svg'),
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'logo', at: 7.97 },
      { target: 'label', at: 8.84 },
      { target: 'title', at: 10.09 },
      { target: 'badge', at: 12.11 },
    ],
    pulses: [],
  },
};

// ── Scene 2, WordDefinition (value and exchange) ─────────────────────────────
// Cue 5 (13.935) names "value"; cue 6 (18.882) delivers the exchange idea (the
// value of the outcome exceeds the fee). title fires at rel 0.0, description at
// rel 4.947. Animated setup (banner drops, icon pill slides) covers the open.
export const scene2: WordDefinitionProps = {
  title: 'Value',
  description: 'The outcome a client gains beyond the fee they pay',
  timings: {
    sequence: [
      { target: 'setup', at: 0.0 },
      { target: 'title', at: 0.0 },
      { target: 'description', at: 4.947 },
    ],
    pulses: [],
  },
};

// ── Scene 3, Cards5Falling (three sources of value) ──────────────────────────
// Cue 9 (29.798) names the three sources in turn: the decision, the risk avoided,
// the result achieved. Cards5Falling has NO setup target; card0 is the first
// object and lands at rel 0.887 (no dead air), then each source follows at its
// sub-phrase. Each card needs a distinct "-dark" icon for the Oxford-Blue body.
export const scene3: Cards5FallingProps = {
  cards: [
    { title: 'Better decisions', icon: 'roadway-crossroad-dark' },
    { title: 'Risk avoided', icon: 'security-shield-dark' },
    { title: 'Result achieved', icon: 'arrows-target-dark' },
  ],
  timings: {
    sequence: [
      { target: 'card0', at: 0.887 },
      { target: 'card1', at: 3.307 },
      { target: 'card2', at: 5.027 },
    ],
    pulses: [],
  },
};

// ── Scene 4, YinYang2Points (weak vs strong value proposition) ───────────────
// Cue 12 to 13 define the value proposition; cue 14 (51.814, rel 9.87) "A weak
// value proposition lists services"; cue 15 (55.554, rel 13.61) "A strong one
// names the client's problem and the outcome the firm delivers". Side-complete
// order: the weak side fully, then the strong side. Icons force to white
// (Pattern B), so the -dark suffix is cosmetic; kept -dark for consistency.
export const scene4: YinYang2PointsProps = {
  leftTitle: 'Weak',
  rightTitle: 'Strong',
  leftBoxes: [{ icon: 'tasks-list-dark', text: 'Lists services' }],
  rightBoxes: [
    { icon: 'business-strategy-target-dark', text: 'Names problem' },
    { icon: 'data-analysis-outcome-dark', text: 'Delivers outcome' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.0 },
      { target: 'leftTitle', at: 9.87 },
      { target: 'leftBox0', at: 11.58 },
      { target: 'rightTitle', at: 13.61 },
      { target: 'rightBox0', at: 14.39 },
      { target: 'rightBox1', at: 16.23 },
    ],
    pulses: [],
  },
};

// ── Scene 5, Topic1Subtopics6 (client lifetime value) ────────────────────────
// header reveals at rel 0.0; the six details track the consequence cues 17 to 24.
// QA fix: "client lifetime value" (the header term) is first NAMED at cue 19
// (rel 9.134), more than ~2 to 3 s after the header reveal, so the header carries
// a brand pulse at rel 9.134 per the re-mention-pulse principle (the bench draft
// left this scene's pulses empty). Time taken straight from the SRT.
export const scene5: Topic1Subtopics6Props = {
  mainTitle: 'Client lifetime value',
  titleIcon: 'kpi-customerretention-dark',
  details: [
    'Looks beyond a single sale',
    'Returning clients are worth more',
    "It reframes the firm's economics",
    'Winning new clients is expensive',
    'Trusted relationships last for years',
    'Retention beats chasing new work',
  ],
  anchor: { id: 'business-strategy-handshake-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'header', at: 0.0 },
      { target: 'detail0', at: 1.6 },
      { target: 'detail1', at: 4.204 },
      { target: 'detail2', at: 13.192 },
      { target: 'detail3', at: 17.025 },
      { target: 'detail4', at: 19.5 },
      { target: 'detail5', at: 22.691 },
    ],
    pulses: [{ target: 'header', at: 9.134 }],
  },
};

// ── Scene 6, CaseStudyIntro (FinSage, the company logo lands) ────────────────
// Cue 25 (95.27) introduces the FinSage worked example. A company is a LOGO, not
// an icon: the -light FinSage logo on the light platinum card. Animated setup.
export const scene6: CaseStudyIntroProps = {
  eyebrow: 'Case Study',
  logo: 'Company-FinSage-light',
  timings: {
    sequence: [
      { target: 'setup', at: 0.0 },
      { target: 'eyebrow', at: 0.2 },
      { target: 'logo', at: 0.6 },
    ],
    pulses: [],
  },
};

// ── Scene 7, Checklist5Pills (FinSage observation through CLV) ───────────────
// The case-study detail scene named by the CaseStudyIntro guidance (icon-left,
// bullets-right, single colour). hero icon renders in native colours on the
// light stage, so -light is correct. Items track cues 25 to 28.
export const scene7: Checklist5PillsProps = {
  responsibilities: [
    'Measured one project at a time',
    'Few clients drive most revenue',
    'Focus marketing where it pays',
  ],
  hero: { kind: 'icon', id: 'kpi-revenuegrowth-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.0 },
      { target: 'item0', at: 0.5 },
      { target: 'item1', at: 3.86 },
      { target: 'item2', at: 8.04 },
    ],
    pulses: [],
  },
};

// ── Scene 8, LessonSummary (closing recap) ───────────────────────────────────
// Cues 30 to 32 recap the three takeaways in order: value and exchange, the value
// proposition, client lifetime value.
export const scene8: LessonSummaryProps = {
  recaps: ['Value and exchange', 'The value proposition', 'Client lifetime value'],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 3.46 },
      { target: 'pill1', at: 7.16 },
      { target: 'pill2', at: 10.66 },
    ],
    pulses: [],
  },
};
