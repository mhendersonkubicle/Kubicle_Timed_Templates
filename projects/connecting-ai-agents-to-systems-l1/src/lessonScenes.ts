import { staticFile } from 'remotion';
import type { LessonTitleProps } from './LessonTitle';
import type { LessonGoalProps } from './LessonGoal';
import type { KubicleAIChatProps } from './KubicleAIChat';
import type { BigPoints3V1Props } from './BigPoints3V1';
import type { WordDefinitionProps } from './WordDefinition';
import type { Points3Subtopics2Props } from './Points3Subtopics2';
import type { YinYang2PointsProps } from './YinYang2Points';
import type { IconPointsV1Props } from './IconPointsV1';
import type { BulletList6PillsProps } from './BulletList6Pills';
import type { Checklist5PillsProps } from './Checklist5Pills';
import type { LessonSummaryProps } from './LessonSummary';

// ─── Lesson-wide timing constants ────────────────────────────────────────────
export const FPS = 30;

// Scene spans (seconds) from fit-timing.py, SRT-derived. [start, end] absolute.
export const SCENE_SPANS: ReadonlyArray<readonly [number, number]> = [
  [0.0, 14.293],
  [14.293, 21.073],
  [21.073, 39.916],
  [39.916, 60.675],
  [60.675, 68.198],
  [68.198, 115.51],
  [115.51, 132.368],
  [132.368, 155.773],
  [155.773, 183.348],
  [183.348, 197.269],
  [197.269, 223.972],
];

export const TOTAL_SECONDS = 223.972;

// ─── Scene 1: LessonTitle (opener; front-loaded) ─────────────────────────────
// Course identity reused verbatim from the established L1 of this course
// (courseTitle + network-system-dark course icon), never re-derived.
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

// ─── Scene 2: LessonGoal (opener; front-loaded) ──────────────────────────────
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

// ─── Scene 3: KubicleAIChat (the "we ask, and it answers" mode) ──────────────
// Mirrors the old ask->answer interaction: the user asks, the AI answers with
// text, and the closing "Your move" line makes the narration's point that the
// AI "has no hands" (a person still has to act on the answer). Reveals on-beat:
// prompt as "we ask / we type a question", the answer as "it answers".
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
      { target: 'intro', at: 6.5 },
      { target: 'message0', at: 10.0 },
      { target: 'message1', at: 14.5 },
    ],
    pulses: [],
  },
};

// ─── Scene 4: BigPoints3V1 (agent acts: three actions) ───────────────────────
export const scene4: BigPoints3V1Props = {
  points: [
    { icon: 'office-document-dark', label: 'Read a record' },
    { icon: 'editing-tool-pencil-dark', label: 'Update a field' },
    { icon: 'web-buttons-next-dark', label: 'Trigger next step' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'point0', at: 7.29 },
      { target: 'point1', at: 8.67 },
      { target: 'point2', at: 9.87 },
    ],
    pulses: [],
  },
};

// ─── Scene 5: WordDefinition (Connecting) ────────────────────────────────────
export const scene5: WordDefinitionProps = {
  title: 'Connecting',
  description: 'Giving an AI the tools to act, not just answer.',
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 2.34 },
      { target: 'description', at: 3.8 },
    ],
    pulses: [],
  },
};

// ─── Scene 6: Points3Subtopics2 (three things connecting changes) ────────────
export const scene6: Points3Subtopics2Props = {
  sections: [
    { mainText: 'Who Does Work', detailTexts: ['A waiting step now runs by itself'] },
    { mainText: 'What Runs Alone', detailTexts: ['A mental check now happens in code'] },
    { mainText: 'How Info Flows', detailTexts: ['A signed action now runs automatically'] },
  ],
  anchor: { kind: 'icon', id: 'business-strategy-automation-dark' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title0', at: 23.34 },
      { target: 'title1', at: 24.45 },
      { target: 'title2', at: 26.93 },
      { target: 'detail0a', at: 28.97 },
      { target: 'detail1a', at: 32.55 },
      { target: 'detail2a', at: 36.42 },
    ],
    pulses: [
      { target: 'title1', at: 42.35 },
      { target: 'detail0a', at: 44.42 },
    ],
  },
};

// ─── Scene 7: YinYang2Points (worst way vs better way) ───────────────────────
export const scene7: YinYang2PointsProps = {
  leftTitle: 'Worst Way',
  rightTitle: 'Better Way',
  leftBoxes: [
    { icon: 'choice-questionmark-dark', text: 'No plan' },
    { icon: 'decisions-question-dark', text: 'Just guess' },
  ],
  rightBoxes: [
    { icon: 'planning-checklist-dark', text: 'Plan ahead' },
    { icon: 'leadership-leader-dark', text: 'Stay in control' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'leftTitle', at: 0.0 },
      { target: 'leftBox0', at: 5.37 },
      { target: 'leftBox1', at: 6.36 },
      { target: 'rightTitle', at: 7.66 },
      { target: 'rightBox0', at: 8.9 },
      { target: 'rightBox1', at: 14.67 },
    ],
    pulses: [],
  },
};

// ─── Scene 8: IconPointsV1 (three points on the map) ─────────────────────────
export const scene8: IconPointsV1Props = {
  pills: [
    { label: 'Add value', icon: 'arrows-infographics-elements-growth-light' },
    { label: "Don't decide", icon: 'hands-stop-light' },
    { label: 'Stay in control', icon: 'teacher-during-an-exam-supervising-light' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'pill0', at: 10.62 },
      { target: 'pill1', at: 12.58 },
      { target: 'pill2', at: 15.57 },
    ],
    pulses: [],
  },
};

// ─── Scene 9: BulletList6Pills (course outline; first lesson only) ───────────
export const scene9: BulletList6PillsProps = {
  bullets: [
    { label: 'How an agent connects' },
    { label: 'Where a connection is safe' },
    { label: 'Oversight and resilience' },
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'pill0', at: 3.47 },
      { target: 'pill1', at: 9.97 },
      { target: 'pill2', at: 21.17 },
    ],
    pulses: [],
  },
};

// ─── Scene 10: Checklist5Pills (deliverables of a connection design) ─────────
export const scene10: Checklist5PillsProps = {
  responsibilities: [
    'The tools it needs',
    "The access it's allowed",
    'The checkpoints around it',
    'The way it fails safely',
  ],
  hero: { kind: 'icon', id: 'project-management-processflow-light' },
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'item0', at: 7.27 },
      { target: 'item1', at: 8.52 },
      { target: 'item2', at: 10.01 },
      { target: 'item3', at: 11.93 },
    ],
    pulses: [],
  },
};

// ─── Scene 11: LessonSummary (closing recap) ─────────────────────────────────
export const scene11: LessonSummaryProps = {
  recaps: [
    'Defined what connecting means',
    'Saw how it changes a process',
    "Outlined what we'll build",
  ],
  timings: {
    sequence: [
      { target: 'setup', at: 0.2 },
      { target: 'title', at: 0.0 },
      { target: 'pill0', at: 3.19 },
      { target: 'pill1', at: 11.05 },
      { target: 'pill2', at: 20.06 },
    ],
    pulses: [],
  },
};
