import React from 'react';
import { TreeDiagram4x2 } from '../../TreeDiagram4x2';

// EXAMPLE SCENE, "Choosing a model" decision tree (3-branch count variation).
//
// Demonstrates the reveal-sequence model on a top-down / root-outward tree: the
// hero panel (the root topic) and the trunk stub stage in during `setup`, then
// each branch is delivered fully (its caption pill + its leaves) before the
// next, in top-to-bottom order. This is the linear, branch-complete shape
// TreeDiagram4x2 requires, see ../../GUIDANCE.md, Rule 1.
//
// The schema accepts 2-5 branches with 1-3 leaves each. Here 3 branches show the
// count variation: rows auto-centre in the band, the trunk reaches each row, and
// leaf size/spacing scale so nothing overlaps. Only setup + branch0..branch2 are
// scheduled; branch3/branch4 have no content and never render.
//
// Each step's `at` is the start time of the narration line that introduces it
// (scene-relative seconds; this scene starts at t=0 so SRT times map directly):
//   0.2  "When you pick a model, weigh three things."   -> setup (stage + root)
//   2.4  "First, cost..."                                -> branch0
//   5.0  "Second, latency..."                            -> branch1
//   7.6  "And third, quality..."                         -> branch2
//  11.0  "...so cost stays the deciding factor."         -> pulse on branch0
//
// The single pulse re-bumps the cost branch when the narration names it again
// near the end, drawing the eye back without re-animating the branch.
//
// heroIcon and all leaf icons resolve from the shared icons/ library at the repo
// root and are masked to solid white at render time (Pattern B), so the source
// SVG colour is irrelevant. No MP4 is rendered for this example.
export const DecisionTreeExample: React.FC = () => (
  <TreeDiagram4x2
    title="Choosing a Model"
    heroIcon="git-branch"
    branches={[
      { caption: 'Cost', leaves: [
        { icon: 'arrow-down', text: 'Cheaper per token at scale' },
        { icon: 'info',       text: 'Watch hidden context costs' },
      ] },
      { caption: 'Latency', leaves: [
        { icon: 'arrow-up', text: 'Faster first-token response' },
      ] },
      { caption: 'Quality', leaves: [
        { icon: 'check', text: 'Stronger on hard reasoning' },
        { icon: 'x',     text: 'Weaker on niche domains' },
        { icon: 'plus',  text: 'Improves with good prompts' },
      ] },
    ]}
    timings={{
      sequence: [
        { target: 'setup',   at: 0.2, in: 2.0 },
        { target: 'branch0', at: 2.4 },
        { target: 'branch1', at: 5.0 },
        { target: 'branch2', at: 7.6 },
      ],
      pulses: [
        { target: 'branch0', at: 11.0 },
      ],
    }}
  />
);
