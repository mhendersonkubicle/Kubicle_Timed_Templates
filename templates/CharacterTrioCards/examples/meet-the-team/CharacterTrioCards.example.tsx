import React from 'react';
import { CharacterTrioCards } from '../../CharacterTrioCards';

// EXAMPLE SCENE, a three-card team introduction on the reveal-sequence model.
//
// The content is a trio of parallel people, each with a workplace role and a
// one-line bio, so reveal order is strictly left-to-right and card-complete:
// schedule `setup` (the empty card shells rise in), then one `card{i}` per
// person in order. Each card{i} reveals its whole card, portrait then
// title/badge/bio/stats/Follow, inside its own `in` window. Sync every `at` to
// the narration cue that introduces that person.
//
// A couple of re-mention pulses are included: when the strategist (card0) and
// the engineer (card2) are named again later in the narration, they give a
// brief brand pulse at the re-mention's cue time, without re-animating.
//
// Portraits resolve from the shared character library (characters/<id>.png),
// copied in at render time. Size + position are fixed for every card.
export const MeetTheTeamExample: React.FC = () => (
  <CharacterTrioCards
    cards={[
      {
        characterId:    'male_middleage_white',
        title:          'Product Strategist',
        verified:       true,
        bio:            'Helping early-stage teams ship faster and sharper.',
        followersCount: 1248,
        postsCount:     86,
        accentColor:    '#0496FF',   // dodger blue
      },
      {
        characterId:    'female_earlycareer_black',
        title:          'Head of Design',
        verified:       true,
        bio:            'Building product systems people actually love to use.',
        followersCount: 982,
        postsCount:     54,
        accentColor:    '#F865B0',   // wild strawberry
      },
      {
        characterId:    'male_middleage_black',
        title:          'Engineering Lead',
        verified:       true,
        bio:            'Shipping reliable, well-tested code without the drama.',
        followersCount: 1567,
        postsCount:     128,
        accentColor:    '#3AB795',   // ocean green
      },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 1.0 },
        { target: 'card0', at: 1.2 },
        { target: 'card1', at: 3.0 },
        { target: 'card2', at: 4.8 },
      ],
      // Re-mention pulses: strategist named again at ~8.2s, engineer at ~9.4s.
      pulses: [
        { target: 'card0', at: 8.2 },
        { target: 'card2', at: 9.4 },
      ],
    }}
  />
);
