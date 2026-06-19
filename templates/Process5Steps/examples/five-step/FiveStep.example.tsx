import React from 'react';
import { Process5Steps } from '../../Process5Steps';

// EXAMPLE SCENE, a 5-step process on the reveal-sequence model.
//
// A process is inherently LINEAR, so reveal order = step order. Schedule the
// `setup` stage, then one `step{i}` per step in execution order. Each step{i}
// reveals chevron i + its icon, number, and label as a single object; sync each
// step{i}.at to the narration cue that introduces that step.
//
// Icons resolve from the shared Small-Icons library (white line icons).
// Rendered output: five-step.mp4 (no audio, timing/layout reference).
export const FiveStepExample: React.FC = () => (
  <Process5Steps
    steps={[
      { label: 'Define', icon: 'search' },
      { label: 'Collect', icon: 'add-document' },
      { label: 'Train',  icon: 'ai-assistant' },
      { label: 'Deploy', icon: 'arrow-trend-up' },
      { label: 'Iterate', icon: 'auto-update' },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 0.9 },
        { target: 'step0', at: 1.2 },
        { target: 'step1', at: 2.4 },
        { target: 'step2', at: 3.6 },
        { target: 'step3', at: 4.8 },
        { target: 'step4', at: 6.0 },
      ],
    }}
  />
);
