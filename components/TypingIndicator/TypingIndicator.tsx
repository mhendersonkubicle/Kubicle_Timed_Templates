// TypingIndicator , three-dot animated bubble shown before a chat message appears
// CODE-FIRST: pure CSS/SVG. Placement-agnostic (render inside <Place>).
// Source: GroupChat TypingDots + typing bubble geometry.
import React from 'react';
import { interpolate } from 'remotion';
import {
  appear, pulse, easeOutCubic, FONT_BODY, type Reveal,
} from '../_lib/kit';

// Geometry lifted exactly from GroupChat.tsx
const BUBBLE_W      = 96;
const BUBBLE_H      = 50;
const BUBBLE_RADIUS = 22;
const DOT_SIZE      = 11;   // px diameter for first two dots
const DOT_SIZE_MID  = 12;   // middle dot is 1px larger (GroupChat uses 11, spec says 11-12)
const DOT_GAP       = 8;
const CYCLE         = 30;   // breathing cycle in frames
const PHASE_OFFSET  = 5;    // per-dot stagger in frames

// Bubble gradient matches the GroupChat "received" bubble exactly.
const BUBBLE_BG     = 'linear-gradient(180deg, #1c3c5c 0%, #122c46 100%)';
const BUBBLE_BORDER = '1px solid rgba(255,255,255,0.06)';
const BUBBLE_SHADOW = '0 4px 12px rgba(0,0,0,0.25)';

export type TypingIndicatorProps = {
  frame: number;
  reveal: Reveal;
  // fadeOutAtFrame: when set, the bubble fades out to opacity 0 as the real
  // bubble lands. This mirrors the GroupChat logic where typingOp falls to 0
  // over 4 frames once the bubble reveal starts.
  fadeOutAtFrame?: number;
  // How many frames the fade-out lasts (default 4, same as GroupChat).
  fadeOutDur?: number;
};

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  frame,
  reveal,
  fadeOutAtFrame,
  fadeOutDur = 4,
}) => {
  // Entrance: pop in using appear() with easeOutCubic (same as bubble entrance).
  const enterProg = appear(frame, reveal, easeOutCubic);
  // Re-mention pulse scale (1 at rest, minor bump when pulsed).
  const ps = pulse(frame, reveal);

  if (enterProg <= 0) return null;

  // Fade out when the real bubble starts to land. If fadeOutAtFrame is not
  // supplied the indicator persists (useful for standalone preview).
  let fadeOp = 1;
  if (fadeOutAtFrame !== undefined) {
    fadeOp = interpolate(
      frame,
      [fadeOutAtFrame, fadeOutAtFrame + fadeOutDur],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
  }

  const opacity = enterProg * fadeOp;
  if (opacity <= 0) return null;

  // Three dots: 30-frame breathing cycle, 5-frame phase offset per dot.
  // Opacity oscillates 0.30 -> 1.0 -> 0.30 matching GroupChat TypingDots exactly.
  const dots = [0, 1, 2].map((i) => {
    const localFrame = frame - reveal.startFrame;
    const phase = ((localFrame - i * PHASE_OFFSET) % CYCLE + CYCLE) % CYCLE;
    const dotOp = phase < 15
      ? 0.30 + 0.70 * (phase / 15)
      : 0.30 + 0.70 * (1 - (phase - 15) / 15);
    const size = i === 1 ? DOT_SIZE_MID : DOT_SIZE;
    return { key: i, opacity: dotOp, size };
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: BUBBLE_W,
        height: BUBBLE_H,
        borderRadius: BUBBLE_RADIUS,
        // Subtle WhatsApp-style top-left tail corner (same as GroupChat left bubble).
        borderTopLeftRadius: 8,
        background: BUBBLE_BG,
        border: BUBBLE_BORDER,
        boxShadow: BUBBLE_SHADOW,
        opacity,
        transform: `scale(${ps})`,
        transformOrigin: 'top left',
        // Suppress any accidental font-rendering shift.
        fontFamily: FONT_BODY,
      }}
    >
      <div style={{ display: 'flex', gap: DOT_GAP, alignItems: 'center' }}>
        {dots.map(({ key, opacity: dotOp, size }) => (
          <div
            key={key}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#FFFFFF',
              opacity: dotOp,
            }}
          />
        ))}
      </div>
    </div>
  );
};
