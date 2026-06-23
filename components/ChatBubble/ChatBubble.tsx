// ChatBubble , rounded speech bubble for a single chat message with received (left) and sent (right) variants
import React from 'react';
import {
  appear,
  pulse,
  easeOutBack,
  easeOutQuad,
  resolveColor,
  FONT_BODY,
  COLORS,
  type Reveal,
  type ColorVariant,
} from '../_lib/kit';

// ─── Visual constants (lifted from GroupChat source geometry) ─────────────────

// Bubble geometry, matching GroupChat exactly:
//   maxWidth 760px, padding 26px H / 16px V, borderRadius 22px.
// The "tail" nub on the anchored corner is a small acute radius (8px) which
// signals direction just like WhatsApp: top-left for received, top-right for sent.
const BUBBLE_MAX_W   = 760;
const BUBBLE_PAD_X   = 26;
const BUBBLE_PAD_Y   = 16;
const BUBBLE_RADIUS  = 22;
const TAIL_RADIUS    =  8;

// ─── Colour variants ──────────────────────────────────────────────────────────

// 'received': dark mid-blue gradient, left-aligned, tail on top-left.
//   linear-gradient(180deg, #1c3c5c 0%, #122c46 100%), border rgba(255,255,255,0.06)
//
// 'sent': dodger-blue gradient, right-aligned, tail on top-right.
//   linear-gradient(180deg, #1A9CFE 0%, #0686EE 100%), border rgba(255,255,255,0.10)
//
// 'accent': wild-strawberry gradient (TextThread2Characters variant),
//   linear-gradient(180deg, #F865B0 0%, #d94d96 100%), border rgba(255,255,255,0.10)
//   right-aligned (the accent speaker is typically the "me" side).

type BubbleVariant = 'received' | 'sent' | 'accent';

const VARIANT_STYLES: Record<BubbleVariant, {
  background: string;
  border: string;
  textColor: string;
  align: 'left' | 'right';
  tailProp: 'borderTopLeftRadius' | 'borderTopRightRadius';
  transformOrigin: string;
}> = {
  received: {
    background: 'linear-gradient(180deg, #1c3c5c 0%, #122c46 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    textColor: COLORS.white,
    align: 'left',
    tailProp: 'borderTopLeftRadius',
    transformOrigin: 'top left',
  },
  sent: {
    background: 'linear-gradient(180deg, #1A9CFE 0%, #0686EE 100%)',
    border: '1px solid rgba(255,255,255,0.10)',
    textColor: COLORS.white,
    align: 'right',
    tailProp: 'borderTopRightRadius',
    transformOrigin: 'top right',
  },
  accent: {
    background: 'linear-gradient(180deg, #F865B0 0%, #d94d96 100%)',
    border: '1px solid rgba(255,255,255,0.10)',
    textColor: COLORS.white,
    align: 'right',
    tailProp: 'borderTopRightRadius',
    transformOrigin: 'top right',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

export type ChatBubbleProps = {
  frame:   number;
  reveal:  Reveal;
  // The message text to display.
  text:    string;
  // Visual variant: 'received' (dark mid-blue, left), 'sent' (dodger blue, right),
  // or 'accent' (wild-strawberry, right). Default: 'received'.
  variant?: BubbleVariant;
  // Font size for the message text in px. Default: 28 (matches GroupChat).
  fontSize?: number;
  // Optional author label shown above the bubble (left-aligned; only shown when
  // variant is 'received'). Rendered in the supplied tint colour or a default
  // dodger blue if omitted. A raw hex or ColorVariant is accepted.
  author?: string;
  authorColor?: ColorVariant;
  // Maximum bubble width in px. Default: 760.
  maxWidth?: number;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  frame,
  reveal,
  text,
  variant = 'received',
  fontSize = 28,
  author,
  authorColor = '#0794FD',
  maxWidth = BUBBLE_MAX_W,
}) => {
  // Entrance animation:
  //   scale 0.82 -> 1.0 with easeOutBack(1.6), anchored at the tail corner.
  //   translateY 18 -> 0 paired with the same back easing.
  //   opacity 0 -> 1 over the first ~55% of inFrames via easeOutQuad.
  const scaleVal = appear(frame, reveal, easeOutBack);
  if (scaleVal <= 0) return null;

  const opacityVal = appear(
    frame,
    { startFrame: reveal.startFrame, inFrames: Math.round(reveal.inFrames * 0.55) },
    easeOutQuad,
  );
  const dyVal = (1 - scaleVal) * 18;

  const p = pulse(frame, reveal);
  const v = VARIANT_STYLES[variant];
  const authorTint = resolveColor(authorColor);

  // Name height: 28px + 8px gap (matching GroupChat NAME_HEIGHT + NAME_TO_BUBBLE_GAP).
  const NAME_HEIGHT     = 28;
  const NAME_GAP        = 8;
  const showAuthor = !!author && variant === 'received';

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: v.align === 'left' ? 'flex-start' : 'flex-end',
        maxWidth,
      }}
    >
      {/* Author name, received bubbles only */}
      {showAuthor && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 700,
            fontSize: 22,
            color: authorTint,
            letterSpacing: '-0.005em',
            marginBottom: NAME_GAP,
            opacity: opacityVal,
            height: NAME_HEIGHT,
            lineHeight: `${NAME_HEIGHT}px`,
          }}
        >
          {author}
        </div>
      )}

      {/* Speech bubble */}
      <div
        style={{
          maxWidth,
          padding: `${BUBBLE_PAD_Y}px ${BUBBLE_PAD_X}px`,
          borderRadius: BUBBLE_RADIUS,
          [v.tailProp]: TAIL_RADIUS,
          background: v.background,
          border: v.border,
          color: v.textColor,
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize,
          lineHeight: 1.30,
          letterSpacing: '-0.005em',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          opacity: opacityVal,
          transform: `translateY(${dyVal}px) scale(${scaleVal * p})`,
          transformOrigin: v.transformOrigin,
        }}
      >
        {text}
      </div>
    </div>
  );
};
