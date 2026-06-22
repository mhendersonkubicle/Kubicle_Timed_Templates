import React from 'react';
import { FivePoints1SubtopicV2 } from '../../FivePoints1SubtopicV2';

// EXAMPLE SCENE, count variation (3 milestones).
//
// The schema accepts 1-5 milestones. The card/tick column auto-centres
// vertically and the dotted spine spans the first to the last tick, so fewer
// milestones still sit centred and read cleanly. Only card0/tick0..card2/tick2
// are scheduled; card3/tick3 and card4/tick4 have no content and never render.
//
// Reveal order is the canonical roadmap order: setup, then each milestone's
// card followed a beat later by its tick, top to bottom.
export const FivePoints1SubtopicV2ThreeMilestoneExample: React.FC = () => (
  <FivePoints1SubtopicV2
    milestones={[
      { title: 'Discovery', description: 'Research user needs', icon: 'science-magnifyingglass-dark' },
      { title: 'Plan',     description: 'Map scope and risks', icon: 'locations-pin-dark' },
      { title: 'Launch',   description: 'Roll out and measure', icon: 'enterprise-growth-dark' },
    ]}
    anchor={{ kind: 'icon', id: 'business-strategy-growth-dark' }}
    timings={{
      sequence: [
        { target: 'setup', at: 0.3, in: 1.6 },
        { target: 'card0', at: 2.0 },
        { target: 'tick0', at: 2.7 },
        { target: 'card1', at: 5.0 },
        { target: 'tick1', at: 5.7 },
        { target: 'card2', at: 8.0 },
        { target: 'tick2', at: 8.7 },
      ],
    }}
  />
);
