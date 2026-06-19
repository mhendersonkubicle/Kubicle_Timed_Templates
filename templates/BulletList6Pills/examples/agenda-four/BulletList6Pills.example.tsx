import React from 'react';
import { BulletList6Pills } from '../../BulletList6Pills';

// EXAMPLE SCENE, count variation (4 bullets).
//
// The schema accepts 1-6 bullets. The stack auto-centres vertically for
// whatever count is supplied, so fewer bullets sit centred rather than
// top-anchored. A `setup` step scaffolds the four empty pills, then pill0..pill3
// type their labels on in turn; pill4/pill5 simply have no content and are
// never rendered.
//
// Narration this maps to (scene-relative seconds):
//   [0.4] "Here's what we'll cover today."
//   [1.6] "First, define the brief."
//   [3.8] "Next, research the audience."
//   [6.0] "Then, sketch the structure."
//   [8.2] "And finally, draft the storyboard."
export const AgendaFourExample: React.FC = () => (
  <BulletList6Pills
    bullets={[
      { label: 'Define the brief' },
      { label: 'Research the audience' },
      { label: 'Sketch the structure' },
      { label: 'Draft the storyboard' },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.4, in: 0.9 },
        { target: 'pill0', at: 1.6, in: 2.0 },
        { target: 'pill1', at: 3.8, in: 2.0 },
        { target: 'pill2', at: 6.0, in: 2.0 },
        { target: 'pill3', at: 8.2, in: 2.0 },
      ],
    }}
  />
);
