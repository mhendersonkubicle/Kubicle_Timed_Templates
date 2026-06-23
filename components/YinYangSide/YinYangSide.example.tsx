import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { YinYangSide } from './YinYangSide';

// Catalog example: the left and right sides shown together.
export const YinYangSideExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 14 };
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 80,
    }}>
      <YinYangSide
        frame={frame} side="left" title="Manual" titleReveal={r} width={520}
        boxes={[
          { icon: 'documents-clipboard-dark', text: 'Hand-keyed', reveal: r },
          { icon: 'business-strategy-target-dark', text: 'Error-prone', reveal: r },
        ]}
      />
      <YinYangSide
        frame={frame} side="right" title="Agent" titleReveal={r} width={520}
        boxes={[
          { icon: 'network-system-dark', text: 'Connected', reveal: r },
          { icon: 'core-values-value-dark', text: 'Acts for you', reveal: r },
        ]}
      />
    </AbsoluteFill>
  );
};
