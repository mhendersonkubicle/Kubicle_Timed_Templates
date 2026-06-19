// Auto-assembled lesson scenes for "Marketing in Professional Services", Lesson 2.
// Timing is SRT-derived (fit-timing.py) and pulses are SRT-detected (detect-rementions.py).

import { staticFile } from 'remotion';

import type { LessonTitleProps } from './LessonTitle';
import type { LessonGoalProps } from './LessonGoal';
import type { Topic1Subtopics6Props } from './Topic1Subtopics6';
import type { WordDefinitionProps } from './WordDefinition';
import type { Points3Subtopics2Props } from './Points3Subtopics2';
import type { ComparativePoints2Props } from './ComparativePoints2';
import type { BigPoints3V1Props } from './BigPoints3V1';
import type { CaseStudyIntroProps } from './CaseStudyIntro';
import type { Checklist5PillsProps } from './Checklist5Pills';
import type { LessonSummaryProps } from './LessonSummary';

export const FPS = 30;
export const TOTAL_SECONDS = 159.605;

// [start, end] in seconds, one per scene, in order (from fit-timing.py spans).
export const SCENE_SPANS: [number, number][] = [
  [0.0, 8.245],
  [8.245, 15.004],
  [15.004, 41.089],
  [41.089, 52.585],
  [52.585, 84.728],
  [84.728, 97.548],
  [97.548, 118.218],
  [118.218, 126.975],
  [126.975, 137.633],
  [137.633, 159.605],
];

// -- Scene 1: LessonTitle ------------------------------------------------------
export const scene1: LessonTitleProps = {
  courseTitle: 'Marketing in Professional Services',
  lessonNumber: 2,
  lessonTitle: 'The Marketing Mix and the Seven Ps',
  courseIconUrl: staticFile('icons/marketing-automation-megaphone-dark.svg'),
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'logo', at: 0.0 },
      { target: 'label', at: 1.31 },
      { target: 'title', at: 2.29 },
      { target: 'badge', at: 6.49 },
    ],
    pulses: [],
  },
};

// -- Scene 2: LessonGoal -------------------------------------------------------
export const scene2: LessonGoalProps = {
  goal: 'Describe the marketing mix and apply the seven Ps services model to an advisory offer.',
  heading: 'Lesson Goal',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'heading', at: 0.0 },
      { target: 'goal', at: 1.18 },
    ],
    pulses: [],
  },
};

// -- Scene 3: Topic1Subtopics6 -------------------------------------------------
export const scene3: Topic1Subtopics6Props = {
  mainTitle: 'The four Ps',
  titleIcon: 'enterprise-marketing-dark',
  details: [
    'Product, what the firm offers',
    'Price, what it charges',
    'Place, how the offer reaches clients',
    'Promotion, how value is shared',
  ],
  anchor: { id: 'job-promotion-puzzlepieces-light' },
  timings: {
    // The four Ps are NAMED together (cue 6-7), then defined one by one (cue 8-11).
    // Reveal the topic + all four as they are first named (no dead air), then PULSE
    // each as the narration returns to define it (preview-then-expand pattern).
    sequence: [
      { target: 'setup',   at: 0.2 },
      { target: 'header',  at: 1.5 },
      { target: 'detail0', at: 5.5 },
      { target: 'detail1', at: 6.5 },
      { target: 'detail2', at: 7.5 },
      { target: 'detail3', at: 11.5 },
    ],
    pulses: [
      { target: 'detail0', at: 13.31 },
      { target: 'detail1', at: 16.07 },
      { target: 'detail2', at: 18.98 },
      { target: 'detail3', at: 22.25 },
    ],
  },
};

// -- Scene 4: WordDefinition ---------------------------------------------------
export const scene4: WordDefinitionProps = {
  title: 'The Product',
  description:
    'In an advisory firm, the product is not a physical good but a service delivered by people.',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 7.79 },
      { target: 'description', at: 8.46 },
    ],
    pulses: [],
  },
};

// -- Scene 5: Points3Subtopics2 ------------------------------------------------
export const scene5: Points3Subtopics2Props = {
  sections: [
    { mainText: 'People',            detailTexts: ['The people are the service'] },
    { mainText: 'Process',           detailTexts: ['Clients judge how work is run', 'Not just the final outcome'] },
    { mainText: 'Physical Evidence', detailTexts: ['Intangible work needs proof', 'Credentials, case studies, reports'] },
  ],
  anchor: { kind: 'icon', id: 'marketing-technology-services-dark' },
  timings: {
    // Levers named together (cue 15-16) -> reveal titles early; build each section's
    // detail + pulse its title on expansion (cue 18-22). Each detail shell is ONE
    // complete, independent point; People has a single point (one centred shell).
    sequence: [
      { target: 'setup',    at: 0.2 },
      { target: 'title0',   at: 1.2 },
      { target: 'title1',   at: 2.7 },
      { target: 'title2',   at: 5.3 },
      { target: 'detail0a', at: 13.5 },
      { target: 'detail1a', at: 18.5 },
      { target: 'detail1b', at: 22.15 },
      { target: 'detail2a', at: 25.0 },
      { target: 'detail2b', at: 28.49 },
    ],
    pulses: [
      { target: 'title0', at: 12.8 },
      { target: 'title1', at: 17.98 },
      { target: 'title2', at: 24.46 },
    ],
  },
};

// -- Scene 6: ComparativePoints2 -----------------------------------------------
export const scene6: ComparativePoints2Props = {
  points: [
    { icon: 'hospitality-food-dark', label: 'The meal on the plate' },
    { icon: 'locations-restaurant-dark', label: 'The whole experience' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftPoint', at: 2.25 },
      { target: 'rightPoint', at: 7.34 },
    ],
    pulses: [],
  },
};

// -- Scene 7: BigPoints3V1 -----------------------------------------------------
export const scene7: BigPoints3V1Props = {
  points: [
    { icon: 'teamwork-collaboration-dark', label: 'People' },
    { icon: 'event-management-workflow-dark', label: 'Process' },
    { icon: 'legal-documents-certificate-dark', label: 'Physical evidence' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'point0', at: 3.63 },
      { target: 'point1', at: 4.12 },
      { target: 'point2', at: 4.86 },
    ],
    pulses: [],
  },
};

// -- Scene 8: CaseStudyIntro ---------------------------------------------------
export const scene8: CaseStudyIntroProps = {
  eyebrow: 'Case Study',
  logo: 'Company-FinSage-light',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'eyebrow', at: 0.0 },
      { target: 'logo', at: 0.27 },
    ],
    pulses: [],
  },
};

export const scene9: Checklist5PillsProps = {
  // Case-study follow-up (cue 34-36): icon on the left + bullet pills on the right,
  // single colour, all revealed top-to-bottom (no cycling, not the multicoloured bands).
  responsibilities: [
    'Present its people better',
    'Show its past work',
    'Sharper case studies',
    'Higher win rate, same prices',
  ],
  hero: { kind: 'icon', id: 'science-magnifyingglass-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'item0', at: 0.5 },
      { target: 'item1', at: 1.8 },
      { target: 'item2', at: 3.0 },
      { target: 'item3', at: 7.5 },
    ],
    pulses: [],
  },
};

// -- Scene 10: LessonSummary ---------------------------------------------------
export const scene10: LessonSummaryProps = {
  recaps: [
    'The classic four Ps',
    'The seven Ps services mix',
    'The mix for an advisory firm',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 4.47 },
      { target: 'pill1', at: 9.07 },
      { target: 'pill2', at: 13.48 },
    ],
    pulses: [],
  },
};
