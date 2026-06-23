// IconPill , a caption pill with an optional circular icon badge on the left.
// Extracted from SplitscreenPointsV1's AnimPill; the circle/pill colour is a prop
// (blue / pink / teal / any hex), so it works on either side of a comparison or
// anywhere a labelled point is needed. Pops in with easeOutBack, caption fades in.
import React from 'react';
import {
  appear, pulse, easeOutBack, easeOutQuad, resolveColor, shade, Icon, FONT_BODY, FPS,
  type Reveal, type ColorVariant,
} from '../_lib/kit';

export type IconPillProps = {
  frame: number;
  reveal: Reveal;
  text: string;
  icon?: string;            // icon id (icons/<id>.svg); rendered white inside the badge
  color?: ColorVariant;     // pill colour, default 'blue'
  textColor?: string;       // caption colour override
  width?: number;           // default 560
  height?: number;          // default 96
};

export const IconPill: React.FC<IconPillProps> = ({
  frame, reveal, text, icon, color = 'blue', textColor, width = 560, height = 96,
}) => {
  const scale = appear(frame, reveal, easeOutBack);
  if (scale <= 0) return null;
  const c = resolveColor(color);
  const p = pulse(frame, reveal);
  const textOp = appear(frame, { startFrame: reveal.startFrame + Math.round(0.18 * FPS), inFrames: Math.round(0.4 * FPS) }, easeOutQuad);
  // light fills (pink/teal/pale hex) read better with dark ink captions
  const isLight = color === 'pink' || color === 'teal' || /^#[E-Fe-f]/.test(c);
  const cap = textColor ?? (isLight ? '#0C1A28' : '#FFFFFF');
  const r = height / 2;
  const badge = height - 20;

  return (
    <div style={{ width, height, transform: `scale(${scale * p})`, transformOrigin: 'left center' }}>
      <div style={{
        position: 'relative', width, height, borderRadius: r,
        background: `linear-gradient(180deg, ${c}, ${shade(c, -14)})`,
        boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
        display: 'flex', alignItems: 'center',
        paddingLeft: icon ? height + 10 : 30, paddingRight: 30,
      }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 10, top: 10, width: badge, height: badge, borderRadius: '50%',
            background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon id={icon} size={badge * 0.56} tint={c} />
          </div>
        )}
        <span style={{
          fontFamily: FONT_BODY, fontWeight: 700, fontSize: 34, color: cap, opacity: textOp,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{text}</span>
      </div>
    </div>
  );
};
