// DarkRoundedPanel , oxford-blue dark-gradient rounded rectangle, general content stage
import React from 'react';
import {
  appear, pulse, easeOutCubic, FONT_HEAD, FONT_BODY, COLORS, type Reveal,
} from '../_lib/kit';

// Gradient, shadow, and default geometry lifted directly from BigPoints3V1.
const PANEL_GRADIENT = 'linear-gradient(180deg, #052234 0%, #041C2C 45%, #02121C 100%)';
const PANEL_SHADOW   = '0 40px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.35)';

// Canvas width used for horizontal centering.
const CANVAS_W = 1920;

export type DarkRoundedPanelProps = {
  // ── Required timing ──────────────────────────────────────────────────────
  frame:  number;
  reveal: Reveal;

  // ── Size + placement ─────────────────────────────────────────────────────
  /** Panel width in px. Default 1804 (BigPoints3V1 3-column width). */
  width?:         number;
  /** Panel height in px. Default 733 (BigPoints3V1 standard height). */
  height?:        number;
  /** Corner radius in px. Default 40. */
  borderRadius?:  number;
  /**
   * Vertical position of the panel's top edge in px, relative to the canvas.
   * Default 274 (BigPoints3V1 panel top).
   * The panel is always centred horizontally on a 1920 px canvas.
   */
  top?:           number;

  // ── Content ───────────────────────────────────────────────────────────────
  /**
   * Optional child nodes rendered inside the panel. The panel itself provides
   * the dark surface; content layout is the caller's responsibility.
   * Position children with absolute CSS or use the kit's <Place> component.
   */
  children?: React.ReactNode;
};

/**
 * DarkRoundedPanel
 *
 * A placement-agnostic, code-first oxford-blue rounded rectangle with the
 * BigPoints3V1 gradient and shadow. Width, height, corner radius, and vertical
 * position are props; the panel is auto-centred horizontally on a 1920 px
 * canvas. Pass any children to render inside the panel.
 *
 * Entrance: scale 0.93 to 1 (easeOutCubic) + opacity fade, matching the
 * BigPoints3V1 setup animation. Re-mention pulse is applied to the whole panel.
 */
export const DarkRoundedPanel: React.FC<DarkRoundedPanelProps> = ({
  frame,
  reveal,
  width        = 1804,
  height       = 733,
  borderRadius = 40,
  top          = 274,
  children,
}) => {
  const prog  = appear(frame, reveal, easeOutCubic);
  const pScale = pulse(frame, reveal);

  // Scale 0.93 -> 1 during entrance, then any pulse.
  const scale = (0.93 + prog * 0.07) * pScale;
  const left  = Math.round((CANVAS_W - width) / 2);

  return (
    <div
      style={{
        position:       'absolute',
        left,
        top,
        width,
        height,
        borderRadius,
        background:     PANEL_GRADIENT,
        boxShadow:      PANEL_SHADOW,
        opacity:        prog,
        transform:      `scale(${scale})`,
        transformOrigin:'center center',
        // Children are positioned relative to the panel.
        overflow:       'hidden',
      }}
    >
      {children}
    </div>
  );
};
