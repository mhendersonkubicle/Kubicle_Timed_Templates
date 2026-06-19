// Auto-assembled lesson scenes for "CI Smoke Test", Lesson 4.
// Timing is SRT-derived (fit-timing.py) and pulses are SRT-detected (detect-rementions.py).

import { staticFile } from 'remotion';

import type { LessonTitleProps } from './LessonTitle';
import type { LessonGoalProps } from './LessonGoal';
import type { BigPoints3V1Props } from './BigPoints3V1';
import type { YinYang2PointsProps } from './YinYang2Points';
import type { BulletList6PillsProps } from './BulletList6Pills';
import type { CaseStudyIntroProps } from './CaseStudyIntro';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { LessonSummaryProps } from './LessonSummary';

export const FPS = 30;
export const TOTAL_SECONDS = 133.361;

// [start, end] in seconds, one per scene, in order.
export const SCENE_SPANS: [number, number][] = [
  [0.0,     12.935],  // 1  LessonTitle
  [12.935,  24.990],  // 2  LessonGoal
  [24.990,  41.944],  // 3  BigPoints3V1
  [41.944,  65.006],  // 4  YinYang2Points
  [65.006,  95.270],  // 5  BulletList6Pills
  [95.270, 100.032],  // 6  CaseStudyIntro
  [100.032, 112.317], // 7  Topic1Subtopics6
  [112.317, 133.361], // 8  LessonSummary
];

// -- Scene 1: LessonTitle -------------------------------------------------------
export const scene1: LessonTitleProps = {
  courseTitle: 'CI Smoke Test',
  lessonNumber: 4,
  lessonTitle: 'Core Principles of Marketing',
  courseIconUrl: staticFile('icons/marketing-automation-megaphone-dark.svg'),
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'logo',  at: 0.0 },
      { target: 'label', at: 1.5 },
      { target: 'title', at: 3.5 },
      { target: 'badge', at: 8.5 },
    ],
    pulses: [],
  },
};

// -- Scene 2: LessonGoal --------------------------------------------------------
export const scene2: LessonGoalProps = {
  heading: 'Lesson Goal',
  goal: 'Explain the core principles of marketing, including value, the value proposition, and client lifetime value, as they apply to advisory firms.',
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2 },
      { target: 'heading', at: 1.0 },
      { target: 'goal',    at: 3.0 },
    ],
    pulses: [],
  },
};

// -- Scene 3: BigPoints3V1 ------------------------------------------------------
// Three forms of value an advisory firm delivers: decision, risk avoided, result.
// Narration: cues 8-11 (scene-relative 0.0-16.95 s).
// Point reveals track the rapid listing in cue 9 ("decision … risk … result").
export const scene3: BigPoints3V1Props = {
  points: [
    { icon: 'choice-decisionmaking-dark', label: 'Decision made' },
    { icon: 'data-protection-shield-dark', label: 'Risk avoided' },
    { icon: 'business-strategy-goal-dark', label: 'Result achieved' },
  ],
  timings: {
    sequence: [
      { target: 'setup',  at: 0.2 },
      { target: 'point0', at: 5.0 },
      { target: 'point1', at: 6.5 },
      { target: 'point2', at: 9.8 },
    ],
    pulses: [],
  },
};

// -- Scene 4: YinYang2Points ----------------------------------------------------
// Weak vs strong value proposition.
// Narration: cues 12-16 (scene-relative 0.0-23.06 s).
// Setup (empty panels) animates during cues 12-13 while the narrator introduces
// the value-proposition concept; leftTitle+box appear on cue 14, right on cue 15.
export const scene4: YinYang2PointsProps = {
  leftTitle: 'Weak VP',
  rightTitle: 'Strong VP',
  leftBoxes: [
    { icon: 'tasks-list-dark', text: 'Lists services' },
  ],
  rightBoxes: [
    { icon: 'brain-process-problemsolving-dark', text: 'Names the issue' },
    { icon: 'data-analysis-outcome-dark',        text: 'States outcome' },
  ],
  leftAccent:  '#0496FF',
  rightAccent: '#F865B0',
  timings: {
    sequence: [
      { target: 'setup',      at: 0.2, in: 3.0 },
      { target: 'leftTitle',  at: 9.87 },
      { target: 'leftBox0',   at: 10.5 },
      { target: 'rightTitle', at: 13.6 },
      { target: 'rightBox0',  at: 14.5 },
      { target: 'rightBox1',  at: 16.5 },
    ],
    pulses: [],
  },
};

// -- Scene 5: BulletList6Pills --------------------------------------------------
// Client lifetime value: six sequential points building the argument.
// Narration: cues 17-24 (scene-relative 1.0-27.7 s).
// Pills track the natural sentence breaks: "beyond a single sale" / "returning
// clients" / "client lifetime value" named / "reframes economics" / "new clients
// expensive" / "retain relationships matters more".
export const scene5: BulletList6PillsProps = {
  bullets: [
    { label: 'Beyond the single sale' },
    { label: 'Returning clients worth more' },
    { label: 'Client lifetime value' },
    { label: 'Reframes firm economics' },
    { label: 'New clients are expensive' },
    { label: 'Retain and grow relationships' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'pill0', at: 1.0,  in: 2.0 },
      { target: 'pill1', at: 5.2,  in: 2.0 },
      { target: 'pill2', at: 10.1, in: 2.0 },
      { target: 'pill3', at: 14.2, in: 2.0 },
      { target: 'pill4', at: 18.0, in: 2.0 },
      { target: 'pill5', at: 23.7, in: 2.0 },
    ],
    pulses: [],
  },
};

// -- Scene 6: CaseStudyIntro ----------------------------------------------------
// Establishing card for the FinSage case study.
export const scene6: CaseStudyIntroProps = {
  eyebrow: 'Case Study',
  logo: 'Company-FinSage-light',
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2 },
      { target: 'eyebrow', at: 0.8 },
      { target: 'logo',    at: 2.5 },
    ],
    pulses: [],
  },
};

// -- Scene 7: Topic1Subtopics6 --------------------------------------------------
// FinSage seen through the CLV lens: three insights revealed as a waterfall.
// Narration: cues 26-28 (scene-relative 0.0-11.28 s).
// Anchor: enterprise relationship icon (light panel).
// TitleIcon: analysis icon (dark header pill, white-precoloured).
export const scene7: Topic1Subtopics6Props = {
  mainTitle: 'FinSage Through CLV',
  titleIcon: 'critical-thinking-analysis-dark',
  details: [
    'Picture changes with CLV',
    'Few clients drive most revenue',
    'Focus marketing on key clients',
  ],
  anchor: { id: 'enterprise-relationship-light' },
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2 },
      { target: 'header',  at: 0.0 },
      { target: 'detail0', at: 0.5 },
      { target: 'detail1', at: 3.86 },
      { target: 'detail2', at: 8.04 },
    ],
    pulses: [],
  },
};

// -- Scene 8: LessonSummary -----------------------------------------------------
// Three-point closing recap; pulses on pill0 ("value") when the word recurs in
// pill1 and pill2 contexts (detected by detect-rementions.py).
export const scene8: LessonSummaryProps = {
  recaps: [
    'Value and exchange',
    'The value proposition',
    'Client lifetime value',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 2.7 },
      { target: 'pill1', at: 7.2 },
      { target: 'pill2', at: 10.7 },
    ],
    pulses: [
      { target: 'pill0', at: 8.48 },
      { target: 'pill0', at: 13.99 },
    ],
  },
};
