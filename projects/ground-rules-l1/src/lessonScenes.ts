// Team Ground Rules, Lesson 1: What Ground Rules Are, and Why They Matter.
// First lesson of a course -> opens with LessonTitle and carries the
// first-lesson-only course-outline beat (BulletList6Pills). Timing is SRT-derived
// (each reveal `at` = the scene-relative second its content is first spoken),
// variety (10 distinct templates), no-dead-air, semantic fit, resolved icons.

import type { LessonTitleProps }        from './LessonTitle';
import type { ComparativePoints2Props } from './ComparativePoints2';
import type { LessonGoalProps }         from './LessonGoal';
import type { SplitscreenPointsV1Props } from './SplitscreenPointsV1';
import type { WordDefinitionProps }     from './WordDefinition';
import type { Points3Subtopics2Props }  from './Points3Subtopics2';
import type { Process5StepsProps }      from './Process5Steps';
import type { YinYang2PointsProps }     from './YinYang2Points';
import type { BulletList6PillsProps }   from './BulletList6Pills';
import type { LessonSummaryProps }      from './LessonSummary';

export const FPS = 30;

export const SCENE_SPANS: [number, number][] = [
  [0.0, 6.687],        // 1  title
  [6.687, 24.452],     // 2  the gap (comparison)
  [24.452, 34.09],     // 3  lesson goal
  [34.09, 71.849],     // 4  policies vs ground rules
  [71.849, 89.404],    // 5  definition
  [89.404, 173.646],   // 6  three benefits
  [173.646, 216.231],  // 7  cost of skipping
  [216.231, 253.337],  // 8  rules vs working agreement
  [253.337, 273.077],  // 9  course outline (first-lesson-only)
  [273.077, 305.424],  // 10 summary
];
export const TOTAL_SECONDS = 305.424;

export const scene1: LessonTitleProps = {
  courseTitle: 'Team Ground Rules',
  lessonNumber: 1,
  lessonTitle: 'What Ground Rules Are, and Why They Matter',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 0.6 },
      { target: 'logo',  at: 0.2 },
      { target: 'label', at: 0.6 },
      { target: 'title', at: 1.0 },
      { target: 'badge', at: 1.4 },
    ],
    pulses: [],
  },
};

// The gap: what teams know (task) vs what they agree (behavioural).
export const scene2: ComparativePoints2Props = {
  points: [
    { label: 'Task clarity',       icon: 'tasks-checklist-dark' },
    { label: 'Behavioral clarity', icon: 'teamwork-collaboration-dark' },
  ],
  timings: {
    sequence: [
      { target: 'setup',      at: 0.2, in: 1.2 },
      { target: 'leftPoint',  at: 1.5 },
      { target: 'rightPoint', at: 3.2 },
    ],
    pulses: [],
  },
};

export const scene3: LessonGoalProps = {
  heading: 'Lesson Goal',
  goal: 'Distinguish team ground rules from project policies, and explain their role in collaboration.',
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2, in: 0.7 },
      { target: 'heading', at: 0.3 },
      { target: 'goal',    at: 0.9 },
    ],
    pulses: [],
  },
};

// Side-complete comparison: policies fully, then ground rules.
export const scene4: SplitscreenPointsV1Props = {
  left: {
    title: 'Project policies',
    pills: [
      { text: 'Formal procedures', icon: 'content-creation-document-dark' },
      { text: 'Set by governance',  icon: 'boss-hierarchy-dark' },
      { text: 'Apply regardless',   icon: 'documents-lock-dark' },
    ],
  },
  right: {
    title: 'Ground rules',
    pills: [
      { text: 'Behavioral norms',  icon: 'business-ethics-behavior-dark' },
      { text: 'Set by the team',   icon: 'leadership-together-dark' },
      { text: 'How we work daily', icon: 'event-management-schedule-dark' },
    ],
  },
  timings: {
    sequence: [
      { target: 'setup',     at: 0.2, in: 0.75 },
      { target: 'leftTitle', at: 2.8 },
      { target: 'leftPill0', at: 3.5 },
      { target: 'leftPill1', at: 11.4 },
      { target: 'leftPill2', at: 15.9 },
      { target: 'rightTitle', at: 20.3 },
      { target: 'rightPill0', at: 20.8 },
      { target: 'rightPill1', at: 23.0 },
      { target: 'rightPill2', at: 32.0 },
    ],
    pulses: [],
  },
};

export const scene5: WordDefinitionProps = {
  title: 'Ground rules',
  description:
    'Agreed behavioral norms that govern how a team works together, distinct from project policies.',
  timings: {
    sequence: [
      { target: 'setup',       at: 0.2, in: 0.6 },
      { target: 'title',       at: 0.3 },
      { target: 'description', at: 1.5 },
    ],
    pulses: [],
  },
};

// Three things ground rules do, each with two supporting lines.
export const scene6: Points3Subtopics2Props = {
  sections: [
    { mainText: 'Psychological safety',
      detailTexts: ['Members feel safe to speak up', 'A top predictor of team effectiveness'] },
    { mainText: 'Less ambiguity',
      detailTexts: ["Answers the implicit 'what are the rules?'", 'Not left to whoever has authority'] },
    { mainText: 'Accountability',
      detailTexts: ["Calling out a norm isn't personal", "It's a shared team commitment"] },
  ],
  anchor: { kind: 'icon', id: 'job-promotion-handshakeagreement-dark' },
  timings: {
    sequence: [
      { target: 'setup',    at: 0.2, in: 0.7 },
      { target: 'title0',   at: 9.9 },
      { target: 'detail0a', at: 13.0 },
      { target: 'detail0b', at: 20.8 },
      { target: 'title1',   at: 36.9 },
      { target: 'detail1a', at: 39.9 },
      { target: 'detail1b', at: 53.9 },
      { target: 'title2',   at: 64.0 },
      { target: 'detail2a', at: 68.8 },
      { target: 'detail2b', at: 77.3 },
    ],
    pulses: [{ target: 'title0', at: 22.7 }, { target: 'title2', at: 79.64 }],
  },
};

// Cost of skipping: a one-directional escalation (not a cycle).
export const scene7: Process5StepsProps = {
  steps: [
    { label: 'Skip the rules', icon: 'signal-cancel-dark' },
    { label: 'Forms unevenly', icon: 'critical-thinking-balance-dark' },
    { label: 'Frustration',    icon: 'customer-experience-angry-dark' },
    { label: 'Open conflict',  icon: 'business-ethics-conflict-dark' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 0.8 },
      { target: 'step0', at: 2.0 },
      { target: 'step1', at: 4.9 },
      { target: 'step2', at: 25.2 },
      { target: 'step3', at: 29.7 },
    ],
    pulses: [],
  },
};

// Two related terms: the norms vs the document that records them.
export const scene8: YinYang2PointsProps = {
  leftTitle: 'Ground rules',
  rightTitle: 'Working agreement',
  leftBoxes:  [{ icon: 'people-speaking-talk-dark',     text: 'The norms' }],
  rightBoxes: [{ icon: 'legal-documents-agreement-dark', text: 'The document' }],
  timings: {
    sequence: [
      { target: 'setup',     at: 0.2, in: 1.6 },
      { target: 'leftTitle', at: 2.0 },
      { target: 'leftBox0',  at: 14.9 },
      { target: 'rightTitle', at: 16.0 },
      { target: 'rightBox0',  at: 19.1 },
    ],
    pulses: [{ target: 'leftTitle', at: 12.24 }, { target: 'leftTitle', at: 31.0 }, { target: 'rightTitle', at: 35.82 }],
  },
};

// Course outline (first-lesson-only standard).
export const scene9: BulletList6PillsProps = {
  bullets: [
    { label: 'What ground rules are' },
    { label: 'Where they fit in team development' },
    { label: 'How to facilitate them' },
    { label: 'How to document them' },
    { label: 'How to sustain them' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 0.8 },
      { target: 'pill0', at: 1.0 },
      { target: 'pill1', at: 3.0 },
      { target: 'pill2', at: 5.2 },
      { target: 'pill3', at: 6.5 },
      { target: 'pill4', at: 7.8 },
    ],
    pulses: [],
  },
};

export const scene10: LessonSummaryProps = {
  recaps: [
    'Rules vs project policies',
    'Safety, clarity, accountability',
    'Norms vs working agreements',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.3 },
      { target: 'pill0', at: 1.0 },
      { target: 'pill1', at: 9.2 },
      { target: 'pill2', at: 17.8 },
    ],
    pulses: [],
  },
};
