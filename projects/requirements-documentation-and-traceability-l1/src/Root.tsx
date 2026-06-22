import React from 'react';
import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';

import { LessonTitle } from './LessonTitle';
import { ComparativePoints2 } from './ComparativePoints2';
import { IconPointsV1 } from './IconPointsV1';
import { WordDefinition } from './WordDefinition';
import { Topic1Subtopics6 } from './Topic1Subtopics6';
import { CaseStudyIntro } from './CaseStudyIntro';
import { Checklist5Pills } from './Checklist5Pills';
import { BulletList6Pills } from './BulletList6Pills';
import { LessonSummary } from './LessonSummary';

import {
  FPS,
  SCENE_SPANS,
  TOTAL_SECONDS,
  scene1,
  scene2,
  scene3,
  scene4,
  scene5,
  scene6,
  scene7,
  scene8,
  scene9,
} from './lessonScenes';

const frames = (i: number) => {
  const [start, end] = SCENE_SPANS[i];
  return Math.round((end - start) * FPS);
};

const Lesson: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0B1F33' }}>
      <Audio src={staticFile('narration.mp3')} />
      <Series>
        <Series.Sequence durationInFrames={frames(0)}>
          <LessonTitle {...scene1} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(1)}>
          <ComparativePoints2 {...scene2} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(2)}>
          <IconPointsV1 {...scene3} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(3)}>
          <WordDefinition {...scene4} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(4)}>
          <Topic1Subtopics6 {...scene5} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(5)}>
          <CaseStudyIntro {...scene6} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(6)}>
          <Checklist5Pills {...scene7} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(7)}>
          <BulletList6Pills {...scene8} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(8)}>
          <LessonSummary {...scene9} />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Lesson"
      component={Lesson}
      durationInFrames={Math.ceil(TOTAL_SECONDS * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
