import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';

import { LessonTitle } from './LessonTitle';
import { ComparativePoints2 } from './ComparativePoints2';
import { LessonGoal } from './LessonGoal';
import { SplitscreenPointsV1 } from './SplitscreenPointsV1';
import { WordDefinition } from './WordDefinition';
import { Points3Subtopics2 } from './Points3Subtopics2';
import { Process5Steps } from './Process5Steps';
import { YinYang2Points } from './YinYang2Points';
import { BulletList6Pills } from './BulletList6Pills';
import { LessonSummary } from './LessonSummary';

import {
  FPS,
  TOTAL_SECONDS,
  SCENE_SPANS,
  scene1, scene2, scene3, scene4, scene5,
  scene6, scene7, scene8, scene9, scene10,
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
          <ComparativePoints2 {...scene2} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(2)}>
          <LessonGoal {...scene3} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(3)}>
          <SplitscreenPointsV1 {...scene4} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(4)}>
          <WordDefinition {...scene5} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(5)}>
          <Points3Subtopics2 {...scene6} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(6)}>
          <Process5Steps {...scene7} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(7)}>
          <YinYang2Points {...scene8} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(8)}>
          <BulletList6Pills {...scene9} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(9)}>
          <LessonSummary {...scene10} />
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
