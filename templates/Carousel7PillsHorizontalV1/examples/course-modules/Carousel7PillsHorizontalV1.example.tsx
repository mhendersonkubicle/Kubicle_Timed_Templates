import React from 'react';
import { Carousel7PillsHorizontalV1 } from '../../Carousel7PillsHorizontalV1';

// EXAMPLE SCENE, course-module breakdown (5-pill count variation).
//
// The schema accepts 1-7 pills. The conveyor sizes to the count, so 5 pills
// just makes a shorter sweep than the full 7. The sequence opens on the
// platinum intro wipe (setup), reveals pill0..pill4 contiguously in conveyor
// order as the camera lands on each, then closes on the platinum mask (outro).
//
// Narration would introduce the five modules strictly left to right, one at a
// time, in sync with each pill{i}.at.
export const CourseModulesExample: React.FC = () => (
  <Carousel7PillsHorizontalV1
    pills={[
      { label: 'Foundations' },
      { label: 'Core concepts' },
      { label: 'Hands-on labs' },
      { label: 'Case studies' },
      { label: 'Certification' },
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.0, in: 0.6 },
        { target: 'pill0', at: 0.8 },
        { target: 'pill1', at: 2.6 },
        { target: 'pill2', at: 4.4 },
        { target: 'pill3', at: 6.2 },
        { target: 'pill4', at: 8.0 },
        { target: 'outro', at: 11.0, in: 1.5 },
      ],
    }}
  />
);
