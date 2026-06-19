import React from 'react';
import { CirclePoints4 } from '../../CirclePoints4';

// EXAMPLE SCENE, full 4-point layout.
//
// The schema accepts 1-4 points. The circle row auto-centres for whatever count
// is supplied, so fewer points still sit centred in the frame. Here all four
// points are scheduled, point0..point3, one per narration cue in left-to-right
// reveal order. There is no `setup` step, the blank canvas is just the flat
// #E6ECF2 fill.
//
// No MP4 rendered, layout reference only.
export const FourFeaturesExample: React.FC = () => (
  <CirclePoints4
    points={[
      { icon: 'shield',        label: 'Data quality' },
      { icon: 'lightning-bolt', label: 'Fast queries' },
      { icon: 'coin',          label: 'Low cost' },
      { icon: 'rocket',        label: 'Easy setup' },
    ]}
    timings={{
      sequence: [
        { target: 'point0', at: 1.2 },
        { target: 'point1', at: 2.4 },
        { target: 'point2', at: 3.6 },
        { target: 'point3', at: 4.8 },
      ],
    }}
  />
);
