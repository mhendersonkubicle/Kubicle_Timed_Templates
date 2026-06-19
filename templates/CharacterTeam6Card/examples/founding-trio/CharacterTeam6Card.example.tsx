import React from 'react';
import { CharacterTeam6Card } from '../../CharacterTeam6Card';

// EXAMPLE SCENE, count variation (3 members).
//
// The schema accepts 2-6 members. The portrait row auto-fills the panel (each
// slot = PORTRAIT_W / count wide), so fewer members still read cleanly as one
// centred team. Only member0..member2 are scheduled; the group meta (title /
// bio / stats / follow) reveals after the people.
//
// This is the linear, member-by-member reading-order shape the template
// requires, see ../../GUIDANCE.md, Rule 1. Each step's `at` is the start time of
// the narration line that introduces it (scene-relative seconds; this scene
// starts at t=0 so SRT times map directly):
//   0.3  card stages in                              -> setup
//   1.2  "Priya leads product."                      -> member0
//   2.2  "Marcus runs engineering."                  -> member1
//   3.2  "And Sofia owns design."                    -> member2
//   4.4  "They are our founding trio,"               -> title
//   5.2  "three of us shipping the whole product."   -> bio
//   6.2  (stats land)                                -> stats
//   7.0  (follow lands)                              -> follow
//
// Two re-mention pulses: when "Priya" and "design" are named again in the
// closing line, member0 and member2 give a brief brand bump.
//
// Assets: portraits resolve from the shared character library
// (characters/<id>.png) at the repo root. No MP4 is rendered for this example.
export const FoundingTrioExample: React.FC = () => (
  <CharacterTeam6Card
    characters={[
      { characterId: 'female_midcareer_white', characterTitle: 'Product Lead' },
      { characterId: 'male_earlycareer_black', characterTitle: 'Engineer' },
      { characterId: 'female_earlycareer_white', characterTitle: 'Designer' },
    ]}
    title="Founding Trio"
    verified
    bio="Three of us building the product, shipping the roadmap, owning the outcome together."
    followersCount={4120}
    postsCount={287}
    accentColor="#3AB795"
    timings={{
      sequence: [
        { target: 'setup',   at: 0.3, in: 0.6 },
        { target: 'member0', at: 1.2 },
        { target: 'member1', at: 2.2 },
        { target: 'member2', at: 3.2 },
        { target: 'title',   at: 4.4 },
        { target: 'bio',     at: 5.2 },
        { target: 'stats',   at: 6.2 },
        { target: 'follow',  at: 7.0 },
      ],
      pulses: [
        { target: 'member0', at: 8.4 },
        { target: 'member2', at: 9.0 },
      ],
    }}
  />
);
