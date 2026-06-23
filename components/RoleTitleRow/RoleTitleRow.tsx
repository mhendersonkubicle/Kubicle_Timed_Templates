// RoleTitleRow , bold role/name headline paired with an inline VerifiedBadge in a flex row
//
// CODE-FIRST: pure CSS flex row, no baked PNGs. Placement-agnostic: renders in
// its own box; the composing template wraps it in <Place x y>. Extracted from
// the CharacterProfileCard `name` reveal: the row slides up 32 px and fades in
// (easeOutCubic), then the badge pops in on its own cue (easeOutBack overshoot).
//
// Props:
//   frame        current Remotion frame
//   reveal       entrance Reveal for the title text (startFrame, inFrames, pulseFrames?)
//   badgeReveal  entrance Reveal for the VerifiedBadge (can start later for a staggered beat)
//   title        the role or name string
//   verified     show the VerifiedBadge when true (default true)
//   color        badge accent color, ColorVariant (default 'blue')
//   fontSize     headline font size in px (42 single-card, 32 duo, 40 team; default 42)
//   badgeSize    badge diameter in px (32 single-card, 26 duo; default 32)
//   textColor    headline color (default #0A0F18, the CharacterProfileCard dark text)

import React from 'react';
import {
  appear, pulse, easeOutCubic,
  FONT_BODY,
  type Reveal, type ColorVariant,
} from '../_lib/kit';
import { VerifiedBadge } from '../VerifiedBadge/VerifiedBadge';

export type RoleTitleRowProps = {
  frame: number;
  // Entrance reveal for the title text.
  reveal: Reveal;
  // Entrance reveal for the badge. If omitted the badge uses the same reveal as the title.
  badgeReveal?: Reveal;
  // The role or name to display.
  title: string;
  // Show the verified badge. Default true.
  verified?: boolean;
  // Badge accent color (named ColorVariant or any hex). Default 'blue'.
  color?: ColorVariant;
  // Headline font size in px. Use 42 for single-card, 32 for duo, 40 for team layouts.
  fontSize?: number;
  // Badge diameter in px. Use 32 for single-card, 26 for duo/compact layouts.
  badgeSize?: number;
  // Headline text color. Default #0A0F18 (CharacterProfileCard DARK_TEXT).
  textColor?: string;
};

// Slide-up + fade-in entrance, matching CharacterProfileCard `name` reveal exactly.
// travel: 32 px upward, easeOutCubic opacity + translateY.
function slideUpStyle(frame: number, reveal: Reveal): React.CSSProperties {
  const prog = appear(frame, reveal, easeOutCubic);
  const ty = (1 - prog) * 32;
  return {
    transform: `translateY(${ty}px)`,
    opacity: prog,
  };
}

export const RoleTitleRow: React.FC<RoleTitleRowProps> = ({
  frame,
  reveal,
  badgeReveal,
  title,
  verified = true,
  color = 'blue',
  fontSize = 42,
  badgeSize = 32,
  textColor = '#0A0F18',
}) => {
  // Pulse scale for the whole row (re-mention pulses on the title target).
  const rowPulse = pulse(frame, reveal);

  // Entrance animation: slide up + fade in.
  const anim = slideUpStyle(frame, reveal);

  // If still invisible before entrance, return null to keep the canvas clean.
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;

  // Badge uses badgeReveal if supplied; otherwise falls back to the same reveal
  // so the whole row enters together when a single cue is used.
  const resolvedBadgeReveal = badgeReveal ?? reveal;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        transform: `${anim.transform} scale(${rowPulse})`,
        transformOrigin: '0% 50%',
        opacity: anim.opacity,
      }}
    >
      {/* Bold role / name headline */}
      <span
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize,
          color: textColor,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>

      {/* Inline VerifiedBadge, gated on verified prop */}
      {verified && (
        <VerifiedBadge
          frame={frame}
          reveal={resolvedBadgeReveal}
          color={color}
          size={badgeSize}
        />
      )}
    </div>
  );
};
