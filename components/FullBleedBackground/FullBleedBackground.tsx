// FullBleedBackground , full-canvas background image rendered as objectFit cover that fades in as scene scaffolding.
// ASSET-BACKED: renders any static asset path (default: LessonTitle background PNG) via staticFile().
// Canvas-region component: occupies the full 1920x1080 stage. Render it directly, not inside <Place>.
// Entrance: opacity 0 to 1 over entryDur seconds using easeOutCubic. No scale or translate, pure opacity reveal.
// Base fill (#020d18) is visible while the image loads, matching the LessonTitle scene background.
import React from 'react';
import { Img, staticFile } from 'remotion';
import { appear, easeOutCubic, type Reveal } from '../_lib/kit';

export type FullBleedBackgroundProps = {
  frame: number;
  reveal: Reveal;
  /** Static asset path relative to the public folder.
   *  Defaults to the canonical LessonTitle background. */
  src?: string;
  /** Base background colour shown while the image loads. Default: #020d18. */
  baseFill?: string;
};

const DEFAULT_SRC  = 'Template-Specific-Assets/LessonTitle/lesson_title_background.png';
const DEFAULT_FILL = '#020d18';

export const FullBleedBackground: React.FC<FullBleedBackgroundProps> = ({
  frame,
  reveal,
  src = DEFAULT_SRC,
  baseFill = DEFAULT_FILL,
}) => {
  const op = appear(frame, reveal, easeOutCubic);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: baseFill,
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, opacity: op }}>
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};
