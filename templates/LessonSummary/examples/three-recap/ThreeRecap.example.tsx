import React from 'react';
import { LessonSummary } from '../../LessonSummary';

// EXAMPLE SCENE, a 3-recap lesson summary on the reveal-sequence model.
//
// A recap is read top-to-bottom, so reveal order = stack order. Schedule the
// `setup` background, the locked `title` headline, then one `pill{i}` per recap
// in stack order. Each pill{i} reveals its row PNG + caption as a single object;
// sync each pill{i}.at to the narration cue that introduces that takeaway.
//
// Pills carry text only (no icons). With 3 of 5 pills the title + stack
// auto-centre as a group. No MP4, timing/layout reference in code only.
export const ThreeRecapExample: React.FC = () => (
  <LessonSummary
    recaps={[
      'Define your audience',
      'Map the user journey',
      'Test with real users',
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 0.6 },
        { target: 'title', at: 0.2 },
        { target: 'pill0', at: 1.0 },
        { target: 'pill1', at: 2.2 },
        { target: 'pill2', at: 3.4 },
      ],
    }}
  />
);
