import { AbsoluteFill, Audio, Composition, Series, staticFile } from 'remotion';

import { LessonTitle } from './LessonTitle';
import { WordDefinition } from './WordDefinition';
import { Cards5Falling } from './Cards5Falling';
import { YinYang2Points } from './YinYang2Points';
import { Topic1Subtopics6 } from './Topic1Subtopics6';
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
          <WordDefinition {...scene2} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(2)}>
          <Cards5Falling {...scene3} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={frames(3)}>
          <YinYang2Points {...scene4} />
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
