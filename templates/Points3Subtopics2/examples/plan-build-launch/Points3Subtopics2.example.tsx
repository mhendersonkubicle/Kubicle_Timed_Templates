import React from 'react';
import { Points3Subtopics2 } from '../../Points3Subtopics2';

// EXAMPLE SCENE, three stacked colour bands on the reveal-sequence model.
//
// The content is a flat list of three parallel ideas, each with two supporting
// details, so reveal order is strictly top-to-bottom and band-complete: schedule
// `setup` (panel pan-in + left anchor fade), then for each band its title, then
// its two details in order. Each detail step scales its shell in and then types
// its line out within its own `in` window. Sync every `at` to the narration cue
// that introduces that object.
//
// The anchor icon resolves from the shared Icons/ catalogue and MUST use a
// -dark-suffix id so its platinum + Dodger-Blue line art reads on the panel.
export const PlanBuildLaunchExample: React.FC = () => (
  <Points3Subtopics2
    sections={[
      { mainText: 'Plan',  detailTexts: ['Define the project scope', 'List the major risks early'] },
      { mainText: 'Build', detailTexts: ['Ship the first version fast', 'Iterate with real feedback'] },
      { mainText: 'Launch', detailTexts: ['Roll out to all users', 'Track adoption and outcomes'] },
    ]}
    anchor={{ kind: 'icon', id: 'business-success-path-dark' }}
    timings={{
      sequence: [
        { target: 'setup',   at: 0.2, in: 1.4 },
        { target: 'title0',  at: 1.6 },
        { target: 'detail0a', at: 2.8 },
        { target: 'detail0b', at: 4.0 },
        { target: 'title1',  at: 5.4 },
        { target: 'detail1a', at: 6.6 },
        { target: 'detail1b', at: 7.8 },
        { target: 'title2',  at: 9.2 },
        { target: 'detail2a', at: 10.4 },
        { target: 'detail2b', at: 11.6 },
      ],
    }}
  />
);
