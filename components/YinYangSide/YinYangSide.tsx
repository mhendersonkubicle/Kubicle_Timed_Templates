// YinYangSide , one side of a two-sided comparison: a coloured title bar above
// one or two boxes, each box an icon over a caption. Extracted from
// YinYang2Points' ContainerGroup. `side` sets the default accent (left = blue,
// right = teal) but any colour can be passed. Code-first approximation of the
// original split-panel shape (clean rounded panels, not the baked yin-yang curve).
import React from 'react';
import {
  appear, pulse, easeOutBack, easeOutCubic, resolveColor, shade, Icon,
  FONT_HEAD, FONT_BODY, type Reveal, type ColorVariant,
} from '../_lib/kit';

export type YinYangBox = { icon: string; text: string; reveal: Reveal };
export type YinYangSideProps = {
  frame: number;
  title: string;
  titleReveal: Reveal;
  boxes: YinYangBox[];          // 1 or 2
  side?: 'left' | 'right';      // default accent: left=blue, right=teal
  accent?: ColorVariant;        // override the accent colour
  width?: number;               // default 620
};

export const YinYangSide: React.FC<YinYangSideProps> = ({
  frame, title, titleReveal, boxes, side = 'left', accent, width = 620,
}) => {
  const c = resolveColor(accent ?? (side === 'left' ? 'blue' : 'teal'));
  const titleProg = appear(frame, titleReveal, easeOutCubic);
  const titleH = 96;
  const boxH = 188;
  const gap = 22;

  return (
    <div style={{ width }}>
      {/* coloured title bar */}
      <div style={{
        height: titleH, borderRadius: 18, background: `linear-gradient(180deg, ${c}, ${shade(c, -16)})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: gap,
        transform: `translateY(${-30 * (1 - titleProg)}px)`, opacity: titleProg,
        boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
      }}>
        <span style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 44, color: '#FFFFFF', whiteSpace: 'nowrap' }}>
          {title}
        </span>
      </div>

      {/* boxes (icon over caption) */}
      {boxes.slice(0, 2).map((b, i) => {
        const s = appear(frame, b.reveal, easeOutBack);
        if (s <= 0) return <div key={i} style={{ height: boxH, marginBottom: gap }} />;
        const p = pulse(frame, b.reveal);
        return (
          <div key={i} style={{
            height: boxH, borderRadius: 18, background: '#FFFFFF', marginBottom: gap,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
            transform: `scale(${s * p})`, transformOrigin: 'center center',
            boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
          }}>
            <div style={{
              width: 78, height: 78, borderRadius: '50%', background: c,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon id={b.icon} size={44} tint="#FFFFFF" />
            </div>
            <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 32, color: '#0C1A28', textAlign: 'center' }}>
              {b.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
