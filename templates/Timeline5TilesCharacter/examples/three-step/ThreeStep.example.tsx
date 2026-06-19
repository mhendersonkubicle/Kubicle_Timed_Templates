import React from 'react';
import { Timeline5TilesCharacter } from '../../Timeline5TilesCharacter';

// EXAMPLE SCENE, count variation (3 steps), presenter-led.
//
// The schema accepts 1-5 steps. The right oxford-blue container auto-sizes and
// vertically re-centres for the count, and the progress bar splits into 1/N
// segments, so fewer steps still read cleanly with no empty space. Only
// step0..step2 are scheduled; step3/step4 have no content and never render.
//
// Narration this maps to (presenter voice, scene-relative seconds in brackets):
//   [0.4] "Here's how I onboard a new client."
//   [2.0] "First, I scope the engagement."
//   [4.4] "Then I draft the agreement."
//   [6.8] "And finally I kick off the work."
export const ThreeStepExample: React.FC = () => (
  <Timeline5TilesCharacter
    character="female_midcareer_white"
    steps={[
      'Scope the engagement',
      'Draft the agreement',
      'Kick off the work',
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.4, in: 1.2 },
        { target: 'step0', at: 2.0, in: 1.8 },
        { target: 'step1', at: 4.4, in: 1.8 },
        { target: 'step2', at: 6.8, in: 1.8 },
      ],
    }}
  />
);
