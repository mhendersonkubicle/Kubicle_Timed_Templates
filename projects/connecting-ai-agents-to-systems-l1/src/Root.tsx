import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';

import { LessonTitle } from './LessonTitle';
import { LessonGoal } from './LessonGoal';
import { KubicleAIChat } from './KubicleAIChat';
import { WordDefinition } from './WordDefinition';
import { ComparativePoints2 } from './ComparativePoints2';
import { BigPoints3V1 } from './BigPoints3V1';
import { YinYang2Points } from './YinYang2Points';
import { CirclePoints4 } from './CirclePoints4';
import { BulletList6Pills } from './BulletList6Pills';
import { Checklist5Pills } from './Checklist5Pills';
import { LessonSummary } from './LessonSummary';

import {
  FPS,
  TOTAL_SECONDS,
  SCENE_SPANS,
  scene1, scene2, scene3, scene4, scene5, scene6,
  scene7, scene8, scene9, scene10, scene11,
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
          <KubicleAIChat {...scene3} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(3)}>
          <WordDefinition {...scene4} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(4)}>
          <ComparativePoints2 {...scene5} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(5)}>
          <BigPoints3V1 {...scene6} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(6)}>
          <YinYang2Points {...scene7} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(7)}>
          <CirclePoints4 {...scene8} />
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
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
