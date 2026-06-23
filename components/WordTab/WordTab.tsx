// WordTab , a top-left tab holding a single word or short label, on a coloured
// rounded bar. Extracted from WordDefinition's banner. Slides down into place.
// Use it as a scene's eyebrow/term tab; colour is a prop.
import React from 'react';
import {
  appear, easeOutCubic, resolveColor, shade, FONT_HEAD, type Reveal, type ColorVariant,
} from '../_lib/kit';

export type WordTabProps = {
  frame: number;
  reveal: Reveal;
  text: string;
  color?: ColorVariant;   // default 'blue'
  textColor?: string;     // default white
  height?: number;        // default 84
  fontSize?: number;      // default 40
};

export const WordTab: React.FC<WordTabProps> = ({
  frame, reveal, text, color = 'blue', textColor = '#FFFFFF', height = 84, fontSize = 40,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  const ty = -44 * (1 - prog);
  const c = resolveColor(color);
  return (
    <div style={{ transform: `translateY(${ty}px)`, opacity: prog }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', height, padding: '0 36px', borderRadius: height / 2,
        background: `linear-gradient(180deg, ${c}, ${shade(c, -14)})`, boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
      }}>
        <span style={{
          fontFamily: FONT_HEAD, fontWeight: 800, fontSize, color: textColor,
          letterSpacing: '0.01em', whiteSpace: 'nowrap',
        }}>{text}</span>
      </div>
    </div>
  );
};
