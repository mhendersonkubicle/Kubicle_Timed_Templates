// InfoBanner , oxford-blue rounded banner pairing an accent title on the left with multi-line body copy on the right; slides in from the side.
import React from 'react';
import {
  appear, pulse, easeOutBack, easeOutCubic,
  resolveColor, FONT_BODY,
  type Reveal, type ColorVariant,
} from '../_lib/kit';

// ─── Visual constants (lifted from Pyramid5Tiers banner geometry) ─────────────
const BANNER_RADIUS   = 18;
const BANNER_PAD_X    = 32;
const TITLE_BLOCK_W   = 200;
const TITLE_BODY_GAP  = 28;
const BANNER_BG       = 'linear-gradient(180deg, #0a3050 0%, #052438 60%, #02101c 100%)';
const BANNER_BORDER   = '1px solid rgba(255,255,255,0.06)';
const BANNER_SHADOW   = '0 10px 28px rgba(5,36,56,0.22)';
const TEXT_BODY_COLOR = 'rgba(255,255,255,0.82)';

// ─── Props ───────────────────────────────────────────────────────────────────
export type InfoBannerProps = {
  frame: number;
  reveal: Reveal;
  title: string;
  body: string;
  // Accent colour for the title text. Accepts a ColorVariant name ('blue',
  // 'pink', 'teal') or any hex. Default: 'blue' (#0794FD from the source).
  accentColor?: ColorVariant;
  // Banner width in px. Height adapts to content. Default: 860.
  width?: number;
  // Minimum height in px (useful for single-line body copy). Default: 100.
  minHeight?: number;
  // Title column reserved width. Default: 200 (matches Pyramid5Tiers).
  titleWidth?: number;
  // Entrance direction: 'right' slides in from right (default), 'left' from left.
  from?: 'right' | 'left';
};

export const InfoBanner: React.FC<InfoBannerProps> = ({
  frame,
  reveal,
  title,
  body,
  accentColor = 'blue',
  width = 860,
  minHeight = 100,
  titleWidth = TITLE_BLOCK_W,
  from = 'right',
}) => {
  // Entrance: banner slides in (translateX) + opacity, easeOutBack for a
  // subtle overshoot that matches the Pyramid5Tiers banner behaviour.
  const bannerProg = appear(frame, reveal, easeOutBack);
  if (bannerProg <= 0) return null;

  const dx = 60 * (1 - bannerProg) * (from === 'right' ? 1 : -1);
  const bannerOp = appear(frame, { ...reveal, inFrames: Math.round(reveal.inFrames * 0.6) }, easeOutCubic);

  // Title fades in slightly after the banner starts appearing.
  const titleReveal: Reveal = {
    startFrame: reveal.startFrame + Math.round(reveal.inFrames * 0.30),
    inFrames: Math.round(reveal.inFrames * 0.55),
    pulseFrames: reveal.pulseFrames,
  };
  const titleOp = appear(frame, titleReveal, easeOutCubic);
  const titleDx = 12 * (1 - titleOp) * (from === 'right' ? -1 : 1);

  // Body fades in a beat after the title.
  const bodyReveal: Reveal = {
    startFrame: reveal.startFrame + Math.round(reveal.inFrames * 0.45),
    inFrames: Math.round(reveal.inFrames * 0.50),
    pulseFrames: reveal.pulseFrames,
  };
  const bodyOp = appear(frame, bodyReveal, easeOutCubic);
  const bodyDx = 8 * (1 - bodyOp) * (from === 'right' ? -1 : 1);

  // Pulse scale on re-mentions (applied to the whole banner).
  const ps = pulse(frame, reveal);

  // Map the 'blue' variant to the source template's exact dodger-blue (#0794FD).
  // Other named variants and raw hex values pass through resolveColor unchanged.
  const ACCENT_MAP: Record<string, string> = { blue: '#0794FD' };
  const resolvedAccent = resolveColor(accentColor);
  const accentHex = ACCENT_MAP[accentColor as string] ?? resolvedAccent;

  return (
    <div
      style={{
        display: 'inline-block',
        transform: `translateX(${dx}px) scale(${ps})`,
        transformOrigin: 'left center',
        opacity: bannerOp,
      }}
    >
      {/* Banner shell */}
      <div
        style={{
          position: 'relative',
          width,
          minHeight,
          borderRadius: BANNER_RADIUS,
          background: BANNER_BG,
          border: BANNER_BORDER,
          boxShadow: BANNER_SHADOW,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: `14px ${BANNER_PAD_X}px`,
          gap: TITLE_BODY_GAP,
        }}
      >
        {/* Title slot */}
        <div
          style={{
            flex: `0 0 ${titleWidth}px`,
            transform: `translateX(${titleDx}px)`,
            opacity: titleOp,
            color: accentHex,
            fontFamily: FONT_BODY,
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: '-0.015em',
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>

        {/* Body slot */}
        <div
          style={{
            flex: 1,
            transform: `translateX(${bodyDx}px)`,
            opacity: bodyOp,
            color: TEXT_BODY_COLOR,
            fontFamily: FONT_BODY,
            fontWeight: 500,
            fontSize: 20,
            letterSpacing: '-0.003em',
            lineHeight: 1.40,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
};
