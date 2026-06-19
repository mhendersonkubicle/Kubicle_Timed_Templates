// Auto-assembled lesson scenes for "Foundations of System Thinking", Lesson 6: Emergence.
// Timing is SRT-derived (fit-timing.py) and pulses are SRT-detected (detect-rementions.py).

import type { LessonTitleProps } from './LessonTitle';
import type { LessonGoalProps } from './LessonGoal';
import type { WordDefinitionProps } from './WordDefinition';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { BigPoints3V1Props } from './BigPoints3V1';
import type { ComparativePoints2Props } from './ComparativePoints2';
import type { YinYang2PointsProps } from './YinYang2Points';
import type { SplitscreenPointsV1Props } from './SplitscreenPointsV1';
import type { LessonSummaryProps } from './LessonSummary';

export const FPS = 30;
export const TOTAL_SECONDS = 182.776;

// [start, end] in seconds, one per scene, in order (from fit-timing spans).
export const SCENE_SPANS: [number, number][] = [
  [0.0,     3.229],
  [3.229,   10.591],
  [10.591,  20.994],
  [20.994,  49.88],
  [49.88,   69.524],
  [69.524,  98.784],
  [98.784,  115.435],
  [115.435, 162.9],
  [162.9,   182.776],
];

// ─── Scene 1, LessonTitle (opener, front-loaded) ──────────────────────────────
export const scene1: LessonTitleProps = {
  courseTitle: 'Systems Thinking',
  lessonNumber: 6,
  lessonTitle: 'Emergence',
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

// ─── Scene 2, LessonGoal (opener, front-loaded) ───────────────────────────────
export const scene2: LessonGoalProps = {
  goal: 'Define emergence and explain why emergent outcomes are difficult to predict in advance.',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'heading', at: 0.7 },
      { target: 'goal', at: 1.3 },
    ],
    pulses: [],
  },
};

// ─── Scene 3, WordDefinition (name-then-define) ───────────────────────────────
export const scene3: WordDefinitionProps = {
  title: 'Emergence',
  description:
    'Behaviour or outcomes that arise from the interactions between the parts of a system, that no part could produce alone.',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'description', at: 0.52 },
    ],
    pulses: [],
  },
};

// ─── Scene 4, Topic1Subtopics6 (one concept → discrete behaviours) ────────────
export const scene4: Topic1Subtopics6Props = {
  mainTitle: 'Team culture',
  titleIcon: 'teamwork-collaboration-dark',
  details: [
    'They communicate in certain ways',
    'They respond within set timeframes',
    'They handle conflict in set patterns',
  ],
  anchor: { id: 'user-experience-networkofpeople-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'header', at: 0.0 },
      { target: 'detail0', at: 5.21 },
      { target: 'detail1', at: 7.31 },
      { target: 'detail2', at: 10.47 },
    ],
    pulses: [{ target: 'header', at: 15.69 }],
  },
};

// ─── Scene 5, BigPoints3V1 (three parallel drivers) ───────────────────────────
export const scene5: BigPoints3V1Props = {
  points: [
    { icon: 'boss-hierarchy-dark', label: 'Structures' },
    { icon: 'job-promotion-trophy-dark', label: 'Incentives' },
    { icon: 'job-promotion-handshakeagreement-dark', label: 'Norms' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'point0', at: 2.5 },
      { target: 'point1', at: 9.8 },
      { target: 'point2', at: 17.1 },
    ],
    pulses: [],
  },
};

// ─── Scene 6, ComparativePoints2 (two halves of one instinct) ─────────────────
export const scene6: ComparativePoints2Props = {
  points: [
    { icon: 'reputation-recognition-dark', label: 'Who made it happen?' },
    { icon: 'hands-fingerpointing-dark', label: 'Who caused it?' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftPoint', at: 10.68 },
      { target: 'rightPoint', at: 15.36 },
    ],
    pulses: [],
  },
};

// ─── Scene 7, YinYang2Points (the central shift) ──────────────────────────────
export const scene7: YinYang2PointsProps = {
  leftTitle: 'Who caused this?',
  rightTitle: 'What produced it?',
  leftBoxes: [{ icon: 'hands-fingerpointing-dark', text: 'Blame a person' }],
  rightBoxes: [{ icon: 'network-system-dark', text: 'See the system' }],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftTitle', at: 5.67 },
      { target: 'leftBox0', at: 12.82 },
      { target: 'rightTitle', at: 14.3 },
      { target: 'rightBox0', at: 14.3 },
    ],
    pulses: [],
  },
};

// ─── Scene 8, SplitscreenPointsV1 (two-column deep comparison) ────────────────
export const scene8: SplitscreenPointsV1Props = {
  left: {
    title: 'Who caused this?',
    pills: [
      { text: 'Points to a person', icon: 'job-portal-person-dark' },
      { text: 'Fixes the symptom', icon: 'bots-fix-dark' },
      { text: 'Recurs in the role', icon: 'arrows-loop-dark' },
    ],
  },
  right: {
    title: 'What produced this?',
    pills: [
      { text: 'Interactions', icon: 'network-system-dark' },
      { text: 'Incentive structures', icon: 'business-motivation-award-dark' },
      { text: 'Feedback loops', icon: 'reviews-feedback-feedbackloop-dark' },
      { text: 'Delays', icon: 'time-management-hourglass-dark' },
    ],
  },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftTitle', at: 5.74 },
      { target: 'leftPill0', at: 8.12 },
      { target: 'leftPill1', at: 14.09 },
      { target: 'leftPill2', at: 20.69 },
      { target: 'rightTitle', at: 23.99 },
      { target: 'rightPill0', at: 26.27 },
      { target: 'rightPill1', at: 27.89 },
      { target: 'rightPill2', at: 29.57 },
      { target: 'rightPill3', at: 31.45 },
    ],
    pulses: [],
  },
};

// ─── Scene 9, LessonSummary (closing recap) ───────────────────────────────────
export const scene9: LessonSummaryProps = {
  recaps: [
    'Outcomes arise from interactions',
    'Why emergence surprises us',
    'Blame to structural analysis',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 2.72 },
      { target: 'pill1', at: 8.82 },
      { target: 'pill2', at: 13.0 },
    ],
    pulses: [],
  },
};
