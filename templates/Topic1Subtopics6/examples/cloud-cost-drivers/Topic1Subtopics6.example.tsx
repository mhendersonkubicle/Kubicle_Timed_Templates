import React from 'react';
import { Topic1Subtopics6 } from '../../Topic1Subtopics6';

// Worked example, "Cost drivers" broken into four supporting points.
//
// Narration this was authored from (scene-relative seconds in brackets):
//   [0.4] "Cloud costs come down to four drivers."
//   [2.4] "The first is compute, the hours your instances run."
//   [4.2] "The second is storage you keep over time."
//   [6.0] "The third is data transfer between regions."
//   [7.8] "And the fourth is the managed services on top."
//
// One concept (the header) fanning out into four homogeneous drivers,
// delivered strictly top-to-bottom, header first, then each detail in
// waterfall order. Reveal count equals details.length (4), as the layout
// centres the row band on the full detail count.

export const Topic1Subtopics6CloudCostDrivers: React.FC = () => (
  <Topic1Subtopics6
    mainTitle="Cost drivers"
    titleIcon="arrow-trend-up"
    anchor={{ id: 'business-strategy-finance-light' }}
    details={[
      'Compute hours',
      'Storage over time',
      'Cross-region transfer',
      'Managed services',
    ]}
    timings={{
      sequence: [
        // setup: right panel pans in (first half) + anchor fades (second half)
        { target: 'setup',  at: 0.4, in: 1.2 },
        // header: pill + title slide in
        { target: 'header', at: 0.4, in: 0.8 },
        // one detail per supporting point, in waterfall order
        { target: 'detail0', at: 2.4 },
        { target: 'detail1', at: 4.2 },
        { target: 'detail2', at: 6.0 },
        { target: 'detail3', at: 7.8 },
      ],
    }}
  />
);
