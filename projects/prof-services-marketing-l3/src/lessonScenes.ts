// Auto-assembled lesson scenes for "Marketing in Professional Services", Lesson 3.
// "The Four Characteristics of Services".
// Timing is SRT-derived (fit-timing.py) and pulses are SRT-detected (detect-rementions.py).

import { staticFile } from 'remotion';

import type { LessonTitleProps } from './LessonTitle';
import type { LessonGoalProps } from './LessonGoal';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { FivePoints1SubtopicV2Props } from './FivePoints1SubtopicV2';
import type { SplitscreenPointsV1Props } from './SplitscreenPointsV1';
import type { CaseStudyIntroProps } from './CaseStudyIntro';
import type { Checklist5PillsProps } from './Checklist5Pills';
import type { LessonSummaryProps } from './LessonSummary';

export const FPS = 30;
export const TOTAL_SECONDS = 145.175;

// [start, end] in seconds, one per scene, in order (from fit-timing.py spans).
export const SCENE_SPANS: [number, number][] = [
  [0.0, 7.641],
  [7.641, 15.328],
  [15.328, 50.839],
  [50.839, 81.935],
  [81.935, 107.505],
  [107.505, 110.57],
  [110.57, 124.131],
  [124.131, 145.175],
];

// -- Scene 1: LessonTitle ------------------------------------------------------
export const scene1: LessonTitleProps = {
  courseTitle: 'Marketing Financial Services',
  lessonNumber: 3,
  lessonTitle: 'The Four Characteristics of Services',
  courseIconUrl: staticFile('icons/business-strategy-handshake-dark.svg'),
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'logo', at: 0.0 },
      { target: 'label', at: 1.38 },
      { target: 'title', at: 3.85 },
      { target: 'badge', at: 4.54 },
    ],
    pulses: [],
  },
};

// -- Scene 2: LessonGoal -------------------------------------------------------
export const scene2: LessonGoalProps = {
  goal: 'Identify the four characteristics of services and explain how each one shapes marketing.',
  heading: 'Lesson Goal',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'heading', at: 1.02 },
      { target: 'goal', at: 2.54 },
    ],
    pulses: [],
  },
};

// -- Scene 3: Topic1Subtopics6 -------------------------------------------------
export const scene3: Topic1Subtopics6Props = {
  mainTitle: 'Service traits',
  titleIcon: 'technical-support-handholdingwrench-dark',
  details: [
    'Intangibility',
    'Inseparability',
    'Variability',
    'Perishability',
  ],
  anchor: { id: 'mindset-quality-light' },
  timings: {
    // The four characteristics are named together (cues 6-7), then defined one
    // by one (cues 8-11). Preview-then-expand: reveal each as it is first named
    // (no dead air), then PULSE each as the narration returns to define it.
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'header', at: 2.7 },
      { target: 'detail0', at: 6.51 },
      { target: 'detail1', at: 6.51 },
      { target: 'detail2', at: 8.84 },
      { target: 'detail3', at: 8.84 },
    ],
    pulses: [
      { target: 'detail0', at: 16.65 },
      { target: 'detail1', at: 21.55 },
      { target: 'detail2', at: 26.96 },
      { target: 'detail3', at: 27.96 },
    ],
  },
};

// -- Scene 4: FivePoints1SubtopicV2 --------------------------------------------
export const scene4: FivePoints1SubtopicV2Props = {
  milestones: [
    { title: 'Intangibility', description: 'Hard to judge quality upfront', icon: 'data-privacy-hidden-dark' },
    { title: 'Inseparability', description: 'Team experience is the product', icon: 'leadership-partnership-dark' },
    { title: 'Variability', description: 'Inconsistent delivery hurts rep', icon: 'software-quality-dark' },
    { title: 'Perishability', description: 'Unsold time is lost revenue', icon: 'time-management-hourglass-dark' },
  ],
  anchor: { kind: 'icon', id: 'critical-thinking-warning-dark' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'card0', at: 3.83 },
      { target: 'tick0', at: 6.37 },
      { target: 'card1', at: 10.84 },
      { target: 'tick1', at: 14.97 },
      { target: 'card2', at: 16.51 },
      { target: 'tick2', at: 21.29 },
      { target: 'card3', at: 23.64 },
      { target: 'tick3', at: 28.64 },
    ],
    pulses: [],
  },
};

// -- Scene 5: SplitscreenPointsV1 ----------------------------------------------
export const scene5: SplitscreenPointsV1Props = {
  left: {
    title: 'Intangibility',
    pills: [
      { text: 'Show credentials', icon: 'reputation-badge-dark' },
      { text: 'Share case studies', icon: 'report-analysis-dark' },
      { text: 'Build a strong brand', icon: 'branding-identity-branding-dark' },
    ],
  },
  right: {
    title: 'Variability',
    pills: [
      { text: 'Standardise methods', icon: 'tasking-checklist-dark' },
      { text: 'Invest in training', icon: 'education-mortarboard-dark' },
    ],
  },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftTitle', at: 2.65 },
      { target: 'leftPill0', at: 6.4 },
      { target: 'leftPill1', at: 7.19 },
      { target: 'leftPill2', at: 8.23 },
      { target: 'rightTitle', at: 10.15 },
      { target: 'rightPill0', at: 11.86 },
      { target: 'rightPill1', at: 13.7 },
    ],
    pulses: [],
  },
};

// -- Scene 6: CaseStudyIntro ---------------------------------------------------
export const scene6: CaseStudyIntroProps = {
  eyebrow: 'Case Study',
  logo: 'Company-FinSage-light',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'eyebrow', at: 0.0 },
      { target: 'logo', at: 0.0 },
    ],
    pulses: [],
  },
};

// -- Scene 7: Checklist5Pills --------------------------------------------------
export const scene7: Checklist5PillsProps = {
  responsibilities: [
    'Keep advisors fully deployed',
    'Recover idle pipeline time',
    'Build a clearer market view',
  ],
  hero: { kind: 'icon', id: 'time-management-hourglass-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'item0', at: 1.86 },
      { target: 'item1', at: 5.17 },
      { target: 'item2', at: 6.62 },
    ],
    pulses: [],
  },
};

// -- Scene 8: LessonSummary ----------------------------------------------------
export const scene8: LessonSummaryProps = {
  recaps: [
    'Four characteristics of services',
    'The challenge each one creates',
    'How firms respond to them',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 4.05 },
      { target: 'pill1', at: 8.32 },
      { target: 'pill2', at: 12.34 },
    ],
    pulses: [],
  },
};
