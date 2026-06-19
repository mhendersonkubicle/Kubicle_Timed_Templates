import React from 'react';
import { BigPoints3V1 } from '../../BigPoints3V1';

// EXAMPLE SCENE, count variation (2 points).
//
// The schema accepts 2 or 3 points. The oxford-blue panel and the loading bar
// auto-size and stay centred for the count, so the 2-point case has no empty
// negative space. Only point0..point1 are scheduled; point2 has no content and
// is never rendered.
//
// Narration this maps to (linear, point-by-point):
//   [0.3] "Two things to remember."
//   [1.4] "First, faster processing."
//   [3.0] "And then, real-time sync."
export const TwoPointExample: React.FC = () => (
  <BigPoints3V1
    points={[
      { icon: 'rocket',     label: 'Faster processing' },
      { icon: 'auto-update', label: 'Real-time sync' },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.3, in: 0.9 },
        { target: 'point0', at: 1.4 },
        { target: 'point1', at: 3.0 },
      ],
    }}
  />
);
