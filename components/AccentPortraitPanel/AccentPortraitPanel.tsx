// AccentPortraitPanel , accent-colour filled rounded panel hosting a character portrait PNG, clipped to bounds.
// CODE-FIRST: pure CSS, recolourable via an accentColor prop, placement-agnostic.
// Source geometry lifted from CharacterProfileCard (PORTRAIT_W 580, PORTRAIT_H 620,
// PORTRAIT_RADIUS 28). Drop-shadow and entrance match the source template exactly.
// Entrance: scale 0.92 -> 1 easeOutCubic, transformOrigin 50% 100%. Pulse on re-mention.
import React from 'react';
import { Img, staticFile } from 'remotion';
import {
  appear, pulse, easeOutCubic, resolveColor,
  type Reveal, type ColorVariant,
} from '../_lib/kit';

// Accent palette per brief: three brand accent colours only.
export type AccentColor = '#0496FF' | '#F865B0' | '#3AB795';

// borderRadius defaults: 28 for single-card, 24 for duo/team contexts.
export type PanelSize = 'single' | 'duo' | 'team';

const RADIUS_BY_SIZE: Record<PanelSize, number> = {
  single: 28,
  duo:    24,
  team:   24,
};

// Default dimensions match CharacterProfileCard's portrait area (580 x 620).
const DEFAULT_W = 580;
const DEFAULT_H = 620;

// Portrait drop-shadow filter from the source template.
const PORTRAIT_SHADOW =
  'drop-shadow(0 16px 22px rgba(2,18,36,0.40)) ' +
  'drop-shadow(0 4px 8px rgba(2,18,36,0.30))';

export type AccentPortraitPanelProps = {
  frame:       number;
  reveal:      Reveal;
  // Character PNG id. Resolves to characters/<characterId>.png via staticFile.
  characterId: string;
  // One of the three brand accent colours, or a raw hex (falls through resolveColor).
  accentColor?: AccentColor | ColorVariant;
  // Controls border-radius: 'single' (28) for a standalone card, 'duo'/'team' (24) for multi-card rows.
  size?:        PanelSize;
  // Explicit width override. Default: 580 (CharacterProfileCard portrait width).
  width?:       number;
  // Explicit height override. Default: 620 (CharacterProfileCard portrait height).
  height?:      number;
};

export const AccentPortraitPanel: React.FC<AccentPortraitPanelProps> = ({
  frame,
  reveal,
  characterId,
  accentColor = '#0496FF',
  size = 'single',
  width  = DEFAULT_W,
  height = DEFAULT_H,
}) => {
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;

  const p = pulse(frame, reveal);
  // Entrance: scale 0.92 -> 1 easeOutCubic, transformOrigin 50% 100% (rises from base).
  const scale = 0.92 + 0.08 * prog;
  const radius = RADIUS_BY_SIZE[size];
  const bg = resolveColor(accentColor as ColorVariant);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: bg,
        overflow: 'hidden',
        transform: `scale(${scale * p})`,
        transformOrigin: '50% 100%',
        opacity: prog,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Img
        src={staticFile(`characters/${characterId}.png`)}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width:  '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          filter: PORTRAIT_SHADOW,
        }}
      />
    </div>
  );
};
