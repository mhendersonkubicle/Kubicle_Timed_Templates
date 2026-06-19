import React from 'react';
import { Timeline6Checkpoints } from '../../Timeline6Checkpoints';

// EXAMPLE SCENE, count variation (3 checkpoints).
//
// The schema accepts 1-6 checkpoints. The oxford-blue panel and track
// auto-shrink and re-centre for the count, so fewer checkpoints wrap snugly
// with no empty space. The blue fill grows checkpoint to checkpoint as each
// activates. Only checkpoint0..checkpoint2 are scheduled here; higher indices
// have no content and are never rendered.
//
// Narration this maps to (chronological, one milestone at a time):
//   [0.4] "Here's our roadmap."
//   [1.4] "In January we research the problem and the users."
//   [3.0] "In March we build the prototype."
//   [4.6] "And by June we launch to everyone."
export const ThreeMilestoneExample: React.FC = () => (
  <Timeline6Checkpoints
    checkpoints={[
      { date: 'Jan', title: 'Research', description: 'Identify model & user needs' },
      { date: 'Mar', title: 'Prototype', description: 'Build the first model + UX' },
      { date: 'Jun', title: 'Launch',   description: 'General availability rollout' },
    ]}
    timings={{
      sequence: [
        { target: 'setup',      at: 0.4, in: 0.9 },
        { target: 'checkpoint0', at: 1.4 },
        { target: 'checkpoint1', at: 3.0 },
        { target: 'checkpoint2', at: 4.6 },
      ],
    }}
  />
);
