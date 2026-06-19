import { staticFile } from 'remotion';
import type { LessonTitleProps } from './LessonTitle';
import type { WordDefinitionProps } from './WordDefinition';
import type { Cards5FallingProps } from './Cards5Falling';
import type { YinYang2PointsProps } from './YinYang2Points';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { CaseStudyIntroProps } from './CaseStudyIntro';
import type { Checklist5PillsProps } from './Checklist5Pills';
import type { LessonSummaryProps } from './LessonSummary';

// Lesson 4, "Marketing in Professional Services", "Core Principles of Marketing".
// courseId: citest-marketing.
//
// Timing is SRT-derived. The scene plan (projects/citest-marketing-l4/plan.json)
// was fed through script-pipeline/fit-timing.py: every scene span is an SRT cue
// boundary and every `at` is the introducing cue's start time (char-offset
// estimate) converted to scene-relative seconds. Re-mention pulses were detected
// with script-pipeline/detect-rementions.py (key-term anchors), never invented.
// Course identity (courseTitle + courseIcon) is frozen in
// projects/citest-marketing/course.json and copied verbatim here.

export const FPS = 30;
export const TOTAL_SECONDS = 133.361;

// [start, end] in seconds, one per scene, in order. Each boundary is an SRT cue start.
export const SCENE_SPANS: [number, number][] = [
  [0.0, 13.935],     // 1 LessonTitle
  [13.935, 29.798],  // 2 WordDefinition (value & exchange)
  [29.798, 41.944],  // 3 Cards5Falling (three sources of value)
  [41.944, 66.006],  // 4 YinYang2Points (weak vs strong value proposition)
  [66.006, 95.27],   // 5 Topic1Subtopics6 (client lifetime value)
  [95.27, 100.032],  // 6 CaseStudyIntro (FinSage)
  [100.032, 112.317],// 7 Checklist5Pills (FinSage through CLV)
  [112.317, 133.361],// 8 LessonSummary (closing recap)
];

// ── Scene 1, LessonTitle (lesson opener, mandatory) ──────────────────────────
// Course identity verbatim from course.json. The title elements resolve as cue 3
// ("In this lesson, we'll explain the core principles of marketing…") is spoken;
// the previous-lesson recap (cues 1-2) plays over the branded background (setup).
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
      { target: 'title', at: 9.82 },
      { target: 'badge', at: 12.11 },
    ],
    pulses: [],
  },
};

// ── Scene 2, WordDefinition (value & exchange) ───────────────────────────────
// Cue 5 (13.935) names "value"; cue 6 (18.882) delivers the exchange idea (the
// value of the outcome exceeds the fee). title fires at rel 0.0 (animated setup
// covers the open), description at rel 7.31 when the exchange is articulated.
// "value" is re-mentioned at cues 6 and 8 → title pulses (detect-rementions).
export const scene2: WordDefinitionProps = {
  title: 'Value',
  description: 'The outcome a client gains beyond the fee they pay',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'description', at: 7.31 },
    ],
    pulses: [
      { target: 'title', at: 7.52 },
      { target: 'title', at: 12.36 },
    ],
  },
};

// ── Scene 3, Cards5Falling (three sources of value) ──────────────────────────
// Cue 9 (29.798) names the three sources in turn: the decision, the risk avoided,
// the result achieved. Cards5Falling has NO setup target (setup: none); card0 is
// the first object and lands at rel 0.89 (no dead air). Distinct "-dark" icons
// for the Oxford-Blue card body.
export const scene3: Cards5FallingProps = {
  cards: [
    { title: 'Better decisions', icon: 'roadway-crossroad-dark' },
    { title: 'Risk avoided', icon: 'security-shield-dark' },
    { title: 'Result achieved', icon: 'arrows-target-dark' },
  ],
  timings: {
    sequence: [
      { target: 'card0', at: 0.89 },
      { target: 'card1', at: 3.31 },
      { target: 'card2', at: 5.03 },
    ],
    pulses: [],
  },
};

// ── Scene 4, YinYang2Points (weak vs strong value proposition) ───────────────
// Cues 12-13 (41.944) frame the value proposition; cue 14 (51.814, rel 9.87) "A
// weak value proposition lists services"; cue 15 (55.554, rel 13.61) "A strong
// one names the client's problem and the outcome the firm delivers". Side-complete
// order (weak fully, then strong). The value-proposition framing (cues 12-13)
// narrates while the YinYang scaffold (panels + empty bars + boxes) slides in —
// that staging covers the lead-in before the contrast lands. Icons force to white
// (Pattern B), so the -dark suffix is cosmetic.
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
      { target: 'setup', at: 0.2, in: 2.5 },
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
// header (the topic frame) reveals at rel 0.0; the six details track the
// consequence cues 17-24. The term "client lifetime value" is first NAMED at cue
// 19 (rel 11.27), well after the header reveal, so the header carries a brand
// pulse at rel 11.27 (detect-rementions). titleIcon -dark on the oxford header
// pill; anchor -light on the platinum left panel (icon-contrast rule).
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
      { target: 'detail1', at: 5.01 },
      { target: 'detail2', at: 13.55 },
      { target: 'detail3', at: 17.03 },
      { target: 'detail4', at: 20.97 },
      { target: 'detail5', at: 23.36 },
    ],
    pulses: [{ target: 'header', at: 11.27 }],
  },
};

// ── Scene 6, CaseStudyIntro (FinSage establishing card) ──────────────────────
// Cue 25 (95.27) introduces the FinSage worked example. A company is a LOGO, not
// an icon: the -light FinSage wordmark on the light platinum card. Establishing
// card reveals at scene open (animated setup): setup → eyebrow → logo.
export const scene6: CaseStudyIntroProps = {
  eyebrow: 'Case Study',
  logo: 'Company-FinSage-light',
  timings: {
    sequence: [
      { target: 'setup', at: 0.0 },
      { target: 'eyebrow', at: 0.2 },
      { target: 'logo', at: 1.47 },
    ],
    pulses: [],
  },
};

// ── Scene 7, Checklist5Pills (FinSage through client lifetime value) ─────────
// The case-study DETAIL scene (icon-left, bullets-right) the CaseStudyIntro
// guidance calls for. Items track cues 26-28: viewed through CLV the picture
// changes, a few clients drive most revenue, focus marketing where it pays. hero
// icon renders on the light stage, so -light is correct.
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
      { target: 'item0', at: 0.0 },
      { target: 'item1', at: 3.86 },
      { target: 'item2', at: 8.91 },
    ],
    pulses: [],
  },
};

// ── Scene 8, LessonSummary (closing recap) ───────────────────────────────────
// Cues 30-32 recap the three takeaways in order: value and exchange, the value
// proposition, client lifetime value. title at rel 0.0, pills on their cues.
export const scene8: LessonSummaryProps = {
  recaps: ['Value and exchange', 'The value proposition', 'Client lifetime value'],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 5.22 },
      { target: 'pill1', at: 7.68 },
      { target: 'pill2', at: 12.69 },
    ],
    pulses: [],
  },
};
