import { FivePoints1SubtopicV2Character } from '../../FivePoints1SubtopicV2Character';

// Four-milestone roadmap, fronted by a presenter character.
//
// Demonstrates the milestone-count variation (4 of the possible 5): the spine +
// card band auto-centre vertically for the count, and only milestone0..3 are
// scheduled. Narration is linear top-to-bottom, one milestone fully (title +
// description) before the next, descending the spine:
//
//   [0.3]  "Here's how an idea becomes a shipped feature."
//   [2.0]  "First, Discovery, we research what users actually need."
//   [4.8]  "Then Plan, where we map the scope and the risks."
//   [7.6]  "Next we Build the first working cut."
//   [10.4] "And finally we Launch it and measure the impact."
//
// Each cue's start time becomes the matching step's `at`. `setup` fades in the
// dodger-blue panel + character and draws the empty grey spine before any
// milestone content.

export const FourMilestoneExample: React.FC = () => (
  <FivePoints1SubtopicV2Character
    milestones={[
      { title: 'Discovery', description: 'Research user needs',  icon: 'science-magnifyingglass-dark' },
      { title: 'Plan',     description: 'Map scope and risks',  icon: 'locations-pin-dark' },
      { title: 'Build',    description: 'Ship the first cut',   icon: 'arrows-up-dark' },
      { title: 'Launch',   description: 'Roll out and measure', icon: 'enterprise-growth-dark' },
    ]}
    character={{
      id: 'presenter-red',
      characterHeight: 950,
      characterY: 175,
    }}
    timings={{
      sequence: [
        { target: 'setup',     at: 0.3, in: 1.7 },
        { target: 'milestone0', at: 2.0 },
        { target: 'milestone1', at: 4.8 },
        { target: 'milestone2', at: 7.6 },
        { target: 'milestone3', at: 10.4 },
      ],
    }}
  />
);

export default FourMilestoneExample;
