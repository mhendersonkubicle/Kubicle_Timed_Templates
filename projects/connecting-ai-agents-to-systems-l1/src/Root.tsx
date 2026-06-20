import React from 'react';
import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';

import { LessonTitle } from './LessonTitle';
import { LessonGoal } from './LessonGoal';
import { KubicleAIChat } from './KubicleAIChat';
import { BigPoints3V1 } from './BigPoints3V1';
import { WordDefinition } from './WordDefinition';
import { Points3Subtopics2 } from './Points3Subtopics2';
import { YinYang2Points } from './YinYang2Points';
import { IconPointsV1 } from './IconPointsV1';
import { BulletList6Pills } from './BulletList6Pills';
import { Checklist5Pills } from './Checklist5Pills';
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
  scene10,
  scene11,
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
          <LessonGoal {...scene2} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(2)}>
          <KubicleAIChat {...scene3} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(3)}>
          <BigPoints3V1 {...scene4} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(4)}>
          <WordDefinition {...scene5} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(5)}>
          <Points3Subtopics2 {...scene6} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(6)}>
          <YinYang2Points {...scene7} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(7)}>
          <IconPointsV1 {...scene8} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(8)}>
          <BulletList6Pills {...scene9} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(9)}>
          <Checklist5Pills {...scene10} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(10)}>
          <LessonSummary {...scene11} />
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
