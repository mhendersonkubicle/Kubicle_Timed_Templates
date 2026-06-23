// RecapPillRow , a full-canvas PNG-backed recap pill with a bold caption overlay; slides up and fades in.
//
// ASSET-BACKED (canvas-region): renders the real CourseSummary or LessonSummary
// pill artwork as a full 1920x1080 layer translated by rowIndex * ROW_PITCH so
// it lands at the correct row in a stacked band. The caption overlays at the
// source template's measured coordinates. Multiple instances auto-centre as a
// band: the composing template passes the total pill count (totalRows) and this
// row's index (rowIndex) so firstPillTop is calculated consistently.
//
// Entrance: slides up ~130 px (CourseSummary roll model) or 130 px + opacity
// ramp (LessonSummary slideUp model) over inFrames, easeOutCubic.
// Pulse: +5% scale half-sine around the pill body centre, on each pulse frame.
//
// Two style variants:
//   'white'  CourseSummary pill (course_summary_pill.png), black #000 caption,
//            Satoshi Bold 37px. Pill alpha-bbox: x=605..1785, y=116..261.
//   'dark'   LessonSummary pill (lesson_summary_pill.png), white caption,
//            Arial 600 28px. Pill natural top 329, height 93.
import React from 'react';
import { Img, staticFile } from 'remotion';
import {
  appear, pulse, easeOutCubic, easeOutQuad, type Reveal,
} from '../_lib/kit';

// ─── Variant definitions ─────────────────────────────────────────────────────

const VARIANTS = {
  white: {
    src: 'Template-Specific-Assets/CourseSummary/course_summary_pill.png',
    // Pill alpha-bbox within the 1920x1080 PNG.
    pillAssetTop:    116,
    pillHeight:      145,
    pillLeft:        605,
    pillRight:       1785,
    // Text overlay coordinates.
    textLeft:        790,
    textMaxWidth:    965,   // pillRight - textLeft - 30
    textColor:       '#000000',
    fontFamily:      "'Satoshi', system-ui, sans-serif" as string,
    fontWeight:      700,
    fontSize:        37,
    // Entry: "roll" style (translate from prev pill top OR off-canvas top).
    // Opacity is 1 from the start (same as CourseSummary).
    rollOpacity:     false,
  },
  dark: {
    src: 'Template-Specific-Assets/LessonSummary/lesson_summary_pill.png',
    pillAssetTop:    329,
    pillHeight:      93,
    pillLeft:        133,
    pillRight:       1787,
    // Text overlay: left-aligned inside the pill.
    textLeft:        242,
    textMaxWidth:    1200,
    textColor:       '#FFFFFF',
    fontFamily:      'Arial, system-ui, sans-serif' as string,
    fontWeight:      600,
    fontSize:        28,
    // Entry: "slideUp" style (translate down 130px, opacity ramp over first 25%).
    rollOpacity:     true,
  },
} as const;

export type RecapPillVariant = 'white' | 'dark';

// ─── Layout helpers ───────────────────────────────────────────────────────────

// Row pitch for each variant: must match the source template's spacing.
const ROW_PITCH: Record<RecapPillVariant, number> = {
  white: 155,   // CourseSummary ROW_PITCH
  dark:  118,   // LessonSummary PILL_SPACING
};

const CANVAS_H = 1080;
const CANVAS_CY = 540;
const SLIDE_DISTANCE = 130;   // both variants use ~130 px entrance travel

// The top edge of the first pill in a band of `totalRows` pills, centred on
// CANVAS_CY. Matches the CourseSummary formula exactly.
function firstPillTop(variant: RecapPillVariant, totalRows: number): number {
  const pitch = ROW_PITCH[variant];
  const pillH = VARIANTS[variant].pillHeight;
  return CANVAS_CY - ((totalRows - 1) * pitch + pillH) / 2;
}

// The final resting top of pill at `rowIndex` within a band of `totalRows`.
export function pillTop(variant: RecapPillVariant, totalRows: number, rowIndex: number): number {
  return firstPillTop(variant, totalRows) + rowIndex * ROW_PITCH[variant];
}

// The Y offset that places the pill PNG so its alpha row lands at `toTop`.
function assetOffsetY(variant: RecapPillVariant, toTop: number): number {
  return toTop - VARIANTS[variant].pillAssetTop;
}

// ─── Component ────────────────────────────────────────────────────────────────

export type RecapPillRowProps = {
  frame:     number;
  reveal:    Reveal;
  text:      string;
  rowIndex:  number;       // 0-based index within the stacked band
  totalRows: number;       // total number of pills in the band (for auto-centring)
  variant?:  RecapPillVariant;  // 'white' (CourseSummary) or 'dark' (LessonSummary); default 'white'
  // z-order: CourseSummary puts pill 0 on top. Pass (totalRows - rowIndex) to
  // replicate that; default is natural stacking order.
  zIndex?: number;
};

export const RecapPillRow: React.FC<RecapPillRowProps> = ({
  frame, reveal, text, rowIndex, totalRows, variant = 'white', zIndex,
}) => {
  const v = VARIANTS[variant];
  const pitch = ROW_PITCH[variant];

  // The pill's resting top on the canvas.
  const toTop = firstPillTop(variant, totalRows) + rowIndex * pitch;

  // Entrance: slide from above. CourseSummary uses a "roll from under previous"
  // entry; here we expose a simpler but equivalent slide-up from above the row.
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;

  const ty = (1 - prog) * -SLIDE_DISTANCE;
  // CourseSummary keeps opacity=1 during roll; LessonSummary ramps opacity
  // quickly over the first 25% of progress (raw * 4 clamped).
  let opacity: number;
  if (v.rollOpacity) {
    // Reproduce LessonSummary's "raw * 4" fast opacity ramp.
    const raw = appear(frame, reveal, (t) => t);   // linear progress
    opacity = Math.min(1, raw * 4);
  } else {
    // Softer fade-in aligned to eased progress for the white pill.
    opacity = appear(frame, { ...reveal, inFrames: Math.round(reveal.inFrames * 0.6) }, easeOutQuad);
    opacity = Math.min(1, opacity);
  }

  // Pulse: scale around the pill body centre on re-mention.
  const pillCX = (v.pillLeft + v.pillRight) / 2;
  const pillCY = toTop + v.pillHeight / 2;   // canvas-absolute centre after landing
  const p = pulse(frame, reveal);

  // Asset offset: translate the full-canvas PNG so its pill row lands at toTop.
  const assetOff = assetOffsetY(variant, toTop);

  const z = zIndex ?? (totalRows - rowIndex);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: CANVAS_H,
        opacity,
        transform: `translateY(${ty}px) scale(${p})`,
        transformOrigin: `${pillCX}px ${pillCY}px`,
        zIndex: z,
        pointerEvents: 'none',
      }}
    >
      {/* Full-canvas pill PNG, offset so its pill row sits at toTop. */}
      <Img
        src={staticFile(v.src)}
        alt=""
        style={{
          position: 'absolute',
          top: assetOff,
          left: 0,
          width: 1920,
          height: CANVAS_H,
          display: 'block',
        }}
      />

      {/* Caption overlay, vertically centred on the pill row. */}
      <div
        style={{
          position: 'absolute',
          top: toTop,
          left: v.textLeft,
          width: v.textMaxWidth,
          height: v.pillHeight,
          display: 'flex',
          alignItems: 'center',
          fontFamily: v.fontFamily,
          fontWeight: v.fontWeight,
          fontSize: v.fontSize,
          lineHeight: 1.15,
          color: v.textColor,
          letterSpacing: variant === 'white' ? '-0.01em' : '0.01em',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {text}
      </div>
    </div>
  );
};
