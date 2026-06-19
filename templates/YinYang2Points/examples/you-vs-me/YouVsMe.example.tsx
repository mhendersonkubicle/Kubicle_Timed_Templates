import React from 'react';
import { Audio, staticFile } from 'remotion';
import { YinYang2Points } from '../../YinYang2Points';

// EXAMPLE SCENE, "You vs Me" food-preferences comparison.
//
// Demonstrates the reveal-sequence model driven directly from an SRT
// (see narration.srt / narration.mp3 in this folder). The narration is a
// linear, side-complete comparison (all of "You", then all of "Me"), which is
// exactly what YinYang2Points requires, see ../../GUIDANCE.md, Rule 1.
//
// Each step's `at` is the start time of the SRT cue that introduces it
// (scene-relative seconds; this scene starts at t=0 so SRT times map directly):
//   cue1 0.0  "the difference between you and I"  -> setup
//   cue2 2.6  "First, you like pizza..."          -> leftTitle "You" + Pizza
//   cue4 8.1  "You also like sweet things..."     -> Sweet things
//   cue5 12.9 "I like spicy things."              -> rightTitle "Me" + Spicy food
//   cue6 14.3 "And I like cheese and crackers."   -> Cheese & crackers
//   cue7 15.9 wrap-up (no new object; scene holds)
//
// Assets: icon ids resolve from the shared Icons/ library at the repo root;
// narration.mp3 sits beside this file. Composition length ~20 s (audio runs to
// ~19.1 s). Rendered output: you-vs-me.mp4.
export const YouVsMeExample: React.FC = () => (
  <>
    <Audio src={staticFile('narration.mp3')} />
    <YinYang2Points
      leftTitle="You"
      rightTitle="Me"
      leftBoxes={[
        { icon: 'delivery-pizzadelivery-light', text: 'Pizza' },
        { icon: 'goals-for-the-year-nojunkfood-light', text: 'Sweet things' },
      ]}
      rightBoxes={[
        { icon: 'laboratory-flame-light', text: 'Spicy food' },
        { icon: 'hospitality-food-light', text: 'Cheese plate' },
      ]}
      timings={{
        sequence: [
          { target: 'setup',     at: 0.3, in: 2.0 },
          { target: 'leftTitle', at: 2.6 },
          { target: 'leftBox0',  at: 3.3 },
          { target: 'leftBox1',  at: 8.1 },
          { target: 'rightTitle', at: 12.9 },
          { target: 'rightBox0', at: 13.5 },
          { target: 'rightBox1', at: 14.3 },
        ],
      }}
    />
  </>
);
