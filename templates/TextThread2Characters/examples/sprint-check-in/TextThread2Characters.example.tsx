import React from 'react';
import { TextThread2Characters } from '../../TextThread2Characters';

// EXAMPLE SCENE, "Sprint check-in" two-character text thread.
//
// Demonstrates the reveal-sequence model: the thread FRAME (the phone card +
// both character panels) stages in during `setup`, then six chat bubbles pop
// in ONE AT A TIME in send order, alternating sides as the conversation goes
// back and forth. This is the linear, send-order shape TextThread2Characters
// requires, see ../../GUIDANCE.md, Rule 1.
//
// Each step's `at` is the start time of the narration line that delivers that
// message (scene-relative seconds; this scene starts at t=0, so SRT times map
// directly):
//   0.2   "Maya checks in with her lead over text."           -> setup (frame)
//   1.0   "Are we still on track for Friday's demo?"           -> message0 (left)
//   2.8   "Yep, two stories left, both in QA."                 -> message1 (right)
//   4.6   "Need anything from me before then?"                 -> message2 (left)
//   6.4   "Sign-off on the dashboard mockups would help."      -> message3 (right)
//   8.2   "On it tonight."                                     -> message4 (left)
//   10.0  "Perfect, thanks Maya."                              -> message5 (right)
//
// Re-mention pulse: the opening Friday-demo line (message0) is referenced again
// at 12.5 s, so it gives a brief brand pulse without re-animating the bubble.
//
// Assets: no Template-Specific PNGs; the two character portraits resolve from
// the shared characters/ library at the repo root. No MP4 is rendered for this
// example.
export const SprintCheckInExample: React.FC = () => (
  <TextThread2Characters
    contactName="Maya"
    leftCharacter="female_earlycareer_white"
    rightCharacter="male_middleage_black"
    messages={[
      { side: 'left',  text: 'Quick check, are we still on track for sprint demo Friday?' },
      { side: 'right', text: 'Yep. Two stories left, both in QA.' },
      { side: 'left',  text: 'Nice. Need anything from me before then?' },
      { side: 'right', text: 'Sign-off on the new dashboard mockups would help.' },
      { side: 'left',  text: 'On it tonight. Feedback by EOD tomorrow.' },
      { side: 'right', text: 'Perfect, thanks Maya.' },
    ]}
    timings={{
      sequence: [
        { target: 'setup',    at: 0.2,  in: 0.9 },
        { target: 'message0', at: 1.0,  in: 0.6 },
        { target: 'message1', at: 2.8,  in: 0.6 },
        { target: 'message2', at: 4.6,  in: 0.6 },
        { target: 'message3', at: 6.4,  in: 0.6 },
        { target: 'message4', at: 8.2,  in: 0.6 },
        { target: 'message5', at: 10.0, in: 0.6 },
      ],
      pulses: [{ target: 'message0', at: 12.5 }],
    }}
  />
);
