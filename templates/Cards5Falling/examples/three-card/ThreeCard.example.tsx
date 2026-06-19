import React from 'react';
import { Cards5Falling } from '../../Cards5Falling';

// EXAMPLE SCENE, count variation (3 cards).
//
// The schema accepts 1-5 cards, each shown in turn at the same centred slot, so
// fewer cards simply makes a shorter sequence (no layout reflow). Only
// card0..card2 are scheduled; card3/card4 have no content and never render.
//
// Single-focus exit is derived: card0 falls out when card1 fires (5.0s), card1
// falls out when card2 fires (7.5s), and card2, the last scheduled card, 
// persists to the end of the composition.
export const ThreeCardExample: React.FC = () => (
  <Cards5Falling
    cards={[
      { title: 'Edit notes',    icon: 'edit-dark' },
      { title: 'Watch lecture', icon: 'video-dark' },
      { title: 'Track progress', icon: 'chart-line-dark' },
    ]}
    timings={{
      sequence: [
        { target: 'card0', at: 2.5 },
        { target: 'card1', at: 5.0 },
        { target: 'card2', at: 7.5 },
      ],
    }}
  />
);
