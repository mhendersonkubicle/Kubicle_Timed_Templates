import React from 'react';
import { IconPointsV1 } from '../../IconPointsV1';

// EXAMPLE SCENE, course agenda walkthrough (4 points, count variation).
//
// The schema accepts 2-6 pills. The right-hand box and the left "covered"
// stack resize and vertically centre to suit the count, so 4 points stay
// balanced. Each pill enters the conveyor, holds to read, exits right, and
// leaves a faded copy on the left stack (first point at the top). Only
// pill0..pill3 are scheduled.
//
// Narration this maps to (linear, one point at a time, in list order):
//   "Here's what this course covers. First, the Python basics. Next, data
//    wrangling. Then visualization. And finally, machine learning."
export const FourTopicExample: React.FC = () => (
  <IconPointsV1
    pills={[
      { label: 'Python basics',   icon: 'big-data-binarycode-light' },
      { label: 'Data wrangling',  icon: 'ai-agent-data-light' },
      { label: 'Visualization',   icon: 'arrows-infographics-elements-barchart-light' },
      { label: 'Machine learning', icon: 'ai-agent-aibrain-light' },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.3, in: 1.0 },
        { target: 'pill0', at: 1.5 },
        { target: 'pill1', at: 3.5 },
        { target: 'pill2', at: 5.5 },
        { target: 'pill3', at: 7.5 },
      ],
    }}
  />
);
