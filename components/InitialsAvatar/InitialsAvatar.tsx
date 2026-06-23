// InitialsAvatar , coloured circle showing 2-letter initials; colour assigned deterministically by first-appearance order
import React from 'react';
import {
  appear, pulse, easeOutBack,
  FONT_BODY,
  type Reveal,
} from '../_lib/kit';

// Tint palette ordered by first appearance (lifted from GroupChat AUTHOR_TINTS).
const TINT_PALETTE = [
  '#0794FD', // dodger blue
  '#4DD0B6', // mint teal
  '#FBBF24', // amber
  '#FF9A8B', // salmon
  '#A78BFA', // lavender
] as const;

// Derive the tint for a name given its 0-based first-appearance index.
export function tintForIndex(index: number): string {
  return TINT_PALETTE[index % TINT_PALETTE.length]!;
}

// Extract two-letter initials: first char of the first word + first char of the
// last word (uppercased). Single-word names use just the one letter.
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export type InitialsAvatarProps = {
  frame: number;
  reveal: Reveal;
  // Full name of the person (initials derived automatically).
  name: string;
  // 0-based first-appearance order index into the tint palette.
  // Pass 0 for the first person, 1 for the second, etc.
  tintIndex?: number;
  // Override colour directly (any hex or named COLORS key). Takes priority over tintIndex.
  color?: string;
  // Diameter in px. Default 64 (matches GroupChat avatar size).
  size?: number;
};

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  frame,
  reveal,
  name,
  tintIndex = 0,
  color,
  size = 64,
}) => {
  const prog = appear(frame, reveal, easeOutBack);
  if (prog <= 0) return null;

  const p = pulse(frame, reveal);
  const fill = color ?? tintForIndex(tintIndex);
  const fontSize = size * 0.40;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: fill,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow:
          'inset 0 -2px 4px rgba(0,0,0,0.20), inset 0 1px 2px rgba(255,255,255,0.25)',
        transform: `scale(${prog * p})`,
        transformOrigin: '50% 50%',
        opacity: prog,
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
          userSelect: 'none',
        }}
      >
        {initialsOf(name)}
      </span>
    </div>
  );
};
