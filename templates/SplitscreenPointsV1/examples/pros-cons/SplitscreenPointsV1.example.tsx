import React from 'react';
import { SplitscreenPointsV1 } from '../../SplitscreenPointsV1';

// EXAMPLE SCENE, a two-sided pros-vs-cons comparison on the reveal-sequence
// model.
//
// The comparison is delivered SIDE-COMPLETE: the dark right panel pans in
// (`setup`), then the whole left side reveals, its title, then its three pills
// top to bottom, before the right side begins. Each pill is one object: the
// pill scales in and its caption (plus optional icon) cascades from the same
// step. Sync each `{side}Pill{i}.at` to the narration cue that introduces it,
// and never ping-pong a left pill against a right pill.
//
// Icons are optional and resolve from the shared Small-Icons library (white
// line icons). Rendered output is not bundled here, see GUIDANCE.md.
export const ProsConsExample: React.FC = () => (
  <SplitscreenPointsV1
    left={{
      title: 'In the office',
      pills: [
        { text: 'Face-to-face', icon: 'teamwork-collaboration-dark' },
        { text: 'Faster decisions', icon: 'enterprise-growth-dark' },
        { text: 'Long commute', icon: 'speedometer-time-clock-dark' },
      ],
    }}
    right={{
      title: 'Remote',
      pills: [
        { text: 'No commute', icon: 'employee-benefits-gift-dark' },
        { text: 'Flexible hours', icon: 'arrows-loop-dark' },
        { text: 'Harder to connect', icon: 'speech-bubbles-messagebubbles-dark' },
      ],
    }}
    timings={{
      sequence: [
        { target: 'setup',     at: 0.3, in: 0.6 },
        { target: 'leftTitle', at: 1.5 },
        { target: 'leftPill0', at: 2.6 },
        { target: 'leftPill1', at: 3.7 },
        { target: 'leftPill2', at: 4.8 },
        { target: 'rightTitle', at: 6.1 },
        { target: 'rightPill0', at: 7.2 },
        { target: 'rightPill1', at: 8.3 },
        { target: 'rightPill2', at: 9.4 },
      ],
    }}
  />
);
