import React from 'react';
import { Pyramid5Tiers } from '../../Pyramid5Tiers';

// EXAMPLE SCENE, count variation (3 tiers) + a re-mention pulse.
//
// The schema accepts 2-5 tiers. The triangular envelope is fixed and divides
// evenly across whatever count is supplied, so 3 tiers simply means taller,
// broader slabs; the light->dark gradient re-spreads so tier0 stays lightest
// and the base tier deepest. Only setup + tier0..tier2 are scheduled.
//
// The narration re-mentions the apex ("everything serves those outcomes") a few
// seconds after its reveal, so tier0 gets a brief brand pulse at that cue.
//
// No MP4 rendered (layout + timing reference only).
export const ThreeTierExample: React.FC = () => (
  <Pyramid5Tiers
    tiers={[
      {
        title: 'Outcomes',
        body:  'What the user actually receives: value, results, and a felt sense of progress. Everything below exists to serve this.',
        icon:  'resilience-achievement-dark',
      },
      {
        title: 'Reasoning',
        body:  'Models, prompts, and chains of thought, the cognitive layer that turns raw inputs into useful outputs.',
        icon:  'arrows-loop-dark',
      },
      {
        title: 'Data',
        body:  'Documents, training sets, and embeddings. The foundation everything else is built on.',
        icon:  'documents-addfile-dark',
      },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 1.0 },
        { target: 'tier0', at: 1.3 },
        { target: 'tier1', at: 3.0 },
        { target: 'tier2', at: 4.7 },
      ],
      pulses: [
        { target: 'tier0', at: 7.2 },
      ],
    }}
  />
);
