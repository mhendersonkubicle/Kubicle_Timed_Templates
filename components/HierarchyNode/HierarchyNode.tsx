// HierarchyNode , rounded label card for a single box in any hierarchy or org-chart layout
import React from 'react';
import {
  pulse, easeOutCubic,
  FONT_BODY,
  type Reveal,
} from '../_lib/kit';
import { Easing, interpolate } from 'remotion';

// Box geometry lifted directly from OrgChart.tsx layout constants.
const DEFAULT_CHILD_W = 400;
const DEFAULT_CHILD_H = 104;
const DEFAULT_TOP_W   = 440;
const DEFAULT_TOP_H   = 104;

// Background gradients, border, and shadow lifted verbatim from OrgChart.tsx.
const TOP_BG   = 'linear-gradient(135deg, #0a3050 0%, #052438 50%, #02101c 100%)';
const CHILD_BG = 'linear-gradient(135deg, #38AEFF 0%, #1A9CFE 50%, #0686EE 100%)';
const CARD_BORDER = '1px solid rgba(255,255,255,0.08)';
const CARD_SHADOW  = '0 10px 26px rgba(5,36,56,0.20)';

// easeOutBack with the same overshoot factor used in OrgChart (1.3).
const easeOutBack13 = Easing.out(Easing.back(1.3));

export type HierarchyNodeVariant = 'top' | 'child';

export type HierarchyNodeProps = {
  frame:   number;
  reveal:  Reveal;
  /** Text label. Wraps to up to three lines; keep it short. */
  label:   string;
  /**
   * 'top'   -> dark oxford gradient, Satoshi Black 30 px, borderRadius 20.
   * 'child' -> dodger-blue gradient, Satoshi Bold 26 px, borderRadius 18.
   * Default: 'child'.
   */
  variant?: HierarchyNodeVariant;
  /** Override card width in px. Defaults: 440 (top) or 400 (child). */
  width?:  number;
  /** Override card height in px. Default: 104 for both variants. */
  height?: number;
};

export const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  frame,
  reveal,
  label,
  variant = 'child',
  width,
  height,
}) => {
  const isTop = variant === 'top';
  const w = width  ?? (isTop ? DEFAULT_TOP_W : DEFAULT_CHILD_W);
  const h = height ?? (isTop ? DEFAULT_TOP_H : DEFAULT_CHILD_H);

  // Entrance: scale 0.88 -> 1.0 easeOutBack(1.3) + opacity easeOutCubic +
  // translateY -10 -> 0 easeOutCubic. Matches LabelBox in OrgChart.tsx exactly.
  const local = frame - reveal.startFrame;
  if (local < 0) return null;

  const durF = reveal.inFrames;
  const scale = interpolate(local, [0, durF], [0.88, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutBack13,
  });
  const op = interpolate(local, [0, durF * 0.6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const dy = interpolate(local, [0, durF], [-10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  const p = pulse(frame, reveal);

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        transform: `translateY(${dy}px) scale(${scale * p})`,
        transformOrigin: 'center center',
        opacity: op,
        flexShrink: 0,
      }}
    >
      {/* Card shell */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: isTop ? 20 : 18,
          background: isTop ? TOP_BG : CHILD_BG,
          border: CARD_BORDER,
          boxShadow: CARD_SHADOW,
          overflow: 'hidden',
        }}
      />
      {/* Label text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px 20px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            width: '100%',
            color: '#FFFFFF',
            fontFamily: FONT_BODY,
            fontWeight: isTop ? 900 : 700,
            fontSize: isTop ? 30 : 26,
            letterSpacing: '-0.012em',
            lineHeight: 1.15,
            textAlign: 'center',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
