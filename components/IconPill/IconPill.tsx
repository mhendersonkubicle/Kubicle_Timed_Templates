// IconPill , a caption pill with an optional circular icon badge on the left.
// ASSET-BACKED: uses the real SplitscreenPointsV1 pill artwork (pixel-faithful),
// with the icon + caption overlaid at the original geometry. Colour is the pill
// variant that ships as a PNG: 'blue' (left) or 'pink' (right). Pops in with
// easeOutBack; caption fades in. Fixed size (the artwork's pill size).
import React from 'react';
import { Img, staticFile } from 'remotion';
import { appear, pulse, easeOutBack, easeOutQuad, Icon, FONT_BODY, FPS, type Reveal } from '../_lib/kit';

// Pill geometry inside each 1920x1080 pill PNG (from SplitscreenPointsV1).
const PILL_W = 693, PILL_H = 111, CIRCLE_D = 111, PILL_Y = 353;
const VARIANTS: Record<string, { src: string; originX: number; textColor: string }> = {
  blue: { src: 'Template-Specific-Assets/SplitscreenPointsV1/pill_left_side.png', originX: 156, textColor: '#FFFFFF' },
  pink: { src: 'Template-Specific-Assets/SplitscreenPointsV1/pill_right_side.png', originX: 1032, textColor: '#0C1A28' },
};

export type IconPillProps = {
  frame: number;
  reveal: Reveal;
  text: string;
  icon?: string;             // icon id; rendered white in the circle
  color?: 'blue' | 'pink';   // the pill variant that exists as artwork; default 'blue'
};

export const IconPill: React.FC<IconPillProps> = ({ frame, reveal, text, icon, color = 'blue' }) => {
  const scale = appear(frame, reveal, easeOutBack);
  if (scale <= 0) return null;
  const v = VARIANTS[color] ?? VARIANTS.blue;
  const p = pulse(frame, reveal);
  const textOp = appear(frame, { startFrame: reveal.startFrame + Math.round(0.18 * FPS), inFrames: Math.round(0.3 * FPS) }, easeOutQuad);

  return (
    <div style={{ width: PILL_W, height: PILL_H, transform: `scale(${scale * p})`, transformOrigin: 'left center' }}>
      <div style={{ position: 'relative', width: PILL_W, height: PILL_H }}>
        {/* real pill artwork, windowed to this pill out of the full-frame PNG */}
        <Img src={staticFile(v.src)} style={{ position: 'absolute', top: -PILL_Y, left: -v.originX, width: 1920, height: 1080, display: 'block' }} />
        {icon && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: CIRCLE_D, height: CIRCLE_D, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
            <Icon id={icon} size={CIRCLE_D * 0.58} tint="#FFFFFF" />
          </div>
        )}
        <div style={{ position: 'absolute', left: CIRCLE_D + 18, top: 0, height: PILL_H, display: 'flex', alignItems: 'center', opacity: textOp, zIndex: 3 }}>
          <span style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 40, color: v.textColor, whiteSpace: 'nowrap', letterSpacing: '-0.3px', transform: 'translateY(-5px)' }}>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};
