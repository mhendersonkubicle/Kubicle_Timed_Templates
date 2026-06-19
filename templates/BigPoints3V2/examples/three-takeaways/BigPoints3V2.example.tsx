import React from 'react';
import { BigPoints3V2 } from '../../BigPoints3V2';

// EXAMPLE SCENE, three icon-anchored takeaways.
//
// The schema is fixed at exactly 3 cards. Each card here uses an `icon` anchor;
// any card could instead use { kind: 'character', id } to swap in a portrait.
// The reveal sequence schedules an (optional, no-op) `setup` then card0..card2,
// one cue per card, so the points build left to right as the narration delivers
// each headline + supporting line in turn.
//
// Rendered output: three-takeaways.mp4 (no audio, layout reference).
export const ThreeTakeawaysExample: React.FC = () => (
  <BigPoints3V2
    cards={[
      { title: 'Plan',  subtopic: 'Map the project scope',  anchor: { kind: 'icon', id: 'document-folder' } },
      { title: 'Build', subtopic: 'Ship a working first cut', anchor: { kind: 'icon', id: 'analytics' } },
      { title: 'Launch', subtopic: 'Roll out and measure',    anchor: { kind: 'icon', id: 'success' } },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.3 },
        { target: 'card0', at: 0.5 },
        { target: 'card1', at: 3.0 },
        { target: 'card2', at: 5.7 },
      ],
    }}
  />
);
