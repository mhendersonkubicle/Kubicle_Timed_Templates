import React from 'react';
import { LessonGoal } from '../../LessonGoal';

// EXAMPLE SCENE, the standard single-goal lesson opener.
//
// Fixed single-instance layout: one heading + one goal statement. The reveal
// sequence schedules setup (decorative stripe) then heading then goal, in the
// canonical order. The heading defaults to "Lesson Goal" (no override here).
//
// Layout reference only, no MP4 bundled.
export const StandardGoalExample: React.FC = () => (
  <LessonGoal
    goal="Identify three risks in a project plan and propose a mitigation for each."
    timings={{
      sequence: [
        { target: 'setup',  at: 0.8, in: 2.3 },
        { target: 'heading', at: 2.0, in: 1.4 },
        { target: 'goal',   at: 2.8, in: 1.4 },
      ],
    }}
  />
);
