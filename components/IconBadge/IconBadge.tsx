// IconBadge , an icon in a coloured circle sitting in a white rounded surround
// (a "white icon side tab"). Extracted from WordDefinition's icon pill. Slides in
// from the chosen side. Circle colour and surround are props.
import React from 'react';
import {
  appear, pulse, easeOutCubic, resolveColor, Icon, type Reveal, type ColorVariant,
} from '../_lib/kit';

export type IconBadgeProps = {
  frame: number;
  reveal: Reveal;
  icon: string;                 // icon id; rendered white inside the circle
  circleColor?: ColorVariant;   // default 'blue'
  surroundColor?: string;       // default white
  side?: 'left' | 'right';      // slide-in direction, default 'right'
  size?: number;                // outer surround size, default 280
};

export const IconBadge: React.FC<IconBadgeProps> = ({
  frame, reveal, icon, circleColor = 'blue', surroundColor = '#FFFFFF', side = 'right', size = 280,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;
  const dir = side === 'right' ? 1 : -1;
  const tx = dir * 80 * (1 - prog);
  const p = pulse(frame, reveal);
  const c = resolveColor(circleColor);
  const circle = size * 0.66;
  return (
    <div style={{ width: size, height: size, transform: `translateX(${tx}px) scale(${p})`, opacity: prog }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.22, background: surroundColor,
        boxShadow: '0 10px 26px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: circle, height: circle, borderRadius: '50%', background: c,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon id={icon} size={circle * 0.56} tint="#FFFFFF" />
        </div>
      </div>
    </div>
  );
};
