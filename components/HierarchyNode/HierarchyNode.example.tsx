import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { HierarchyNode } from './HierarchyNode';

// Catalog example: top variant (oxford) and child variant (dodger blue), plus
// a multi-line child label, all fully revealed by frame ~45.
// Icon ids reuse the exact ids from OrgChart's own defaultProps and example.
export const HierarchyNodeExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 36,
      }}
    >
      {/* Top variant, oxford dark gradient */}
      <HierarchyNode
        frame={frame}
        reveal={r}
        label="Executive Office"
        variant="top"
      />

      {/* Child variant, dodger-blue gradient */}
      <HierarchyNode
        frame={frame}
        reveal={r}
        label="Engineering"
        variant="child"
      />

      {/* Child variant, multi-word label that wraps */}
      <HierarchyNode
        frame={frame}
        reveal={r}
        label="AI Research Lab"
        variant="child"
      />

      {/* Child variant at narrower width to test wrap to two lines */}
      <HierarchyNode
        frame={frame}
        reveal={r}
        label="Infrastructure Platform"
        variant="child"
        width={260}
      />
    </AbsoluteFill>
  );
};
