import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';

import { LessonTitle } from './LessonTitle';
import { LessonGoal } from './LessonGoal';
import { Topic1Subtopics6Character } from './Topic1Subtopics6Character';
import { Checklist5Pills } from './Checklist5Pills';
import { IconPointsV1 } from './IconPointsV1';
import { WordDefinition } from './WordDefinition';
import { BigPoints3V1 } from './BigPoints3V1';
import { Timeline5TilesCharacter } from './Timeline5TilesCharacter';
import { LessonSummary } from './LessonSummary';

import {
  FPS,
  TOTAL_SECONDS,
  SCENE_SPANS,
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
          <Topic1Subtopics6Character {...scene3} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(3)}>
          <Checklist5Pills {...scene4} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(4)}>
          <IconPointsV1 {...scene5} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(5)}>
          <WordDefinition {...scene6} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(6)}>
          <BigPoints3V1 {...scene7} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(7)}>
          <Timeline5TilesCharacter {...scene8} />
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
