// Auto-assembled lesson scenes for "Connecting AI Agents to Systems",
// Lesson 1: From Map to Connection.
// Timing is SRT-derived (fit-timing.py) and pulses are SRT-detected (detect-rementions.py).
import { staticFile } from 'remotion';

import type { LessonTitleProps } from './LessonTitle';
import type { LessonGoalProps } from './LessonGoal';
import type { KubicleAIChatProps } from './KubicleAIChat';
import type { WordDefinitionProps } from './WordDefinition';
import type { ComparativePoints2Props } from './ComparativePoints2';
import type { BigPoints3V1Props } from './BigPoints3V1';
import type { YinYang2PointsProps } from './YinYang2Points';
import type { CirclePoints4Props } from './CirclePoints4';
import type { BulletList6PillsProps } from './BulletList6Pills';
import type { Checklist5PillsProps } from './Checklist5Pills';
import type { LessonSummaryProps } from './LessonSummary';

export const FPS = 30;
export const TOTAL_SECONDS = 223.972;

// Scene spans (SRT-derived), one [start, end] per scene, in order.
export const SCENE_SPANS: [number, number][] = [
  [0.0, 14.293],
  [14.293, 21.073],
  [21.073, 39.916],
  [39.916, 68.198],
  [68.198, 81.841],
  [81.841, 115.51],
  [115.51, 132.368],
  [132.368, 155.773],
  [155.773, 183.348],
  [183.348, 199.498],
  [199.498, 223.972],
];

// scene-1: LessonTitle (opener, front-loaded). Course identity set here.
export const scene1: LessonTitleProps = {
  courseTitle: 'Connecting AI Agents to Systems',
  lessonNumber: 1,
  lessonTitle: 'From Map to Connection',
  courseIconUrl: staticFile('icons/network-system-dark.svg'),
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

// scene-2: LessonGoal (opener, front-loaded).
export const scene2: LessonGoalProps = {
  heading: 'Lesson Goal',
  goal: "Explain what it means to connect an AI agent to a system, and why it's more than just adding a feature.",
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'heading', at: 0.7 },
      { target: 'goal', at: 1.3 },
    ],
    pulses: [],
  },
};

// scene-3: KubicleAIChat , mirrors the "we ask, and it answers" mode. The user
// asks; the AI answers with text; the closing section makes the narration's point
// that the AI "has no hands" (a person still has to act on the answer).
export const scene3: KubicleAIChatProps = {
  greeting: 'How can I help?',
  subline: 'Ask a question or paste a document.',
  inputPlaceholder: 'Message Kubicle AI',
  userPrompt: 'Which of these invoices are overdue?',
  response: {
    intro: 'Three invoices are past their due date:',
    sections: [
      { heading: 'Overdue', body: 'INV-1043, INV-1051, and INV-1062 are now past due.' },
      { heading: 'Your move', body: 'You still have to follow these up yourself, the assistant can only tell you.' },
    ],
  },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'prompt', at: 2.5 },
      { target: 'intro', at: 7.0 },
      { target: 'message0', at: 11.0 },
      { target: 'message1', at: 15.0 },
    ],
    pulses: [],
  },
};

// scene-4: WordDefinition ("Connecting" defined).
export const scene4: WordDefinitionProps = {
  title: 'Connecting',
  description: 'Giving an AI the tools to act on our systems, not just answer questions.',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 2.5 },
      { target: 'description', at: 25.78 },
    ],
    pulses: [{ target: 'title', at: 22.46 }],
  },
};

// scene-5: ComparativePoints2 (Answering vs Acting).
export const scene5: ComparativePoints2Props = {
  points: [
    { icon: 'speech-bubbles-questiontalk-dark', label: 'Answering' },
    { icon: 'technical-support-handgear-dark', label: 'Acting' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftPoint', at: 2.5 },
      { target: 'rightPoint', at: 11.14 },
    ],
    pulses: [],
  },
};

// scene-6: BigPoints3V1 (three changes connecting brings).
export const scene6: BigPoints3V1Props = {
  points: [
    { icon: 'neural-network-hand-dark', label: 'Who does the work' },
    { icon: 'filter-search-gears-dark', label: 'What it runs alone' },
    { icon: 'database-and-servers-datatransfer-dark', label: 'How information moves' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'point0', at: 2.5 },
      { target: 'point1', at: 16.83 },
      { target: 'point2', at: 31.17 },
    ],
    pulses: [{ target: 'point0', at: 9.7 }],
  },
};

// scene-7: YinYang2Points (worst way vs better way).
export const scene7: YinYang2PointsProps = {
  leftTitle: 'Worst Way',
  rightTitle: 'Better Way',
  leftBoxes: [
    { icon: 'hands-fingerpointing-dark', text: 'Any old step' },
    { icon: 'mindset-maze-dark', text: 'No plan' },
  ],
  rightBoxes: [
    { icon: 'planning-checklist-dark', text: 'Decide first' },
    { icon: 'security-shield-dark', text: 'Keep control' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftTitle', at: 2.5 },
      { target: 'leftBox0', at: 4.87 },
      { target: 'leftBox1', at: 7.24 },
      { target: 'rightTitle', at: 9.61 },
      { target: 'rightBox0', at: 11.99 },
      { target: 'rightBox1', at: 14.36 },
    ],
    pulses: [],
  },
};

// scene-8: CirclePoints4 (the points marked on a map). No setup target.
export const scene8: CirclePoints4Props = {
  points: [
    { icon: 'arrows-infographics-elements-growth-dark', label: 'Add value' },
    { icon: 'hands-stop-dark', label: 'Must not decide' },
    { icon: 'boss-leader-dark', label: 'Stays in control' },
  ],
  timings: {
    sequence: [
      { target: 'point0', at: 2.5 },
      { target: 'point1', at: 11.7 },
      { target: 'point2', at: 20.91 },
    ],
    pulses: [{ target: 'point0', at: 10.62 }],
  },
};

// scene-9: BulletList6Pills (course-outline beat; first lesson only).
export const scene9: BulletList6PillsProps = {
  bullets: [
    { label: 'How an agent connects to a system' },
    { label: 'Where a connection is safe' },
    { label: 'Building oversight and resilience' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'pill0', at: 2.5 },
      { target: 'pill1', at: 13.79 },
      { target: 'pill2', at: 25.08 },
    ],
    pulses: [],
  },
};

// scene-10: Checklist5Pills (the deliverable: complete connection design).
export const scene10: Checklist5PillsProps = {
  responsibilities: [
    'Tools it needs',
    "Access it's allowed",
    'Checkpoints around it',
    'Fails safely',
  ],
  hero: { kind: 'icon', id: 'design-thinking-planning-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'item0', at: 2.5 },
      { target: 'item1', at: 6.22 },
      { target: 'item2', at: 9.93 },
      { target: 'item3', at: 13.65 },
    ],
    pulses: [{ target: 'item0', at: 7.27 }],
  },
};

// scene-11: LessonSummary (closing recap). Headline locked to "Lesson Summary".
export const scene11: LessonSummaryProps = {
  recaps: [
    'Define what connecting means',
    'See how it changes the process',
    'Plan a governed connection',
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 2.5 },
      { target: 'pill0', at: 8.99 },
      { target: 'pill1', at: 15.48 },
      { target: 'pill2', at: 21.97 },
    ],
    pulses: [],
  },
};
