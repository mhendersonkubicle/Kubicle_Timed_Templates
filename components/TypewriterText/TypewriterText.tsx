// TypewriterText , reveals text character-by-character across a defined progress window with a blinking cursor
import React from 'react';
import { interpolate } from 'remotion';
import {
  appear, pulse, easeOutCubic, FONT_BODY, COLORS, FPS, type Reveal,
} from '../_lib/kit';

export type TypewriterTextProps = {
  frame: number;
  reveal: Reveal;
  text: string;
  /** Scene-relative frame at which typing begins (inclusive). Defaults to reveal.startFrame. */
  typeStartFrame?: number;
  /** Scene-relative frame at which typing ends (all chars shown). Defaults to reveal.startFrame + reveal.inFrames. */
  typeEndFrame?: number;
  /** CSS font-family string. Defaults to FONT_BODY (Satoshi). */
  fontFamily?: string;
  /** Font weight. Defaults to 700. */
  fontWeight?: number | string;
  fontSize?: number;             // default 60
  color?: string;                // default '#FFFFFF'
  /** Show the entrance opacity/translate animation driven by appear(). Default true. */
  animateEntrance?: boolean;
};

/**
 * TypewriterText
 *
 * Reveals `text` one character at a time across [typeStartFrame, typeEndFrame].
 * A 4 px blinking cursor sits to the right of the typed substring while typing
 * is in progress; it disappears once all characters are shown.
 *
 * Entrance: fades + translates in via appear() over reveal.inFrames.
 * Re-mention pulse: scale bump via pulse() at any reveal.pulseFrames.
 *
 * Usage:
 *   <TypewriterText
 *     frame={frame}
 *     reveal={{ startFrame: 30, inFrames: 12 }}
 *     typeStartFrame={42}
 *     typeEndFrame={102}
 *     text="Define the brief"
 *     fontSize={60}
 *     color="#FFFFFF"
 *   />
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  frame,
  reveal,
  text,
  typeStartFrame,
  typeEndFrame,
  fontFamily = FONT_BODY,
  fontWeight = 700,
  fontSize = 60,
  color = COLORS.white,
  animateEntrance = true,
}) => {
  // Resolve typing window, defaulting to the full reveal window.
  const tStart = typeStartFrame ?? reveal.startFrame;
  const tEnd   = typeEndFrame   ?? (reveal.startFrame + reveal.inFrames);

  // How many characters to show right now.
  const typeProg  = interpolate(frame, [tStart, tEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const charsShow = Math.floor(text.length * typeProg);
  const typedText = text.slice(0, charsShow);

  // Cursor: blinks every 15 frames (2 Hz at 30 fps), hidden once typing is done.
  const typingDone  = charsShow >= text.length;
  const cursorOn    = Math.floor(frame / 15) % 2 === 0;
  const showCursor  = !typingDone && cursorOn;

  // Entrance animation.
  const entranceProg = animateEntrance ? appear(frame, reveal, easeOutCubic) : 1;
  const ty           = animateEntrance ? 20 * (1 - entranceProg) : 0;

  // Re-mention pulse scale.
  const pulseScale = pulse(frame, reveal);

  const lineHeight = fontSize * 1.2;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        opacity: entranceProg,
        transform: `translateY(${ty}px) scale(${pulseScale})`,
        transformOrigin: 'left center',
      }}
    >
      <span
        style={{
          fontFamily,
          fontWeight,
          fontSize,
          color,
          lineHeight: 1,
          whiteSpace: 'pre',
          letterSpacing: '-0.005em',
        }}
      >
        {typedText}
      </span>
      {showCursor && (
        <span
          style={{
            display: 'inline-block',
            width: 4,
            height: lineHeight,
            marginLeft: 4,
            background: COLORS.blue,
            opacity: 0.95,
            flexShrink: 0,
          }}
        />
      )}
    </div>
  );
};
