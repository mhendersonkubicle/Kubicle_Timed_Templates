// Auto-assembled lesson scenes for "Marketing in Professional Services", Lesson 1.
// Timing is SRT-derived (fit-timing.py) and pulses are SRT-detected (detect-rementions.py).

import type { LessonTitleProps } from './LessonTitle';
import type { LessonGoalProps } from './LessonGoal';
import type { YinYang2PointsProps } from './YinYang2Points';
import type { WordDefinitionProps } from './WordDefinition';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { ComparativePoints2Props } from './ComparativePoints2';
import type { BigPoints3V1Props } from './BigPoints3V1';
import type { Process5StepsProps } from './Process5Steps';
import type { CaseStudyIntroProps } from './CaseStudyIntro';
import type { IconPointsV1Props } from './IconPointsV1';
import type { BulletList6PillsProps } from './BulletList6Pills';
import type { LessonSummaryProps } from './LessonSummary';

export const FPS = 30;
export const TOTAL_SECONDS = 211.177;

// [start, end] in seconds, one per scene, in order.
export const SCENE_SPANS: [number, number][] = [
  [0.0, 22.898],
  [22.898, 32.397],
  [32.397, 43.428],
  [43.428, 52.23],
  [52.23, 74.364],
  [74.364, 92.571],
  [92.571, 116.258],
  [116.258, 143.639],
  [143.639, 153.788],
  [153.788, 168.349],
  [168.349, 187.532],
  [187.532, 211.177],
];

// -- Scene 1: LessonTitle ------------------------------------------------------
export const scene1: LessonTitleProps = {
  courseTitle: 'Marketing in Professional Services',
  lessonNumber: 1,
  lessonTitle: 'What Marketing Means for Advisory Firms',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'logo', at: 0.0 },
      { target: 'label', at: 2.16 },
      { target: 'title', at: 4.09 },
      { target: 'badge', at: 8.79 },
    ],
    pulses: [],
  },
};

// -- Scene 2: LessonGoal -------------------------------------------------------
export const scene2: LessonGoalProps = {
  heading: 'Lesson Goal',
  goal: 'Explain what marketing means in professional services, and why reputation and relationships drive revenue.',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'heading', at: 1.41 },
      { target: 'goal', at: 5.25 },
    ],
    pulses: [],
  },
};

// -- Scene 3: YinYang2Points ---------------------------------------------------
export const scene3: YinYang2PointsProps = {
  leftTitle: 'Common View',
  rightTitle: 'Pro Services',
  leftBoxes: [
    { icon: 'marketing-and-advertising-advertising-dark', text: 'Advertising' },
    { icon: 'social-media-hashtag-phone-dark', text: 'Social media' },
  ],
  rightBoxes: [
    { icon: 'arrows-expand-dark', text: 'Broader' },
    { icon: 'strategy-outline-1-of-2-chesspiece-dark', text: 'Strategic' },
  ],
  leftAccent: '#0496FF',
  rightAccent: '#F865B0',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftTitle', at: 2.18 },
      { target: 'leftBox0', at: 3.36 },
      { target: 'leftBox1', at: 4.89 },
      { target: 'rightTitle', at: 5.67 },
      { target: 'rightBox0', at: 7.42 },
      { target: 'rightBox1', at: 9.49 },
    ],
    pulses: [],
  },
};

// -- Scene 4: WordDefinition ---------------------------------------------------
export const scene4: WordDefinitionProps = {
  title: 'The Marketing Concept',
  description:
    'The principle that a firm succeeds by understanding client needs and meeting them better than its competitors.',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.94 },
      { target: 'description', at: 2.13 },
    ],
    pulses: [],
  },
};

// -- Scene 5: Topic1Subtopics6 -------------------------------------------------
export const scene5: Topic1Subtopics6Props = {
  mainTitle: 'Client orientation',
  titleIcon: 'personal-development-focus-dark',
  details: [
    'Not a department or a campaign',
    'Shapes how the whole firm behaves',
    'Advisory work is bought on trust',
    'Buyers cannot inspect work upfront',
    'Judged on reputation and relationships',
  ],
  anchor: { id: 'career-pathway-compass-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'header', at: 0.0 },
      { target: 'detail0', at: 1.46 },
      { target: 'detail1', at: 5.89 },
      { target: 'detail2', at: 9.85 },
      { target: 'detail3', at: 12.5 },
      { target: 'detail4', at: 17.16 },
    ],
    pulses: [],
  },
};

// -- Scene 6: ComparativePoints2 -----------------------------------------------
export const scene6: ComparativePoints2Props = {
  points: [
    { icon: 'sales-commercial-bestseller-dark', label: 'Selling mindset' },
    { icon: 'customer-experience-customersatisfaction-dark', label: 'Client-centric' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftPoint', at: 2.68 },
      { target: 'rightPoint', at: 7.57 },
    ],
    pulses: [],
  },
};

// -- Scene 7: BigPoints3V1 -----------------------------------------------------
export const scene7: BigPoints3V1Props = {
  points: [
    { icon: 'customer-experience-target-dark', label: 'Start with the client' },
    { icon: 'leadership-partnership-dark', label: 'Led by partners' },
    { icon: 'arrows-merge-dark', label: 'Roles blur together' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'point0', at: 2.28 },
      { target: 'point1', at: 11.07 },
      { target: 'point2', at: 17.45 },
    ],
    pulses: [],
  },
};

// -- Scene 8: Process5Steps ----------------------------------------------------
export const scene8: Process5StepsProps = {
  steps: [
    { label: 'Reputation', icon: 'reputation-stars-dark' },
    { label: 'Lower Risk', icon: 'data-protection-shield-dark' },
    { label: 'Relations', icon: 'user-account-connect-dark' },
    { label: 'Trust', icon: 'business-strategy-handshake-dark' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'step0', at: 2.58 },
      { target: 'step1', at: 4.55 },
      { target: 'step2', at: 11.54 },
      { target: 'step3', at: 22.85 },
    ],
    pulses: [],
  },
};

// -- Scene 9: CaseStudyIntro ---------------------------------------------------
export const scene9: CaseStudyIntroProps = {
  // Simple establishing card: "CASE STUDY" + the FinSage logo, dead centre.
  // The FinSage detail/points live in the next scene (IconPointsV1).
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

// -- Scene 10: IconPointsV1 ----------------------------------------------------
export const scene10: IconPointsV1Props = {
  pills: [
    { label: 'Strong reputation', icon: 'reputation-badge-light' },
    { label: 'Grew by accident', icon: 'enterprise-growth-light' },
    { label: 'Via referrals', icon: 'user-experience-networkofpeople-light' },
    { label: 'Wants growth', icon: 'arrows-infographics-elements-growth-light' },
    { label: 'No market view', icon: 'marketing-and-advertising-marketresearch-light' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'pill0', at: 0.7 },
      { target: 'pill1', at: 3.52 },
      { target: 'pill2', at: 5.54 },
      { target: 'pill3', at: 9.21 },
      { target: 'pill4', at: 11.61 },
    ],
    pulses: [],
  },
};

// -- Scene 11: BulletList6Pills (course outline, first lesson only) ------------
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
      { target: 'pill0', at: 1.73 },
      { target: 'pill1', at: 4.56 },
      { target: 'pill2', at: 8.02 },
      { target: 'pill3', at: 14.16 },
    ],
    pulses: [],
  },
};

// -- Scene 12: LessonSummary ---------------------------------------------------
export const scene12: LessonSummaryProps = {
  recaps: [
    'The marketing concept',
    'A client-centric orientation',
    'Reputation drives revenue',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 4.19 },
      { target: 'pill1', at: 7.99 },
      { target: 'pill2', at: 13.91 },
    ],
    pulses: [],
  },
};
