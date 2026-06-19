import React from 'react';
import { CharacterTeamCard } from '../../CharacterTeamCard';

// EXAMPLE SCENE, a four-member team introduced one at a time.
//
// The schema accepts 2-6 members. The portrait panel auto-divides into N equal
// slots filling its width, so any count reads as one balanced team portrait.
// Here four members are scheduled: setup stages the card frame + team chrome in,
// then member0..member3 each step into place at their own narration cue. A
// re-mention pulse bumps member0 when the team lead is named again later.
//
// No MP4 rendered (layout + timing reference only).
export const ProductTeamExample: React.FC = () => (
  <CharacterTeamCard
    members={[
      { characterId: 'female_middleage_white' },
      { characterId: 'male_middleage_black' },
      { characterId: 'female_earlycareer_black' },
      { characterId: 'male_middleage_asian' },
    ]}
    title="Product Team"
    verified
    bio="Four of us, shipping the product roadmap end-to-end every sprint."
    followersCount={4821}
    postsCount={312}
    accentColor="#0496FF"
    timings={{
      sequence: [
        { target: 'setup',   at: 0.3, in: 1.0 },
        { target: 'member0', at: 1.5 },
        { target: 'member1', at: 2.6 },
        { target: 'member2', at: 3.7 },
        { target: 'member3', at: 4.8 },
      ],
      pulses: [
        // The team lead is named again when wrapping up.
        { target: 'member0', at: 7.4 },
      ],
    }}
  />
);
