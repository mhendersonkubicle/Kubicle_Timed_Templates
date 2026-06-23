// StatPairRow , horizontal row of two countable-metric stat units, each pairing a greyed icon with a bold formatted number
import React from 'react';
import {
  appear, pulse, easeOutCubic,
  FONT_BODY, FPS,
  type Reveal,
} from '../_lib/kit';

// ─── Layout constants (lifted from CharacterProfileCard) ─────────────────────
// STAT_PITCH: horizontal distance between the left-anchor of each stat column.
// STAT_GAP: space between the icon and the value text.
// CARD_PAD: left inset for the first stat (matches card's own CARD_PAD = 30).
const STAT_PITCH = 140;
const STAT_GAP   = 8;
const CARD_PAD   = 30;

// Row height matches the CharacterProfileCard bottom-row band.
const ROW_H = 56;

// Icon colour: #9CA3AF (grey, as measured from CharacterProfileCard ICON_GREY).
const ICON_GREY = '#9CA3AF';

// ─── Inline stat glyphs (pixel-exact copies from CharacterProfileCard) ───────
// Code-first SVGs for the three stat icon types: followers (person), posts
// (grid), likes (heart). Colour is always ICON_GREY, size 24x24.

function PersonIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <path
        d="M4 21 C4 16.5 7.5 13.5 12 13.5 C16.5 13.5 20 16.5 20 21"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function GridIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x={4} y={4} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <rect x={13} y={4} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <rect x={4} y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
      <rect x={13} y={13} width={7} height={7} rx={1.5} stroke={color} strokeWidth={1.8} />
    </svg>
  );
}

function HeartIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20 C12 20 3.5 14.5 3.5 8.8 C3.5 6 5.7 4 8.2 4 C9.9 4 11.3 5 12 6.3 C12.7 5 14.1 4 15.8 4 C18.3 4 20.5 6 20.5 8.8 C20.5 14.5 12 20 12 20 Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

// The three icon variants that CharacterProfileCard defines for stat glyphs.
export type StatIcon = 'followers' | 'posts' | 'likes';

// One stat unit: an icon + a countable value.
export type StatUnit = {
  icon: StatIcon;
  value: number;
};

// fontSize variants: 'single' (22px, for a 1-card layout) or 'duo' (20px, for
// tighter two-card layouts). Default: 'single'.
export type StatSizeVariant = 'single' | 'duo';

export type StatPairRowProps = {
  frame: number;
  // Two stats shown left-to-right; exactly two required (the row is a "pair").
  stats: [StatUnit, StatUnit];
  reveal: Reveal;
  // stagger: extra frame offset applied to the second stat's entrance so the
  // two stats appear in a brief cascade. Defaults to ~0.06 of a typical card
  // window (30 fps * 0.06 = ~2 frames). Expressed in frames.
  stagger?: number;
  // Font-size variant: 'single' (22 px) for a standard single card, 'duo'
  // (20 px) for tighter duo-card contexts. Default 'single'.
  size?: StatSizeVariant;
  // Text and icon colour override. Default: DARK_TEXT #0A0F18 for the value,
  // ICON_GREY #9CA3AF for the icon.
  valueColor?: string;
  iconColor?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCount = (n: number) => n.toLocaleString('en-US');

function StatGlyph({ icon, size, color }: { icon: StatIcon; size: number; color: string }) {
  if (icon === 'posts') return <GridIcon size={size} color={color} />;
  if (icon === 'likes') return <HeartIcon size={size} color={color} />;
  return <PersonIcon size={size} color={color} />;
}

// ─── Single stat cell ────────────────────────────────────────────────────────
// Encapsulates one icon+value pair with its own staggered reveal and pulse.

function StatCell({
  frame,
  stat,
  reveal,
  fontSize,
  valueColor,
  iconColor,
}: {
  frame: number;
  stat: StatUnit;
  reveal: Reveal;
  fontSize: number;
  valueColor: string;
  iconColor: string;
}) {
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;

  const p = pulse(frame, reveal);
  // Slide-up 20 px + opacity, matching the CharacterProfileCard Stat anim.
  const ty = (1 - prog) * 20;

  // Icon size: 24 for posts (grid), 26 for person/heart (matches CharacterProfileCard).
  const iconSize = stat.icon === 'posts' ? 24 : 26;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: STAT_GAP,
        transform: `translateY(${ty}px) scale(${p})`,
        transformOrigin: '50% 50%',
        opacity: prog,
      }}
    >
      <StatGlyph icon={stat.icon} size={iconSize} color={iconColor} />
      <span
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 700,
          fontSize,
          color: valueColor,
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {formatCount(stat.value)}
      </span>
    </div>
  );
}

// ─── StatPairRow ─────────────────────────────────────────────────────────────
// Horizontal row of exactly two stat units. Each unit is placed at
// CARD_PAD + i * STAT_PITCH from the left, matching the CharacterProfileCard
// bottom-row geometry. Renders in its own ROW_H box; the composing template
// positions it via <Place x y>.

export const StatPairRow: React.FC<StatPairRowProps> = ({
  frame,
  stats,
  reveal,
  stagger = Math.round(0.06 * FPS),
  size = 'single',
  valueColor = '#0A0F18',
  iconColor = ICON_GREY,
}) => {
  const fontSize = size === 'duo' ? 20 : 22;

  return (
    <div
      style={{
        position: 'relative',
        width: CARD_PAD + stats.length * STAT_PITCH,
        height: ROW_H,
      }}
    >
      {stats.map((stat, i) => {
        const cellReveal: Reveal = {
          startFrame: reveal.startFrame + i * stagger,
          inFrames: reveal.inFrames,
          pulseFrames: reveal.pulseFrames,
        };
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: CARD_PAD + i * STAT_PITCH,
              top: 0,
              height: ROW_H,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <StatCell
              frame={frame}
              stat={stat}
              reveal={cellReveal}
              fontSize={fontSize}
              valueColor={valueColor}
              iconColor={iconColor}
            />
          </div>
        );
      })}
    </div>
  );
};
