import React from 'react';
import { CharacterDuoCards } from '../../CharacterDuoCards';

// EXAMPLE SCENE, "Two hosts" character duo introduction.
//
// Demonstrates the reveal-sequence model: the group is framed in one line while
// the empty card shells stage in (setup), then the left person is delivered
// fully before the right. This is the linear, one-person-at-a-time shape
// CharacterDuoCards requires, see ../../GUIDANCE.md, Rule 1.
//
// Each step's `at` is the start time of the narration line that introduces it
// (scene-relative seconds; this scene starts at t=0 so SRT times map directly):
//   0.3  "Meet the two hosts of today's session."        -> setup (card shells in)
//   1.3  "First, our product strategist..."              -> card0
//   4.5  "And alongside them, our head of design..."      -> card1
//
// A sample re-mention pulse bumps card0 at 7.2 s, where the narration names the
// product strategist again ("back to our strategist...").
//
// Assets: no Template-Specific PNGs; portraits resolve from the shared
// characters/ library at the repo root. No MP4 is rendered for this example.
export const TwoHostsExample: React.FC = () => (
  <CharacterDuoCards
    cards={[
      {
        characterId: 'male_middleage_white',
        title: 'Product Strategist',
        verified: true,
        bio: 'Helping early-stage teams ship faster and sharper.',
        followersCount: 1248,
        postsCount: 86,
        accentColor: '#0496FF', // dodger blue
      },
      {
        characterId: 'female_earlycareer_black',
        title: 'Head of Design',
        verified: true,
        bio: 'Building product systems people actually love to use.',
        followersCount: 982,
        postsCount: 54,
        accentColor: '#F865B0', // wild strawberry
      },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.3, in: 1.0 },
        { target: 'card0', at: 1.3 },
        { target: 'card1', at: 4.5 },
      ],
      pulses: [
        { target: 'card0', at: 7.2 },
      ],
    }}
  />
);
