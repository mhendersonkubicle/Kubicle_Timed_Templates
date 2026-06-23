// AccentPillButton , full-radius pill CTA button with accent fill, white bold label, and a plus-icon glyph
// CODE-FIRST: pure CSS/SVG, fully recolourable via accentColor prop. Placement-agnostic.
// Source: CharacterProfileCard Follow button. Pops in with easeOutBack scale + squash modulation.
import React from 'react';
import {
  appear, pulse, easeOutBack, easeOutCubic,
  resolveColor, FONT_BODY,
  type Reveal, type ColorVariant,
} from '../_lib/kit';

// ─── Inline PlusIcon glyph (lifted from CharacterProfileCard) ────────────────

function PlusIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5 V19 M5 12 H19"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export type AccentPillButtonProps = {
  frame: number;
  reveal: Reveal;
  // Button label text. Default: 'Follow'.
  label?: string;
  // Accent fill. Accepts a named ColorVariant ('blue', 'pink', 'teal') or
  // any hex. Default: 'blue' (#0496FF, matching CharacterProfileCard default).
  accentColor?: ColorVariant;
  // Button height in px. Drives border-radius (= height/2) and font scaling.
  // 56 for a single-card layout; 48 for duo/team contexts. Default: 56.
  height?: number;
  // Show the plus-icon glyph beside the label. Default true.
  showIcon?: boolean;
};

// ─── Shadow (from CharacterProfileCard BUTTON_SHADOW) ────────────────────────

const BUTTON_SHADOW =
  '0 6px 14px rgba(15, 25, 45, 0.08), ' +
  '0 2px 4px rgba(15, 25, 45, 0.06)';

// ─── Overshoot factor matching CharacterProfileCard easeOutBackButton ────────
// The source uses Easing.out(Easing.back(2.6)) for the Follow button; we
// replicate that overshoot in a plain JS function so the component stays
// self-contained without importing Remotion Easing directly here.

function easeOutBackOvershoot(t: number, overshootFactor = 2.6): number {
  const c1 = overshootFactor;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ─── Component ───────────────────────────────────────────────────────────────

export const AccentPillButton: React.FC<AccentPillButtonProps> = ({
  frame,
  reveal,
  label = 'Follow',
  accentColor = 'blue',
  height = 56,
  showIcon = true,
}) => {
  const bg = resolveColor(accentColor);
  const radius = height / 2;

  // Font size scales proportionally with height: 22 at h=56, 19 at h=48.
  const fontSize = Math.round(22 * (height / 56));
  const iconSize = Math.round(20 * (height / 56));

  // Entrance: raw progress 0..1 clamped at reveal boundaries.
  const rawProg = appear(frame, reveal, easeOutCubic);
  if (rawProg <= 0) return null;

  // Scale driven by a back-easing with overshoot 2.6 (matches source).
  const t = Math.min(1, Math.max(0, (frame - reveal.startFrame) / Math.max(1, reveal.inFrames)));
  const baseScale = Math.max(0, easeOutBackOvershoot(t, 2.6));

  // Squash modulation: fires only during overshoot (baseScale > 1.0), giving
  // a brief horizontal stretch / vertical squash that settles to 1:1.
  const overshootNorm = Math.min(1, Math.max(0, (baseScale - 1) / 0.18));
  const stretch = overshootNorm * 0.08;
  const scaleX = baseScale * (1 + stretch);
  const scaleY = baseScale * (1 - stretch);

  // Re-mention pulse composes on top of the entrance scale.
  const p = pulse(frame, reveal);
  const finalScaleX = scaleX * p;
  const finalScaleY = scaleY * p;

  // Horizontal padding scales with height so the pill always looks proportionate.
  const padH = Math.round(22 * (height / 56));

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Math.round(6 * (height / 56)),
        height,
        paddingLeft: padH,
        paddingRight: padH,
        borderRadius: radius,
        background: bg,
        boxShadow: BUTTON_SHADOW,
        transform: `scale(${finalScaleX}, ${finalScaleY})`,
        transformOrigin: '50% 50%',
        opacity: rawProg,
        // inline-flex sizing is content-driven; the caller wraps in <Place>
        // to position on the canvas, keeping this component placement-agnostic.
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: '#FFFFFF',
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize,
          letterSpacing: '-0.01em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      {showIcon && <PlusIcon size={iconSize} color="#FFFFFF" />}
    </div>
  );
};
