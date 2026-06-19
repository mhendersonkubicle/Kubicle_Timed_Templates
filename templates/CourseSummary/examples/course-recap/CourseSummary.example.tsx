import React from 'react';
import { CourseSummary } from '../../CourseSummary';

// EXAMPLE SCENE, count variation (4 recaps).
//
// The schema accepts 1-6 recaps. The pill band auto-centres vertically and each
// pill rolls out from under the one above it, so fewer recaps still read as a
// centred cascade. The banner drops in at `setup`, then pill0..pill3 roll in
// top-to-bottom, one per narration cue.
//
// Layout reference only (no MP4).
export const CourseRecapExample: React.FC = () => (
  <CourseSummary
    recaps={[
      'Define your audience',
      'Map their journey',
      'Set clear goals',
      'Measure what matters',
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.1, in: 1.7 },
        { target: 'pill0', at: 1.8 },
        { target: 'pill1', at: 4.0 },
        { target: 'pill2', at: 6.2 },
        { target: 'pill3', at: 8.4 },
      ],
    }}
  />
);
