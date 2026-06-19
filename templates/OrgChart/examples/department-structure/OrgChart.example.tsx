import React from 'react';
import { OrgChart } from '../../OrgChart';

// EXAMPLE SCENE, shape variation (a 1-4-3-4 department structure).
//
// The schema accepts 1 top box plus 1-5 rows of 1-4 boxes each, including
// uneven widths. The stack auto-centres vertically and each row auto-centres
// horizontally, so this 4 -> 3 -> 4 shape stays balanced.
//
// Reveal order is top-down, left-to-right: setup (the central spine draws in),
// then top, then node{r}_{c} for each box. A sample re-mention pulse bumps the
// top box when "Executive Office" is named again later in the narration.
//
// No MP4 rendered, layout + sequence reference only.
export const DepartmentStructureExample: React.FC = () => (
  <OrgChart
    top="Executive Office"
    rows={[
      ['Product', 'Engineering', 'Design', 'Operations'],
      ['Research', 'Platform', 'Brand'],
      ['AI Lab', 'Infrastructure', 'Web', 'Mobile'],
    ]}
    timings={{
      sequence: [
        { target: 'setup',   at: 0.2, in: 0.9 },
        { target: 'top',     at: 1.1 },
        { target: 'node0_0', at: 2.0 },
        { target: 'node0_1', at: 2.5 },
        { target: 'node0_2', at: 3.0 },
        { target: 'node0_3', at: 3.5 },
        { target: 'node1_0', at: 4.4 },
        { target: 'node1_1', at: 4.9 },
        { target: 'node1_2', at: 5.4 },
        { target: 'node2_0', at: 6.3 },
        { target: 'node2_1', at: 6.8 },
        { target: 'node2_2', at: 7.3 },
        { target: 'node2_3', at: 7.8 },
      ],
      // Re-mention pulse: the root is named again ~9.5s in.
      pulses: [{ target: 'top', at: 9.5 }],
    }}
  />
);
