import React from 'react';
import { Flywheel4Petals } from '../../Flywheel4Petals';

// EXAMPLE SCENE, a 4-petal agentic loop (count variation lives in 2-6).
//
// The hub + faint donut-ring scaffold come in on `setup`, then the four petals
// reveal one at a time CLOCKWISE FROM THE TOP (petal0 top -> petal1 right ->
// petal2 bottom -> petal3 left). A single re-mention pulse on petal0 fires when
// the narration loops back to "Plans" to close the cycle.
//
// No MP4 is rendered (layout reference only).
export const AgenticLoopExample: React.FC = () => (
  <Flywheel4Petals
    title="Agentic Loop"
    subtitle="How a machine learns from its own actions"
    centerIcon="bot"
    petals={[
      { label: 'Plans',    body: 'Draft the next move from the goal',     icon: 'tasks-checklist-dark' }, // top
      { label: 'Acts',     body: 'Run a tool, write code, send a call',   icon: 'creative-web-action-dark'       }, // right
      { label: 'Observes', body: 'Capture results, errors, side effects', icon: 'artificial-intelligence-eye-dark'       }, // bottom
      { label: 'Reflects', body: 'Update the plan from what was learned', icon: 'arrows-refresh-dark'   }, // left
    ]}
    timings={{
      sequence: [
        { target: 'setup',  at: 0.3, in: 1.2 },
        { target: 'petal0', at: 1.6 },
        { target: 'petal1', at: 3.0 },
        { target: 'petal2', at: 4.4 },
        { target: 'petal3', at: 5.8 },
      ],
      // Re-mention: the narration returns to "Plans" to close the loop.
      pulses: [{ target: 'petal0', at: 7.4 }],
    }}
  />
);
