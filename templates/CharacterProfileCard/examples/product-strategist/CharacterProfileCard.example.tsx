import React from 'react';
import { CharacterProfileCard } from '../../CharacterProfileCard';

// EXAMPLE SCENE, "Product Strategist" single-character introduction.
//
// Demonstrates the reveal-sequence model: the white card pops in first (the
// staging beat), then each element reveals top-to-bottom in reading order,
// portrait -> name -> badge -> bio -> stat0 -> stat1 -> follow. This is the
// linear, top-to-bottom shape CharacterProfileCard requires, see
// ../../GUIDANCE.md, Rule 1.
//
// Each step's `at` is the start time of the narration line that introduces it
// (scene-relative seconds; this scene starts at t=0 so SRT times map directly):
//   0.2  "Meet our presenter."                          -> setup (card pop-in)
//   0.9  (portrait settles in)                          -> portrait
//   1.6  "She's a Product Strategist,"                   -> name
//   2.0  "a verified voice in the field."               -> badge
//   2.5  "She helps early-stage teams ship faster..."   -> bio
//   3.2  "With over twelve thousand followers"          -> stat0
//   3.6  "and ninety published posts."                  -> stat1
//   4.2  "Follow along to keep up."                     -> follow
//
// A sample re-mention pulse fires at 6.5 s, when the narration circles back to
// the role ("...and that strategist mindset is exactly..."), giving the name
// row a brief brand pulse without re-animating it.
//
// Assets: the portrait resolves from characters/<id>.png at the repo root; all
// other glyphs (verified tick, stat icons, Follow plus) are inline SVG. No
// Template-Specific-Assets are needed and no MP4 is rendered for this example.
export const ProductStrategistExample: React.FC = () => (
  <CharacterProfileCard
    characterId="female_midcareer_white"
    title="Product Strategist"
    verified={true}
    bio="Helping early-stage teams ship faster, sharper, and with confidence."
    stats={[
      { icon: 'followers', value: 12480 },
      { icon: 'posts', value: 96 },
    ]}
    accentColor="#0496FF"
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 0.65 },
        { target: 'portrait', at: 0.9, in: 0.65 },
        { target: 'name', at: 1.6, in: 0.5 },
        { target: 'badge', at: 2.0, in: 0.4 },
        { target: 'bio', at: 2.5, in: 0.45 },
        { target: 'stat0', at: 3.2, in: 0.4 },
        { target: 'stat1', at: 3.6, in: 0.4 },
        { target: 'follow', at: 4.2, in: 0.5 },
      ],
      pulses: [{ target: 'name', at: 6.5 }],
    }}
  />
);
