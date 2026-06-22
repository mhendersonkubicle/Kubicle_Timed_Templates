import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';

import { LessonTitle } from './LessonTitle';
import { LessonGoal } from './LessonGoal';
import { WordDefinition } from './WordDefinition';
import { Topic1Subtopics6 } from './Topic1Subtopics6';
import { BigPoints3V1 } from './BigPoints3V1';
import { ComparativePoints2 } from './ComparativePoints2';
import { YinYang2Points } from './YinYang2Points';
import { SplitscreenPointsV1 } from './SplitscreenPointsV1';
import { LessonSummary } from './LessonSummary';

import {
  FPS,
  TOTAL_SECONDS,
  SCENE_SPANS,
  scene1, scene2, scene3, scene4, scene5,
  scene6, scene7, scene8, scene9,
} from './lessonScenes';

const WIDTH = 1920;
const HEIGHT = 1080;

const frames = (i: number) => {
  const [start, end] = SCENE_SPANS[i]!;
  return Math.round((end - start) * FPS);
};

const Lesson: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile('narration.mp3')} />
      <Series>
        <Series.Sequence durationInFrames={frames(0)}>
          <LessonTitle {...scene1} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(1)}>
          <LessonGoal {...scene2} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(2)}>
          <WordDefinition {...scene3} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(3)}>
          <Topic1Subtopics6 {...scene4} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(4)}>
          <BigPoints3V1 {...scene5} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(5)}>
          <ComparativePoints2 {...scene6} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(6)}>
          <YinYang2Points {...scene7} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(7)}>
          <SplitscreenPointsV1 {...scene8} />
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
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
