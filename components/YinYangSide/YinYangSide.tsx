// YinYangSide , one side of the YinYang comparison. ASSET-BACKED: renders the
// real base + title-bar + box artwork (the split-curve cannot be reproduced in
// CSS) and overlays only the dynamic title, icons, and captions at the template's
// measured coordinates. This is a CANVAS-REGION component: it occupies its half
// of the 1920x1080 stage (render it directly, not inside <Place>), so pair the
// two sides, or pair one side with other components placed in the other half.
import React from 'react';
import { Img, staticFile } from 'remotion';
import {
  appear, pulse, easeOutCubic, easeOutBack, resolveColor, Icon,
  FONT_HEAD, FONT_BODY, type Reveal, type ColorVariant,
} from '../_lib/kit';

const A = 'Template-Specific-Assets/YinYang2Points/';
const SIDES = {
  left:  { base: 'base_1.png', title: 'title1_box.png', boxes: 'base_1_two_boxes.png', titleCx: 490,  iconCxs: [284, 673],   singleCx: 490,  accent: '#0496FF' },
  right: { base: 'base_2.png', title: 'title2_box.png', boxes: 'base_2_two_boxes.png', titleCx: 1445, iconCxs: [1256, 1644], singleCx: 1445, accent: '#F865B0' },
} as const;

// measured geometry (from YinYang2Points)
const TITLE_CY = 348, TITLE_SIZE = 55.5, TITLE_MAXW = 690;
const ICON_SIZE = 300, ICON_CY = 600;
const BOX_CY = 856, BOX_W = 354, BOX_H = 127, BOX_RADIUS = 13, BOX_TEXT_SIZE = 37;
const FULL: React.CSSProperties = { position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, display: 'block', pointerEvents: 'none' };

export type YinYangBox = { icon: string; text: string; reveal: Reveal };
export type YinYangSideProps = {
  frame: number;
  side?: 'left' | 'right';
  title: string;
  titleReveal: Reveal;
  boxes: YinYangBox[];        // 1 or 2
  accent?: ColorVariant;      // override the icon accent (default: left blue, right pink)
};

export const YinYangSide: React.FC<YinYangSideProps> = ({ frame, side = 'left', title, titleReveal, boxes, accent }) => {
  const s = SIDES[side];
  const acc = accent ? resolveColor(accent) : s.accent;
  const baseProg = appear(frame, titleReveal, easeOutCubic);
  const two = boxes.length >= 2;
  const centers = two ? s.iconCxs : [s.singleCx];

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: baseProg }}>
      <Img src={staticFile(A + s.base)} style={FULL} />
      <Img src={staticFile(A + s.title)} style={FULL} />
      {two
        ? <Img src={staticFile(A + s.boxes)} style={FULL} />
        : <div style={{ position: 'absolute', left: s.singleCx - BOX_W / 2, top: BOX_CY - BOX_H / 2, width: BOX_W, height: BOX_H, borderRadius: BOX_RADIUS, background: '#FFFFFF', boxShadow: '0 6px 16px rgba(0,0,0,0.16)' }} />}

      {/* title text on the coloured bar */}
      <div style={{ position: 'absolute', left: s.titleCx - TITLE_MAXW / 2, top: TITLE_CY - TITLE_SIZE * 0.72, width: TITLE_MAXW, textAlign: 'center' }}>
        <span style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: TITLE_SIZE, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{title}</span>
      </div>

      {/* per-box icon (above) + caption (in the white box) */}
      {boxes.slice(0, 2).map((b, i) => {
        const cx = centers[i] ?? s.singleCx;
        const sc = appear(frame, b.reveal, easeOutBack);
        if (sc <= 0) return null;
        const p = pulse(frame, b.reveal);
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: cx - ICON_SIZE / 2, top: ICON_CY - ICON_SIZE / 2, width: ICON_SIZE, height: ICON_SIZE, transform: `scale(${sc * p})`, transformOrigin: 'center center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon id={b.icon} size={ICON_SIZE * 0.6} tint={acc} />
            </div>
            <div style={{ position: 'absolute', left: cx - (BOX_W - 24) / 2, top: BOX_CY - BOX_TEXT_SIZE * 0.72, width: BOX_W - 24, textAlign: 'center', opacity: sc }}>
              <span style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: BOX_TEXT_SIZE, color: '#0C1A28', whiteSpace: 'nowrap' }}>{b.text}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
