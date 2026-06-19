import React from 'react';
import { Timeline5Tiles } from '../../Timeline5Tiles';

// EXAMPLE SCENE, a 5-step process on the reveal-sequence model.
//
// A process is inherently LINEAR, so reveal order = step order. Schedule the
// `setup` scaffolding (left panel slides in, anchor fades in, right container +
// empty progress-bar track appear), then one `step{i}` per step in top-to-bottom
// order. Each step{i} reveals its numbered circle + typewritten phrase as a
// single object and advances the progress bar to (i+1)/N; sync each step{i}.at to
// the narration cue that introduces that step.
//
// The anchor is decorative scaffolding (an icon here), NOT a narrated beat.
// Icons resolve from the shared catalogue and are auto-recoloured to solid white.
export const FiveStepIconExample: React.FC = () => (
  <Timeline5Tiles
    steps={[
      'Plan the project scope',
      'Draft the proposal',
      'Get stakeholder sign-off',
      'Build the first version',
      'Ship and review',
    ]}
    anchor={{ kind: 'icon', id: 'arrows-infographics-elements-steps-light' }}
    timings={{
      sequence: [
        { target: 'setup', at: 0.3, in: 1.2 },
        { target: 'step0', at: 2.2 },
        { target: 'step1', at: 4.4 },
        { target: 'step2', at: 6.6 },
        { target: 'step3', at: 8.8 },
        { target: 'step4', at: 11.0 },
      ],
    }}
  />
);
