import React from 'react';
import { LessonTitle } from '../../LessonTitle';

// EXAMPLE SCENE, the opening card of a lesson.
//
// The card builds in one beat: the background fades in (setup), then the course
// logo row drops in, the "Lesson <word>" eyebrow and the headline slide in from
// the left, and the brand badge pops in bottom-right. As an opener it is a
// single beat, not narration-cued per element.
export const LessonOpenerExample: React.FC = () => (
  <LessonTitle
    courseTitle="Connecting AI Agents to Systems"
    lessonNumber={1}
    lessonTitle="From Map to Connection"
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 0.6 },
        { target: 'logo',  at: 0.6 },
        { target: 'label', at: 1.1 },
        { target: 'title', at: 1.5, in: 0.6 },
        { target: 'badge', at: 1.9 },
      ],
    }}
  />
);
