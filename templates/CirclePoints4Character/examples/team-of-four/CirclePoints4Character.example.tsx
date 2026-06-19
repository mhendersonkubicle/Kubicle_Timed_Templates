import React from 'react';
import { CirclePoints4Character } from '../../CirclePoints4Character';

// EXAMPLE SCENE, full 4-point layout (a team of four).
//
// The schema accepts 1-4 points. The circle row auto-centres for whatever count
// is supplied, so fewer points still sit centred in the frame. Here all four
// points are scheduled, point0..point3, one per narration cue in left-to-right
// reveal order, after a `setup` step that scales/fades the platinum background
// stage in (so the frame is never a static blank before the first portrait).
//
// `characterId` resolves to characters/<id>.png at render time; the ids below
// are placeholders, swap them for real portrait PNGs from the shared library.
//
// A couple of re-mention pulses are included: when Amelia (point0) and Sarah
// (point2) are named again later in the narration, their circles give a brief,
// subtle brand pulse. With an empty `pulses` array the scene renders identically.
//
// No MP4 rendered, layout reference only.
export const TeamOfFourExample: React.FC = () => (
  <CirclePoints4Character
    points={[
      { characterId: 'presenter-red',    characterHeight: 480, characterY: 30, label: 'Strategy' },
      { characterId: 'presenter-blue',   characterHeight: 480, characterY: 30, label: 'Engineering' },
      { characterId: 'presenter-green',  characterHeight: 480, characterY: 30, label: 'Design' },
      { characterId: 'presenter-yellow', characterHeight: 480, characterY: 30, label: 'Operations' },
    ]}
    timings={{
      sequence: [
        { target: 'setup',  at: 0.2, in: 0.8 },
        { target: 'point0', at: 1.0 },
        { target: 'point1', at: 2.2 },
        { target: 'point2', at: 3.4 },
        { target: 'point3', at: 4.6 },
      ],
      // Re-mentions later in the narration, drawing the eye back without
      // re-animating the whole circle.
      pulses: [
        { target: 'point0', at: 7.5 },
        { target: 'point2', at: 8.8 },
      ],
    }}
  />
);
