import React from 'react';
import { YinYang2Points } from '../../YinYang2Points';

// EXAMPLE SCENE, single sub-point per side (the 1-or-2 variation).
//
// Each side supplies just ONE box. The template centres a single fixed-size box
// (BOX_W × BOX_H, identical to the baked pair) under each title instead of
// drawing the two-box scaffolding. All other constraints are unchanged:
// captions ≤22 chars, titles ≤40, same box size / text size.
//
// The reveal sequence only schedules box0 on each side; leftBox1 / rightBox1
// have no content here and are simply never referenced.
//
// Rendered output: one-per-side.mp4 (no audio, this is a layout reference).
export const OnePerSideExample: React.FC = () => (
  <YinYang2Points
    leftTitle="You"
    rightTitle="Me"
    leftBoxes={[{ icon: 'delivery-pizzadelivery-light', text: 'Pizza' }]}
    rightBoxes={[{ icon: 'laboratory-flame-light', text: 'Spicy food' }]}
    timings={{
      sequence: [
        { target: 'setup',     at: 0.3, in: 2.0 },
        { target: 'leftTitle', at: 2.6 },
        { target: 'leftBox0',  at: 3.6 },
        { target: 'rightTitle', at: 6.0 },
        { target: 'rightBox0', at: 7.0 },
      ],
    }}
  />
);
