// Vendor Management, Lesson 8: Monitoring Vendor Performance.
// Built end-to-end on the standard pipeline: timing derived from the SRT (every
// reveal `at` is the scene-relative second its content is first spoken), variety
// (9 distinct templates), no-dead-air (staging templates), semantic fit, icon
// resolution (all ids real + staged), and two presenter-led people templates.

import type { LessonTitleProps }              from './LessonTitle';
import type { LessonGoalProps }               from './LessonGoal';
import type { Topic1Subtopics6CharacterProps } from './Topic1Subtopics6Character';
import type { Checklist5PillsProps }          from './Checklist5Pills';
import type { IconPointsV1Props }             from './IconPointsV1';
import type { WordDefinitionProps }           from './WordDefinition';
import type { BigPoints3V1Props }             from './BigPoints3V1';
import type { Timeline5TilesCharacterProps }  from './Timeline5TilesCharacter';
import type { LessonSummaryProps }            from './LessonSummary';

export const FPS = 30;

// Scene spans (seconds) taken from the SRT cue boundaries.
export const SCENE_SPANS: [number, number][] = [
  [0.0, 2.647],       // 1 title
  [2.647, 8.348],     // 2 goal
  [8.348, 28.91],     // 3 why monitor (presenter)
  [28.91, 53.745],    // 4 what is checked
  [53.745, 73.889],   // 5 contract compliance
  [73.889, 91.107],   // 6 SLA definition
  [91.107, 109.497],  // 7 assessment methods
  [109.497, 124.718], // 8 worked example (presenter)
  [124.718, 138.743], // 9 summary
];
export const TOTAL_SECONDS = 138.743;

export const scene1: LessonTitleProps = {
  courseTitle: 'Vendor Management',
  lessonNumber: 8,
  lessonTitle: 'Monitoring Vendor Performance',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 0.6 },
      { target: 'logo',  at: 0.2 },
      { target: 'label', at: 0.6 },
      { target: 'title', at: 0.9 },
      { target: 'badge', at: 1.2 },
    ],
    pulses: [],
  },
};

export const scene2: LessonGoalProps = {
  heading: 'Lesson Goal',
  goal: 'Monitor vendor performance and contract compliance during project execution.',
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2, in: 0.7 },
      { target: 'heading', at: 0.3 },
      { target: 'goal',    at: 1.0 },
    ],
    pulses: [],
  },
};

// Presenter-led: one core question with three supporting reasons.
export const scene3: Topic1Subtopics6CharacterProps = {
  mainTitle: 'Why monitor performance?',
  titleIcon: 'data-visualization-performance-dark',
  details: [
    'Confirms work meets the contract',
    'Catches issues early',
    'Maintains project control',
  ],
  character: { id: 'female_midcareer_white' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 1.4 },
      { target: 'title', at: 0.5 },
      { target: 'row0',  at: 4.41 },
      { target: 'row1',  at: 11.15 },
      { target: 'row2',  at: 16.35 },
    ],
    pulses: [],
  },
};

// What monitoring checks: three criteria ticked off (hero on platinum -> -light).
export const scene4: Checklist5PillsProps = {
  responsibilities: [
    'Meets quality standards',
    'Completed on time',
    'Within agreed cost limits',
  ],
  hero: { kind: 'icon', id: 'business-strategy-checklist-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 1.7 },
      { target: 'item0', at: 5.2 },
      { target: 'item1', at: 9.2 },
      { target: 'item2', at: 10.8 },
    ],
    pulses: [],
  },
};

// Contract-compliance terms (IconPointsV1 requires -light icon ids).
export const scene5: IconPointsV1Props = {
  pills: [
    { label: 'Reporting',      icon: 'report-documents-light' },
    { label: 'Approvals',      icon: 'speech-bubbles-checkmark-light' },
    { label: 'Change control', icon: 'event-management-workflow-light' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 1.8 },
      { target: 'pill0', at: 6.5 },
      { target: 'pill1', at: 9.5 },
      { target: 'pill2', at: 11.5 },
    ],
    pulses: [],
  },
};

export const scene6: WordDefinitionProps = {
  title: 'Service Level Agreement',
  description:
    'Defines specific vendor performance measures, such as response times or availability levels.',
  timings: {
    sequence: [
      { target: 'setup',       at: 0.2, in: 0.6 },
      { target: 'title',       at: 4.34 },
      { target: 'description', at: 6.69 },
    ],
    pulses: [],
  },
};

// Three assessment methods (BigPoints3V1 on oxford -> -dark icons).
export const scene7: BigPoints3V1Props = {
  points: [
    { icon: 'science-magnifyingglass-dark',      label: 'Inspections' },
    { icon: 'government-documentchecklist-dark',  label: 'Audits' },
    { icon: 'reviews-feedback-filerating-dark',   label: 'Performance reviews' },
  ],
  timings: {
    sequence: [
      { target: 'setup',  at: 0.2, in: 0.8 },
      { target: 'point0', at: 0.8 },
      { target: 'point1', at: 2.0 },
      { target: 'point2', at: 3.4 },
    ],
    pulses: [{ target: 'point2', at: 12.66 }],
  },
};

// Presenter-led worked example: a genuine 3-step sequence.
export const scene8: Timeline5TilesCharacterProps = {
  steps: [
    'Review against criteria',
    'Meets specs, but late',
    'Accept, fix the schedule',
  ],
  character: 'male_middleage_black',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2, in: 0.7 },
      { target: 'step0', at: 2.5 },
      { target: 'step1', at: 6.36 },
      { target: 'step2', at: 10.38 },
    ],
    pulses: [],
  },
};

export const scene9: LessonSummaryProps = {
  recaps: [
    'Monitored during execution',
    'Tracked performance & compliance',
    'Inspections verify outputs',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.3 },
      { target: 'pill0', at: 1.02 },
      { target: 'pill1', at: 6.13 },
      { target: 'pill2', at: 10.35 },
    ],
    pulses: [],
  },
};
