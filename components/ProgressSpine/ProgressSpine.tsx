// ProgressSpine , vertical dotted spine rail tracking milestone reveal progress
//
// ASSET-BACKED, CANVAS-REGION component: renders the real FivePoints1SubtopicV2
// PNG artwork (dotted_line_base.png + blue_dotted_line_base.png) as two overlaid
// full-canvas (1920x1080) images, each clipped to show only the active segment.
//
// Grey rail: clipPath inset draws downward during setup (0 -> spineHeight),
// easeInOutCubic over the reveal window.
//
// Blue overlay: clips to the distance from spineTop to the deepest revealed
// tick's CY. Recomputed each frame from `revealedCount`.
//
// Render directly (not inside <Place>) alongside other canvas-region components.
// Typically paired with milestone cards and ticks on the FivePoints1SubtopicV2
// right-side layout.

import React from 'react';
import { Easing, Img, interpolate, staticFile } from 'remotion';
import { type Reveal } from '../_lib/kit';

// ── Asset paths (Template-Specific-Assets namespacing) ──────────────────────
const DOTTED_LINE_SRC      = 'Template-Specific-Assets/FivePoints1SubtopicV2/dotted_line_base.png';
const BLUE_DOTTED_LINE_SRC = 'Template-Specific-Assets/FivePoints1SubtopicV2/blue_dotted_line_base.png';

// ── Geometry (lifted verbatim from FivePoints1SubtopicV2) ────────────────────
// Milestone CYs auto-centre for `count` milestones using the same formula.
const CANVAS_CY  = 540;
const CARD_PITCH = 200;

function tickCyFor(count: number, i: number): number {
  return CANVAS_CY - ((count - 1) * CARD_PITCH) / 2 + i * CARD_PITCH;
}

const easeInOutCubic = Easing.inOut(Easing.cubic);

// Full-frame image style (both PNGs are 1920x1080).
const FULL: React.CSSProperties = {
  position: 'absolute',
  left: 0, top: 0,
  width: 1920, height: 1080,
  display: 'block',
  pointerEvents: 'none',
};

// ── Props ────────────────────────────────────────────────────────────────────

export type ProgressSpineProps = {
  /** Current Remotion frame. */
  frame: number;
  /** Reveal that drives the grey rail draw-in (the 'setup' beat). */
  reveal: Reveal;
  /**
   * How many milestones are in this composition (1-5).
   * Determines spineTop, spineBottom, and per-tick CY values.
   */
  milestoneCount: number;
  /**
   * How many milestones have been revealed so far (0 = none, 1 = first, etc.).
   * The blue overlay fills down to tick CY at index (revealedCount - 1).
   */
  revealedCount: number;
};

// ── Component ────────────────────────────────────────────────────────────────

export const ProgressSpine: React.FC<ProgressSpineProps> = ({
  frame,
  reveal,
  milestoneCount,
  revealedCount,
}) => {
  const count = Math.max(1, Math.min(5, milestoneCount));

  // Spine top and bottom are the first and last tick CY for this count.
  const spineTop    = tickCyFor(count, 0);
  const spineBottom = tickCyFor(count, count - 1);
  const spineHeight = spineBottom - spineTop;

  // Grey rail: draws down from spineTop across the reveal window.
  const drawProg = interpolate(
    frame,
    [reveal.startFrame, reveal.startFrame + reveal.inFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic },
  );
  const drawHeight  = spineHeight * drawProg;
  // clipPath bottom inset = distance from canvas bottom back up to drawn edge.
  const drawClipBot = 1080 - (spineTop + drawHeight);

  // Blue overlay: fills from spineTop down to the deepest revealed tick's CY.
  // When no milestones are revealed the overlay has zero height (clips to top).
  const deepestIdx  = revealedCount > 0 ? Math.min(revealedCount - 1, count - 1) : -1;
  const blueY       = deepestIdx >= 0 ? tickCyFor(count, deepestIdx) : spineTop;
  const blueFrac    = spineHeight > 0
    ? Math.max(0, Math.min(1, (blueY - spineTop) / spineHeight))
    : 0;
  const blueHeight  = spineHeight * blueFrac;
  const blueClipBot = 1080 - (spineTop + blueHeight);

  // Hide entirely until the grey rail has started drawing.
  if (drawProg <= 0) return null;

  return (
    <>
      {/* Grey dotted rail, clipped to drawn height. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(${spineTop}px 0 ${drawClipBot}px 0)`,
          pointerEvents: 'none',
        }}
      >
        <Img src={staticFile(DOTTED_LINE_SRC)} style={FULL} />
      </div>

      {/* Blue dotted overlay, clipped to revealed-milestone depth. */}
      {blueHeight > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `inset(${spineTop}px 0 ${blueClipBot}px 0)`,
            pointerEvents: 'none',
          }}
        >
          <Img src={staticFile(BLUE_DOTTED_LINE_SRC)} style={FULL} />
        </div>
      )}
    </>
  );
};
