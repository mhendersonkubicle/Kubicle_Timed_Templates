import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS } from '../_lib/kit';
import { ChatBubble } from './ChatBubble';

// Catalog example: received (dark mid-blue, left) and sent (dodger blue, right)
// variants, plus the accent (wild-strawberry) variant. All are fully revealed
// by frame 45. Icon ids reused from the GroupChat cost-debate example.
export const ChatBubbleExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        padding: '0 120px',
      }}
    >
      {/* Left-aligned received bubble (dark mid-blue) with author label */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
        <ChatBubble
          frame={frame}
          reveal={r}
          variant="received"
          author="Margaret"
          authorColor="#4DD0B6"
          text="Cost savings would help, but what about quality?"
        />
      </div>

      {/* Right-aligned sent bubble (dodger blue) */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <ChatBubble
          frame={frame}
          reveal={{ startFrame: 4, inFrames: 12 }}
          variant="sent"
          text="I am thinking a side-by-side eval on real traffic."
        />
      </div>

      {/* Right-aligned accent bubble (wild-strawberry) */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <ChatBubble
          frame={frame}
          reveal={{ startFrame: 8, inFrames: 12 }}
          variant="accent"
          text="I will set up the eval suite by Friday."
        />
      </div>
    </AbsoluteFill>
  );
};
