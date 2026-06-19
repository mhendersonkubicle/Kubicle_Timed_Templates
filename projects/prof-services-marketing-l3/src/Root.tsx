import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';

import { LessonTitle } from './LessonTitle';
import { LessonGoal } from './LessonGoal';
import { Topic1Subtopics6 } from './Topic1Subtopics6';
import { FivePoints1SubtopicV2 } from './FivePoints1SubtopicV2';
import { SplitscreenPointsV1 } from './SplitscreenPointsV1';
import { CaseStudyIntro } from './CaseStudyIntro';
import { Checklist5Pills } from './Checklist5Pills';
import { LessonSummary } from './LessonSummary';

import {
  FPS,
  TOTAL_SECONDS,
  SCENE_SPANS,
  scene1, scene2, scene3, scene4,
  scene5, scene6, scene7, scene8,
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
          <Topic1Subtopics6 {...scene3} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(3)}>
          <FivePoints1SubtopicV2 {...scene4} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(4)}>
          <SplitscreenPointsV1 {...scene5} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(5)}>
          <CaseStudyIntro {...scene6} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(6)}>
          <Checklist5Pills {...scene7} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(7)}>
          <LessonSummary {...scene8} />
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
