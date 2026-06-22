import { staticFile } from 'remotion';
import type { LessonTitleProps } from './LessonTitle';
import type { ComparativePoints2Props } from './ComparativePoints2';
import type { IconPointsV1Props } from './IconPointsV1';
import type { WordDefinitionProps } from './WordDefinition';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { CaseStudyIntroProps } from './CaseStudyIntro';
import type { Checklist5PillsProps } from './Checklist5Pills';
import type { BulletList6PillsProps } from './BulletList6Pills';
import type { LessonSummaryProps } from './LessonSummary';

// ─── Lesson-wide timing constants ────────────────────────────────────────────
export const FPS = 30;

// Scene spans (seconds) from fit-timing.py, SRT-derived. [start, end] absolute.
export const SCENE_SPANS: ReadonlyArray<readonly [number, number]> = [
  [0.0, 13.353],
  [13.353, 28.342],
  [28.342, 42.96],
  [42.96, 60.771],
  [60.771, 111.823],
  [111.823, 121.947],
  [121.947, 169.98],
  [169.98, 195.929],
  [195.929, 214.216],
];

export const TOTAL_SECONDS = 214.216;

// ─── Scene 1: LessonTitle (mandatory opener; front-loaded) ───────────────────
// Course identity (title + icon) is fixed for the whole course and reused
// verbatim: courseTitle exactly as registered, course icon = documents-clipboard-dark.
export const scene1: LessonTitleProps = {
  courseTitle: 'Requirements Documentation and Traceability',
  lessonNumber: 1,
  lessonTitle: 'The Strategic Value of Requirements',
  courseIconUrl: staticFile('icons/documents-clipboard-dark.svg'),
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'logo', at: 0.7 },
      { target: 'label', at: 1.3 },
      { target: 'title', at: 1.9 },
      { target: 'badge', at: 2.5 },
    ],
    pulses: [],
  },
};

// ─── Scene 2: ComparativePoints2 (strategic intent <-> operational teams) ────
export const scene2: ComparativePoints2Props = {
  points: [
    { icon: 'decisions-strategy-dark', label: 'Strategic intent' },
    { icon: 'team-building-teamwork-dark', label: 'Operational teams' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftPoint', at: 9.95 },
      { target: 'rightPoint', at: 11.66 },
    ],
    pulses: [],
  },
};

// ─── Scene 3: IconPointsV1 (failure modes of poor requirements) ──────────────
export const scene3: IconPointsV1Props = {
  pills: [
    { label: 'Scope creep', icon: 'arrows-expand-light' },
    { label: 'Budget overruns', icon: 'control-your-cost-budget-light' },
    { label: 'Unused products', icon: 'product-recommendation-box-light' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'pill0', at: 10.09 },
      { target: 'pill1', at: 10.82 },
      { target: 'pill2', at: 12.01 },
    ],
    pulses: [],
  },
};

// ─── Scene 4: WordDefinition (Single Source of Truth) ────────────────────────
export const scene4: WordDefinitionProps = {
  title: 'Single Source of Truth',
  description:
    'A codified agreement between the business stakeholders, who possess the need, and the technical teams, who possess the solution.',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 2.39 },
      { target: 'description', at: 4.3 },
    ],
    pulses: [],
  },
};

// ─── Scene 5: Topic1Subtopics6 (the Business Analysis Mindset) ───────────────
// Lengthy concept scene: the header term ("mindset") is re-spoken at 19.51s and
// 41.15s, so header carries SRT-derived re-mention pulses (detect-rementions).
export const scene5: Topic1Subtopics6Props = {
  mainTitle: 'Analysis Mindset',
  titleIcon: 'mindset-thinking-dark',
  details: [
    'Prioritizes value over templates',
    'Looks beyond the request',
    'Thinks holistically across the org',
    'Aligns diverse stakeholders',
    'Preserves organizational memory',
  ],
  anchor: { id: 'business-strategy-lightbulb-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'header', at: 5.59 },
      { target: 'detail0', at: 8.85 },
      { target: 'detail1', at: 28.92 },
      { target: 'detail2', at: 32.15 },
      { target: 'detail3', at: 41.56 },
      { target: 'detail4', at: 44.13 },
    ],
    pulses: [
      { target: 'header', at: 19.51 },
      { target: 'header', at: 41.15 },
    ],
  },
};

// ─── Scene 6: CaseStudyIntro (Lumina Consulting) ─────────────────────────────
// Logo is a fictional company logo from Logos/, NOT an icon.
export const scene6: CaseStudyIntroProps = {
  eyebrow: 'Case Study',
  logo: 'Company-CoreSage-light',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'eyebrow', at: 2.11 },
      { target: 'logo', at: 9.08 },
    ],
    pulses: [],
  },
};

// ─── Scene 7: Checklist5Pills (Project Polaris real needs) ───────────────────
export const scene7: Checklist5PillsProps = {
  responsibilities: [
    'Reduce client churn',
    'Attract younger investors',
    'Replace paper reporting',
    'Deliver a real-time portal',
  ],
  hero: { kind: 'icon', id: 'productivity-dashboard-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'item0', at: 27.16 },
      { target: 'item1', at: 28.67 },
      { target: 'item2', at: 33.39 },
      { target: 'item3', at: 36.26 },
    ],
    pulses: [],
  },
};

// ─── Scene 8: BulletList6Pills (course outline; first lesson only) ───────────
export const scene8: BulletList6PillsProps = {
  bullets: [
    { label: 'Four-tier requirements architecture' },
    { label: 'Product versus project scope' },
    { label: 'The elicitation lifecycle' },
    { label: 'Visual modeling techniques' },
    { label: 'Predictive BRDs vs adaptive Backlogs' },
    { label: 'The Traceability Matrix' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'pill0', at: 6.65 },
      { target: 'pill1', at: 8.01 },
      { target: 'pill2', at: 11.9 },
      { target: 'pill3', at: 13.76 },
      { target: 'pill4', at: 15.16 },
      { target: 'pill5', at: 20.11 },
    ],
    pulses: [],
  },
};

// ─── Scene 9: LessonSummary (closing recap) ──────────────────────────────────
export const scene9: LessonSummaryProps = {
  recaps: [
    'Documentation as nervous system',
    'The Business Analysis Mindset',
    'Project Polaris case study',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 7.32 },
      { target: 'pill1', at: 9.87 },
      { target: 'pill2', at: 13.02 },
    ],
    pulses: [],
  },
};
