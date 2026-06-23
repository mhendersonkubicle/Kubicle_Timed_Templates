// CheckTickNode , circular milestone node: base circle pops in, white checkmark wipes left-to-right.
// ASSET-BACKED: renders the real FivePoints1SubtopicV2 tick_base.png + tick.png as full-frame layers
// (1920x1080 each), translated to the target canvas Y via a vertical offset. This is a CANVAS-REGION
// component: it occupies the full 1920x1080 stage. Wrap in an AbsoluteFill or position it directly
// (not inside <Place>). The composing template positions the node by passing the desired cy (Y centre
// on the canvas); the default cy reproduces the artwork's baked position.
import React from 'react';
import { Img, staticFile } from 'remotion';
import {
  appear,
  pulse,
  easeOutBack,
  easeInOutQuad,
  FPS,
  type Reveal,
} from '../_lib/kit';

// ─── Asset paths (FivePoints1SubtopicV2 Template-Specific-Assets) ────────────
const TICK_BASE_SRC = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2/tick_base.png');
const TICK_SRC      = staticFile('Template-Specific-Assets/FivePoints1SubtopicV2/tick.png');

// ─── Source geometry (measured from FivePoints1SubtopicV2) ───────────────────
// The PNGs are 1920x1080. The circle centre in the source artwork sits at:
const TICK_SRC_CX = 995;  // px from left
const TICK_SRC_CY = 141;  // px from top

// The white checkmark glyph spans these x-coordinates in the full-frame PNG.
// Wipe: right-inset clip goes from (1920 - GLYPH_LEFT) down to (1920 - GLYPH_RIGHT),
// revealing left-to-right as the inset shrinks.
const TICK_GLYPH_LEFT  = 981;
const TICK_GLYPH_RIGHT = 1008;

// Pre-computed clip values so the arithmetic is readable.
const CLIP_RIGHT_START = 1920 - TICK_GLYPH_LEFT;   // 939 – glyph hidden
const CLIP_RIGHT_END   = 1920 - TICK_GLYPH_RIGHT;  // 912 – glyph fully shown

// ─── Props ───────────────────────────────────────────────────────────────────

export type CheckTickNodeProps = {
  frame:  number;
  reveal: Reveal;
  /** Canvas Y of the node centre. Defaults to the artwork's baked position (141). */
  cy?: number;
};

// ─── Component ───────────────────────────────────────────────────────────────

export const CheckTickNode: React.FC<CheckTickNodeProps> = ({
  frame,
  reveal,
  cy = TICK_SRC_CY,
}) => {
  // Vertical offset so the node centres on `cy` instead of the baked 141 px.
  const offset = cy - TICK_SRC_CY;

  // ── Circle entrance: easeOutBack scale 0→1 over 90% of inFrames ────────────
  const circleReveal: Reveal = {
    startFrame: reveal.startFrame,
    inFrames:   Math.round(reveal.inFrames * 0.9),
    pulseFrames: reveal.pulseFrames,
  };
  const circleScale = appear(frame, circleReveal, easeOutBack);

  // ── Re-mention pulse: +5% scale half-sine, 0.45 s, same origin ─────────────
  const pulseMultiplier = pulse(frame, reveal, Math.round(0.45 * FPS));

  const totalScale  = circleScale * pulseMultiplier;
  const sharedXform = `translateY(${offset}px) scale(${totalScale})`;
  const sharedOrig  = `${TICK_SRC_CX}px ${TICK_SRC_CY}px`;

  // ── Tick wipe: left-to-right clip over 30%–100% of inFrames ─────────────────
  // Progress within the wipe window (0 at 30%, 1 at 100% of entrance).
  const wipeStart = reveal.startFrame + Math.round(reveal.inFrames * 0.3);
  const wipeDur   = Math.round(reveal.inFrames * 0.7);
  const wipeReveal: Reveal = { startFrame: wipeStart, inFrames: wipeDur };
  const wipeProg  = appear(frame, wipeReveal, easeInOutQuad);
  const clipRight = CLIP_RIGHT_START - (CLIP_RIGHT_START - CLIP_RIGHT_END) * wipeProg;

  // Hide entirely before the entrance starts.
  if (circleScale <= 0 && wipeProg <= 0) return null;

  const fullCanvas: React.CSSProperties = {
    position: 'absolute',
    left: 0, top: 0,
    width: 1920, height: 1080,
    display: 'block',
    pointerEvents: 'none',
  };

  return (
    <>
      {/* Base circle: pops in with easeOutBack overshoot */}
      {circleScale > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: sharedXform,
            transformOrigin: sharedOrig,
            pointerEvents: 'none',
          }}
        >
          <Img src={TICK_BASE_SRC} alt="" style={fullCanvas} />
        </div>
      )}

      {/* White checkmark glyph: wipes in left-to-right; shares scale + offset */}
      {wipeProg > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: sharedXform,
            transformOrigin: sharedOrig,
            clipPath: `inset(0 ${clipRight}px 0 0)`,
            pointerEvents: 'none',
          }}
        >
          <Img src={TICK_SRC} alt="" style={fullCanvas} />
        </div>
      )}
    </>
  );
};
