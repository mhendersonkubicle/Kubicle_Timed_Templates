// SlideWipeTransitionPanel , full-screen flat-colour panel that wipes across the canvas to mask (outro) or unmask (intro) a scene
import React from 'react';
import { interpolate, Easing } from 'remotion';
import { type Reveal, type ColorVariant, resolveColor } from '../_lib/kit';

// Canvas dimensions (1920x1080 standard)
const CANVAS_W = 1920;
const CANVAS_H = 1080;

export type WipeDirection = 'left' | 'right' | 'up' | 'down';
export type WipeMode = 'intro' | 'outro';

export type SlideWipeTransitionPanelProps = {
  frame: number;
  reveal: Reveal;
  // 'intro': panel enters from one edge and slides off the opposite edge,
  //          revealing the scene behind it.
  // 'outro': panel enters from one edge and covers the full canvas,
  //          masking the scene.
  mode?: WipeMode;
  // Which edge the panel enters from.
  // intro left:  panel enters from left (+CANVAS_W -> 0), exits to left (0 -> -CANVAS_W)
  // intro right: panel enters from right (-CANVAS_W -> 0), exits to right (0 -> +CANVAS_W)
  // outro left:  panel enters from left (-CANVAS_W -> 0)
  // outro right: panel enters from right (+CANVAS_W -> 0)
  // up/down work the same on the Y axis.
  direction?: WipeDirection;
  color?: ColorVariant;  // default platinum (#E6ECF2)
};

// easeInOutCubic, matching the source template exactly.
const easeInOutCubic = Easing.inOut(Easing.cubic);

export const SlideWipeTransitionPanel: React.FC<SlideWipeTransitionPanelProps> = ({
  frame,
  reveal,
  mode = 'outro',
  direction = 'right',
  color = '#E6ECF2',
}) => {
  const { startFrame, inFrames } = reveal;
  const endFrame = startFrame + inFrames;

  const resolvedColor = resolveColor(color);

  // Compute the translate value for the given direction + mode.
  // The panel is always 1920x1080 and positioned at (0,0); translation moves it.
  const tx = (() => {
    if (direction === 'left' || direction === 'right') {
      // Horizontal wipe.
      if (mode === 'outro') {
        // Panel slides IN from the chosen edge to cover the canvas.
        // direction=right: enters from right edge (+CANVAS_W -> 0)
        // direction=left:  enters from left edge  (-CANVAS_W -> 0)
        const from = direction === 'right' ? CANVAS_W : -CANVAS_W;
        return interpolate(frame, [startFrame, endFrame], [from, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeInOutCubic,
        });
      } else {
        // mode='intro': panel starts covering the canvas and slides OFF.
        // direction=right: exits to right (0 -> +CANVAS_W)
        // direction=left:  exits to left  (0 -> -CANVAS_W)
        const to = direction === 'right' ? CANVAS_W : -CANVAS_W;
        return interpolate(frame, [startFrame, endFrame], [0, to], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeInOutCubic,
        });
      }
    }
    return 0;
  })();

  const ty = (() => {
    if (direction === 'up' || direction === 'down') {
      // Vertical wipe.
      if (mode === 'outro') {
        // Panel slides IN from the chosen edge.
        // direction=down: enters from bottom (+CANVAS_H -> 0)
        // direction=up:   enters from top    (-CANVAS_H -> 0)
        const from = direction === 'down' ? CANVAS_H : -CANVAS_H;
        return interpolate(frame, [startFrame, endFrame], [from, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeInOutCubic,
        });
      } else {
        // mode='intro': panel starts covering and slides OFF.
        // direction=down: exits downward (0 -> +CANVAS_H)
        // direction=up:   exits upward   (0 -> -CANVAS_H)
        const to = direction === 'down' ? CANVAS_H : -CANVAS_H;
        return interpolate(frame, [startFrame, endFrame], [0, to], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeInOutCubic,
        });
      }
    }
    return 0;
  })();

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: CANVAS_W,
        height: CANVAS_H,
        background: resolvedColor,
        transform: `translateX(${tx}px) translateY(${ty}px)`,
        pointerEvents: 'none',
      }}
    />
  );
};
