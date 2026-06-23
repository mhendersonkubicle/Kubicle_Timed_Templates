// CharacterGradientPanel , tall rounded panel with a vertical dodger-blue gradient holding a clipped character portrait
import React from 'react';
import { Img, staticFile } from 'remotion';
import {
  appear, pulse, easeOutCubic,
  resolveColor, shade,
  type Reveal, type ColorVariant,
} from '../_lib/kit';

// Panel geometry defaults, lifted from Topic1Subtopics6Character source.
const DEFAULT_WIDTH          = 660;
const DEFAULT_HEIGHT         = 920;
const DEFAULT_BORDER_RADIUS  = 40;
const DEFAULT_CHARACTER_HEIGHT = 850;
const DEFAULT_CHARACTER_Y      = 163; // top offset inside panel so face lands near centre

export type CharacterGradientPanelProps = {
  frame: number;
  reveal: Reveal;
  // Character PNG id. Resolves to characters/<characterId>.png.
  characterId: string;
  // Rendered height of the character image in px (width preserved by aspect ratio).
  characterHeight?: number;
  // Top offset of the portrait inside the panel, in px. Negative values crop the top.
  characterY?: number;
  // Accent colour for the gradient. Accepts a named ColorVariant or any hex.
  // Default: 'blue' (#0496FF). The gradient is built as lighter top -> mid -> darker bottom.
  color?: ColorVariant;
  // Panel width in px. Default 660.
  width?: number;
  // Panel height in px. Default 920.
  height?: number;
  // Corner radius in px. Default 40.
  borderRadius?: number;
};

export const CharacterGradientPanel: React.FC<CharacterGradientPanelProps> = ({
  frame,
  reveal,
  characterId,
  characterHeight = DEFAULT_CHARACTER_HEIGHT,
  characterY      = DEFAULT_CHARACTER_Y,
  color           = 'blue',
  width           = DEFAULT_WIDTH,
  height          = DEFAULT_HEIGHT,
  borderRadius    = DEFAULT_BORDER_RADIUS,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;

  const p    = pulse(frame, reveal);
  const base = resolveColor(color);

  // Build the three-stop vertical gradient, matching the source template's
  // exact dodger-blue stops when color='blue', and scaling proportionally for
  // any other accent colour.
  const top = shade(base, +22);  // lighten  ~22 % for the top stop (#38B0FF when base=#0496FF)
  const bot = shade(base, -28);  // darken   ~28 % for the bottom stop (#0274C9 when base=#0496FF)
  const gradient = `linear-gradient(180deg, ${top} 0%, ${base} 50%, ${bot} 100%)`;

  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background:    gradient,
        overflow:      'hidden',
        opacity:       prog,
        transform:     `scale(${p})`,
        transformOrigin: '50% 50%',
        position:      'relative',
        // The panel is placement-agnostic: wrap in <Place x y> to position it on canvas.
        flexShrink:    0,
      }}
    >
      <Img
        src={staticFile(`characters/${characterId}.png`)}
        style={{
          position:  'absolute',
          left:      '50%',
          top:       characterY,
          height:    characterHeight,
          width:     'auto',
          transform: 'translateX(-50%)',
          display:   'block',
          // Two-layer silhouette drop shadow that lifts the figure off the dodger-blue panel.
          filter:
            'drop-shadow(0 18px 24px rgba(2, 18, 36, 0.45)) ' +
            'drop-shadow(0 4px 8px rgba(2, 18, 36, 0.35))',
        }}
      />
    </div>
  );
};
