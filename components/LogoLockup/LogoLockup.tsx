// LogoLockup , centred SVG logo box that fits an external vector logo within a fixed bounding box
//
// CODE-FIRST: pure CSS/SVG container, recolourable border/background via a colour
// prop, placement-agnostic. The SVG itself is injected via dangerouslySetInnerHTML
// with width/height stripped and preserveAspectRatio="xMidYMid meet" so any aspect
// ratio logo fits cleanly.
//
// Entrance: opacity + translateY(24px -> 0) easeOutCubic over the reveal window.
// Re-mention pulse: +5% scale half-sine centred on each pulse frame (matches the
// source CaseStudyIntro logo animation exactly).
//
// Variants:
//   default  , for dark (oxford/navy) backgrounds: transparent fill, white subtle ring
//   -light   , for light (platinum/white) backgrounds: transparent fill, ink subtle ring
//
// Source geometry lifted from CaseStudyIntro: 760x220px bounding box.

import React, { useEffect, useState } from 'react';
import { staticFile, continueRender, delayRender } from 'remotion';
import {
  appear, pulse, easeOutCubic,
  COLORS,
  type Reveal,
} from '../_lib/kit';

// Bounding box from CaseStudyIntro (LOGO_BOX_W x LOGO_BOX_H).
const BOX_W = 760;
const BOX_H = 220;

// Inject the fetched SVG markup into the bounding box wrapper.
// Strips xml declaration, strips width/height attributes, injects
// preserveAspectRatio="xMidYMid meet" and display:block so the inner
// SVG scales to fill the container while preserving its aspect ratio.
function injectSvg(raw: string): string {
  return raw
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(
      /<svg([^>]*?)>/,
      (_m, attrs: string) =>
        `<svg${attrs
          .replace(/\s(width|height)="[^"]*"/g, '')
        } preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">`,
    );
}

export type LogoLockupVariant = 'default' | 'light';

export type LogoLockupProps = {
  frame: number;
  reveal: Reveal;
  // Logo id from the Logos library (WITHOUT the .svg extension).
  // Resolves to logos/<logoId>.svg.
  // Use a "-light" logo variant for light backgrounds.
  logoId: string;
  // Visual variant of the lockup box: 'default' (dark bg) | 'light' (light bg).
  // This controls the subtle border colour; the box background is always transparent.
  variant?: LogoLockupVariant;
  // Override the bounding box dimensions if needed. Defaults match CaseStudyIntro.
  width?: number;
  height?: number;
};

export const LogoLockup: React.FC<LogoLockupProps> = ({
  frame,
  reveal,
  logoId,
  variant = 'default',
  width = BOX_W,
  height = BOX_H,
}) => {
  const [logoHtml, setLogoHtml] = useState('');
  const [handle] = useState(() => delayRender(`LogoLockup: loading logos/${logoId}.svg`));

  useEffect(() => {
    fetch(staticFile(`logos/${logoId}.svg`))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`Failed to load logos/${logoId}.svg`))))
      .then((raw) => setLogoHtml(injectSvg(raw)))
      .catch(() => setLogoHtml(''))
      .finally(() => continueRender(handle));
  }, [logoId, handle]);

  // Entrance progress 0..1 (easeOutCubic).
  const prog = appear(frame, reveal, easeOutCubic);
  if (prog <= 0) return null;

  // Re-mention pulse scale (1 at rest, briefly > 1 on each pulse frame).
  const pScale = pulse(frame, reveal);

  // translateY goes from +24px (offscreen-ish) down to 0 as prog goes 0 -> 1.
  const ty = (1 - prog) * 24;

  // Border colour: very subtle ring so the box has a defined edge on any surface.
  const borderColor =
    variant === 'light'
      ? `rgba(11,27,43,0.12)` // ink at low opacity for light surfaces
      : `rgba(255,255,255,0.10)`; // white at low opacity for dark surfaces

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        border: `1.5px solid ${borderColor}`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: 24,
        // Entrance: combined opacity fade + upward translate + pulse scale,
        // all with a shared transform origin at centre.
        opacity: prog,
        transform: `translateY(${ty}px) scale(${pScale})`,
        transformOrigin: 'center center',
      }}
    >
      {logoHtml ? (
        <div
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          dangerouslySetInnerHTML={{ __html: logoHtml }}
        />
      ) : (
        // Placeholder while the SVG loads (keeps layout stable, invisible).
        <div style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
};
