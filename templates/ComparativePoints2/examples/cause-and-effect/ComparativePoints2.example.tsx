import React from 'react';
import { ComparativePoints2 } from '../../ComparativePoints2';

// EXAMPLE SCENE, "Reading skills" two-point linkage.
//
// Demonstrates the reveal-sequence model: a one-line link is named during the
// setup, then the left point is delivered fully before the right. This is the
// linear two-point linkage shape ComparativePoints2 requires, see
// ../../GUIDANCE.md, Rule 1.
//
// Each step's `at` is the start time of the narration line that introduces it
// (scene-relative seconds; this scene starts at t=0 so SRT times map directly):
//   0.4  "Two reading skills that work together."  -> setup (bg + chain connector)
//   2.8  "First, word recognition..."              -> leftPoint
//   6.0  "And it links to working memory..."        -> rightPoint
//
// Assets: the four PNGs ship in Template-Specific-Assets/; side icon ids resolve
// from the shared Icons/ library at the repo root. No MP4 is rendered for this
// example.
export const ReadingSkillsExample: React.FC = () => (
  <ComparativePoints2
    points={[
      { icon: 'vocabulary', label: 'Word recognition' },
      { icon: 'strong-mind', label: 'Working memory' },
    ]}
    timings={{
      sequence: [
        { target: 'setup',     at: 0.4, in: 2.4 },
        { target: 'leftPoint', at: 2.8, in: 1.4 },
        { target: 'rightPoint', at: 6.0, in: 1.4 },
      ],
    }}
  />
);
