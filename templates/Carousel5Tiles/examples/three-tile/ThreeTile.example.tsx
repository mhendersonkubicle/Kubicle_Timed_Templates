import React from 'react';
import { Carousel5Tiles } from '../../Carousel5Tiles';

// EXAMPLE SCENE, count variation (3 tiles).
//
// The schema accepts 2-5 tiles. The coverflow ring auto-sizes to the count, so
// fewer tiles simply makes a shorter cycle, the centred tile and its neighbours
// render the same way. Only setup + tile0..tile2 are scheduled.
//
// Tiles are TRANSIENT (centre-focused): each tile{i} step slides the ring so
// that tile becomes the head-on centre card; the previous one cycles off to a
// sliver. A sample re-mention pulse is added on tile0 at 7.4 s (only reads if
// tile0 is still the centred card around then; here it lands after tile2 has
// taken centre, so it is illustrative of the field shape rather than visible).
//
// Icons are -dark-suffix ids (light artwork) so they read on the DARK tile.
//
// No MP4 rendered (layout / timing reference only).
export const ThreeTileExample: React.FC = () => (
  <Carousel5Tiles
    tiles={[
      {
        title: 'Prompt-First',
        icon: 'terminal-dark',
        bullets: ['Describe intent, not steps', 'Let the model draft v1'],
      },
      {
        title: 'Pair Programming',
        icon: 'sparkles-dark',
        bullets: ['Treat the model as a peer', 'Push back on weak ideas'],
      },
      {
        title: 'Tight Loops',
        icon: 'zap-dark',
        bullets: ['Small diffs, fast feedback', 'Run, observe, refine'],
      },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 0.8 },
        { target: 'tile0', at: 1.0 },
        { target: 'tile1', at: 3.6 },
        { target: 'tile2', at: 6.2 },
      ],
      pulses: [
        // Illustrative re-mention pulse on the first tile (field-shape demo).
        { target: 'tile0', at: 7.4 },
      ],
    }}
  />
);
