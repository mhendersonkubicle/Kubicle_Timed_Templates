import React from 'react';
import { Process5Steps } from '../../Process5Steps';

// EXAMPLE SCENE, count variation (3 steps).
//
// The schema accepts 2-5 steps. The chevron chain auto-centres and the gradient
// spreads light->dark across whatever count is supplied, so fewer steps still
// read cleanly. Only step0..step2 are scheduled.
//
// Rendered output: three-step.mp4 (no audio, layout reference).
export const ThreeStepExample: React.FC = () => (
  <Process5Steps
    steps={[
      { label: 'Plan', icon: 'search' },
      { label: 'Build', icon: 'add-document' },
      { label: 'Ship', icon: 'arrow-trend-up' },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 0.9 },
        { target: 'step0', at: 1.2 },
        { target: 'step1', at: 2.4 },
        { target: 'step2', at: 3.6 },
      ],
    }}
  />
);
