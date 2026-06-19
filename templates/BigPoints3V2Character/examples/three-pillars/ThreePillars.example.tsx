import React from 'react';
import { BigPoints3V2Character } from '../../BigPoints3V2Character';

// EXAMPLE SCENE, the standard three-card team layout.
//
// This template is fixed-3: always exactly three cards, revealed left to right
// in a waterfall. Each card hosts a presenter portrait, a short title, an auto
// number, and a typewriter subtopic. `setup` is omitted, this template has no
// shared scaffolding to reveal, so card0 is the first reveal.
//
// The reveal sequence assigns one step per card, each `at` taken from the
// narration line that introduces that person. The default per-card `in` (2.4 s)
// carries the full internal cascade and lets the subtopic finish typing.
//
// No rendered MP4, layout reference only.
export const ThreePillarsExample: React.FC = () => (
  <BigPoints3V2Character
    cards={[
      { title: 'Maya', subtopic: 'Owns product vision', character: { id: 'female_earlycareer_black' } },
      { title: 'Raj',  subtopic: 'Leads engineering',  character: { id: 'male_middleage_white' } },
      { title: 'Sofia', subtopic: 'Runs go-to-market',  character: { id: 'female_middleage_asian' } },
    ]}
    timings={{
      sequence: [
        { target: 'card0', at: 0.3 },
        { target: 'card1', at: 3.4 },
        { target: 'card2', at: 6.5 },
      ],
    }}
  />
);
