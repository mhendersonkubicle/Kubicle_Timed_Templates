import React from 'react';
import { WordDefinition } from '../../WordDefinition';

// EXAMPLE SCENE, a glossary card authored as a linear two-beat definition.
//
// Narration (scene-relative seconds in brackets):
//   [0.8] "Serendipity."
//   [2.6] "It's the occurrence of events by chance in a happy or beneficial way."
//
// The reveal sequence dresses the stage first (setup: banner + icon pill),
// types the word out (title), then fades the definition in (description), 
// name-then-define, matching the canonical reveal order. The platinum-blue
// gradient background is the implicit blank stage and is always present.
//
// No MP4 is rendered, this is a layout/timing reference.
export const SerendipityExample: React.FC = () => (
  <WordDefinition
    title="Serendipity"
    description="The occurrence of events by chance in a happy or beneficial way."
    timings={{
      sequence: [
        { target: 'setup',      at: 0.3, in: 1.4 },
        { target: 'title',      at: 0.8, in: 1.3 },
        { target: 'description', at: 2.6, in: 1.6 },
      ],
    }}
  />
);
