import React from 'react';
import { AIWorkflowDiagramV1 } from '../../AIWorkflowDiagramV1';

// EXAMPLE SCENE, multi-agent router (classic 4-column fan-out / fan-in).
//
// The schema accepts 1-4 columns, each holding 1-3 nodes; adjacent columns are
// fully connected. Here a single user query feeds an intent router, which fans
// out to three specialist agents, which all converge on one LLM sink:
// [[1],[1],[3],[1]].
//
// Reveal sequence (reveal-sequence model): setup irises the oxford background
// in, then the columns reveal left to right one at a time, each column's boxes
// popping in with the connectors that feed into it. The 3-agent column gets a
// slightly longer `in` so its staggered pop reads. A sample re-mention pulse
// re-pulses the router column when the narration names it again later.
//
// No MP4 is rendered (layout + timing reference only).
export const MultiAgentRouterExample: React.FC = () => (
  <AIWorkflowDiagramV1
    columns={[
      [{ label: 'User Query', icon: 'chat' }],
      [{ label: 'Intent Router', icon: 'router' }],
      [
        { label: 'Refunds Agent', icon: 'card' },
        { label: 'Support Agent', icon: 'shield' },
        { label: 'General Agent', icon: 'message' },
      ],
      [{ label: 'LLM Engine', icon: 'brain' }],
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 0.9 },
        { target: 'col0', at: 1.1 },
        { target: 'col1', at: 2.3 },
        { target: 'col2', at: 3.5, in: 1.1 },
        { target: 'col3', at: 5.2 },
      ],
      // The router is named again at 8.4s, so it gives a brief brand pulse.
      pulses: [{ target: 'col1', at: 8.4 }],
    }}
  />
);
