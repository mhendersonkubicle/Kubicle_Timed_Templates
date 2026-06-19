// Auto-assembled lesson scenes for "Business Development in Professional Services", Lesson 1.
// Timing is SRT-derived (fit-timing.py) and pulses are SRT-detected (detect-rementions.py).

import { staticFile } from 'remotion';
import type { LessonTitleProps } from './LessonTitle';
import type { LessonGoalProps } from './LessonGoal';
import type { YinYang2PointsProps } from './YinYang2Points';
import type { WordDefinitionProps } from './WordDefinition';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { ComparativePoints2Props } from './ComparativePoints2';
import type { BigPoints3V1Props } from './BigPoints3V1';
import type { Timeline5TilesProps } from './Timeline5Tiles';
import type { CaseStudyIntroProps } from './CaseStudyIntro';
import type { Checklist5PillsProps } from './Checklist5Pills';
import type { BulletList6PillsProps } from './BulletList6Pills';
import type { LessonSummaryProps } from './LessonSummary';

export const FPS = 30;
export const TOTAL_SECONDS = 211.177;

// [start, end] in seconds, one per scene, in order.
export const SCENE_SPANS: [number, number][] = [
  [0.0,     22.898],
  [22.898,  32.397],
  [32.397,  43.428],
  [43.428,  52.23],
  [52.23,   74.364],
  [74.364,  92.571],
  [92.571,  116.258],
  [116.258, 143.639],
  [143.639, 153.788],
  [153.788, 168.349],
  [168.349, 187.532],
  [187.532, 211.177],
];

// -- Scene 1: LessonTitle -------------------------------------------------------
// Course identity frozen in course.json: icon strategic-consulting-businessdevelopment-dark
export const scene1: LessonTitleProps = {
  courseTitle: 'Business Development in Professional Services',
  lessonNumber: 1,
  lessonTitle: 'Introduction to Marketing in Professional Services',
  courseIconUrl: staticFile('icons/strategic-consulting-businessdevelopment-dark.svg'),
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'logo',  at: 2.16 },
      { target: 'label', at: 5.96 },
      { target: 'title', at: 12.7 },
      { target: 'badge', at: 19.78 },
    ],
    pulses: [],
  },
};

// -- Scene 2: LessonGoal --------------------------------------------------------
export const scene2: LessonGoalProps = {
  heading: 'Lesson Goal',
  goal: 'Explain what marketing means in professional services, and why reputation and relationships drive revenue.',
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2 },
      { target: 'heading', at: 1.41 },
      { target: 'goal',    at: 5.51 },
    ],
    pulses: [],
  },
};

// -- Scene 3: YinYang2Points ----------------------------------------------------
// Common misconception (advertising/social) vs actual meaning (broader/strategic).
// Icons are force-recoloured white by the template so -dark suffix is cosmetic.
export const scene3: YinYang2PointsProps = {
  leftTitle: 'Common View',
  rightTitle: 'Pro Services',
  leftBoxes: [
    { icon: 'marketing-and-advertising-advertising-dark', text: 'Advertising' },
    { icon: 'social-media-hashtag-phone-dark',            text: 'Social media' },
  ],
  rightBoxes: [
    { icon: 'arrows-expand-dark',                  text: 'Broader' },
    { icon: 'strategic-consulting-strategy-dark',  text: 'Strategic' },
  ],
  leftAccent:  '#0496FF',
  rightAccent: '#F865B0',
  timings: {
    sequence: [
      { target: 'setup',      at: 0.2 },
      { target: 'leftTitle',  at: 0.71 },
      { target: 'leftBox0',   at: 3.36 },
      { target: 'leftBox1',   at: 4.89 },
      { target: 'rightTitle', at: 5.93 },
      { target: 'rightBox0',  at: 8.64 },
      { target: 'rightBox1',  at: 9.49 },
    ],
    pulses: [],
  },
};

// -- Scene 4: WordDefinition -----------------------------------------------------
// Defining the single term "marketing concept" before expanding its implications.
export const scene4: WordDefinitionProps = {
  title: 'The Marketing Concept',
  description:
    'The principle that a firm succeeds by understanding client needs and meeting them better than its competitors.',
  timings: {
    sequence: [
      { target: 'setup',       at: 0.2 },
      { target: 'title',       at: 1.14 },
      { target: 'description', at: 4.06 },
    ],
    pulses: [],
  },
};

// -- Scene 5: Topic1Subtopics6 --------------------------------------------------
// Unpacking "client orientation" into 5 supporting facts, top to bottom.
// titleIcon on dark right panel -> -dark. Anchor on light left panel -> -light.
export const scene5: Topic1Subtopics6Props = {
  mainTitle: 'Client orientation',
  titleIcon:  'personal-development-focus-dark',
  details: [
    'Not a department or campaign',
    'Shapes how the firm behaves',
    'Advisory work bought on trust',
    'Buyers cannot inspect upfront',
    'Judged on reputation',
  ],
  anchor: { id: 'career-pathway-compass-light' },
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2 },
      { target: 'header',  at: 0.62 },
      { target: 'detail0', at: 1.63 },
      { target: 'detail1', at: 5.89 },
      { target: 'detail2', at: 9.85 },
      { target: 'detail3', at: 13.01 },
      { target: 'detail4', at: 18.26 },
    ],
    pulses: [],
  },
};

// -- Scene 6: ComparativePoints2 ------------------------------------------------
// Selling mindset (services-first) linked to client-centric (problem-first).
// Icons render AS-IS on dark shells -> -dark variant.
export const scene6: ComparativePoints2Props = {
  points: [
    { icon: 'sales-commercial-bestseller-dark', label: 'Selling Mindset' },
    { icon: 'customer-experience-target-dark',  label: 'Client-centric' },
  ],
  timings: {
    sequence: [
      { target: 'setup',      at: 0.2,  in: 2.4 },
      { target: 'leftPoint',  at: 1.75, in: 1.4 },
      { target: 'rightPoint', at: 9.23, in: 1.4 },
    ],
    pulses: [],
  },
};

// -- Scene 7: BigPoints3V1 ------------------------------------------------------
// Three parallel takeaways about how client-centric firms operate.
// Icons are force-recoloured white; -dark suffix is cosmetic.
export const scene7: BigPoints3V1Props = {
  points: [
    { icon: 'customer-experience-customersatisfaction-dark', label: 'Start with client goals' },
    { icon: 'leadership-partnership-dark',                   label: 'Partners lead marketing' },
    { icon: 'arrows-merge-dark',                             label: 'Roles blur together' },
  ],
  timings: {
    sequence: [
      { target: 'setup',  at: 0.2 },
      { target: 'point0', at: 2.28 },
      { target: 'point1', at: 11.07 },
      { target: 'point2', at: 15.07 },
    ],
    pulses: [],
  },
};

// -- Scene 8: Timeline5Tiles ----------------------------------------------------
// Sequential chain: reputation -> lowers risk -> relationships -> networks -> trust.
// Anchor icon auto-whitened by template. Re-mention pulse on step0 when "reputation"
// reappears in "that reputation forward" (cue 37, scene-relative 13.65s).
export const scene8: Timeline5TilesProps = {
  steps: [
    'Reputation signals quality',
    'Lowers client perceived risk',
    'Relationships carry forward',
    'Via networks and referrals',
    'Trust drives revenue',
  ],
  anchor: { kind: 'icon', id: 'reputation-badge-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'step0', at: 2.58 },
      { target: 'step1', at: 5.8 },
      { target: 'step2', at: 11.54 },
      { target: 'step3', at: 17.85 },
      { target: 'step4', at: 22.85 },
    ],
    pulses: [
      { target: 'step0', at: 13.65 },
    ],
  },
};

// -- Scene 9: CaseStudyIntro ----------------------------------------------------
// Establishing card for FinSage, the fictional firm followed throughout the course.
// Logo -light variant for the platinum/light card background.
export const scene9: CaseStudyIntroProps = {
  eyebrow: 'Case Study',
  logo: 'Company-FinSage-light',
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2 },
      { target: 'eyebrow', at: 1.21 },
      { target: 'logo',    at: 3.02 },
    ],
    pulses: [],
  },
};

// -- Scene 10: Checklist5Pills --------------------------------------------------
// FinSage detail: five facts ticked off top to bottom.
// Hero on light platinum background -> -light icon variant.
export const scene10: Checklist5PillsProps = {
  responsibilities: [
    'Strong technical reputation',
    'Grew mostly by accident',
    'Through referrals',
    'Wants deliberate growth',
    'No clear market view',
  ],
  hero: { kind: 'icon', id: 'job-portal-professional-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'item0', at: 1.06 },
      { target: 'item1', at: 3.52 },
      { target: 'item2', at: 5.54 },
      { target: 'item3', at: 9.21 },
      { target: 'item4', at: 11.94 },
    ],
    pulses: [],
  },
};

// -- Scene 11: BulletList6Pills (course outline, first lesson only) -------------
export const scene11: BulletList6PillsProps = {
  bullets: [
    { label: 'What marketing means for advisory' },
    { label: 'How services are bought and sold' },
    { label: 'How to analyse a market' },
    { label: 'Build a defensible market view' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'pill0', at: 1.73, in: 2.0 },
      { target: 'pill1', at: 4.56, in: 2.0 },
      { target: 'pill2', at: 8.45, in: 2.0 },
      { target: 'pill3', at: 14.16, in: 2.0 },
    ],
    pulses: [],
  },
};

// -- Scene 12: LessonSummary ----------------------------------------------------
export const scene12: LessonSummaryProps = {
  recaps: [
    'The marketing concept',
    'A client-centric orientation',
    'Reputation drives revenue',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.51 },
      { target: 'pill0', at: 5.79 },
      { target: 'pill1', at: 9.14 },
      { target: 'pill2', at: 15.59 },
    ],
    pulses: [],
  },
};
