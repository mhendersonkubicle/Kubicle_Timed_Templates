// Shared kit for the COMPONENT LIBRARY.
//
// Every component in `components/` is code-first (no baked PNGs), placement-
// agnostic (it renders inside its own box; the composing template positions it),
// and animates from a normalised reveal input so it slots straight into the
// reveal-sequence timing model the templates and fit-timing.py already use.
//
// A composing template maps each timings.sequence target to a Reveal (see
// cueToReveal) and passes it to the component, exactly like a template's cue().

import React from 'react';
import { Easing, Img, interpolate, staticFile, delayRender, continueRender } from 'remotion';

export const FPS = 30;

// Load the brand fonts (Inter headings, Satoshi body) so components render in
// brand type even when shown in isolation. Call useFonts() at the top of any
// composing template or component example.
const KIT_FONTS = [
  { family: 'Inter', weight: '700', file: 'Inter-Bold.woff2' },
  { family: 'Inter', weight: '800', file: 'Inter-ExtraBold.woff2' },
  { family: 'Satoshi', weight: '500', file: 'Satoshi-Medium.woff2' },
  { family: 'Satoshi', weight: '700', file: 'Satoshi-Bold.woff2' },
  { family: 'Satoshi', weight: '900', file: 'Satoshi-Black.woff2' },
];
let _fontsLoaded = false;
export function useFonts(): void {
  const [handle] = React.useState(() => delayRender('kit-fonts'));
  React.useEffect(() => {
    if (_fontsLoaded) { continueRender(handle); return; }
    Promise.all(
      KIT_FONTS.map((f) =>
        new FontFace(f.family, `url(${staticFile('fonts/' + f.file)})`, { weight: f.weight })
          .load()
          .then((ff) => (document as unknown as { fonts: FontFaceSet }).fonts.add(ff))
          .catch(() => undefined)),
    ).then(() => { _fontsLoaded = true; continueRender(handle); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
}

// Brand palette (hex), taken from the source templates.
export const COLORS = {
  blue: '#0496FF',      // Dodger blue (primary)
  pink: '#FF3D8A',
  pinkAlt: '#F865B0',
  teal: '#33CCCC',
  ink: '#0B1B2B',       // near-black text on light
  oxford: '#0C1A28',    // dark panel
  navy: '#052438',
  platinum: '#E6ECF2',  // light surface
  white: '#FFFFFF',
} as const;

// Named colour variants resolve to a hex; an arbitrary hex passes through.
export type ColorVariant = 'blue' | 'pink' | 'teal' | string;
export const resolveColor = (c: ColorVariant): string =>
  (COLORS as Record<string, string>)[c] ?? c;

// Lighten (+) or darken (-) a hex by a percentage, for gradients/shadows.
export function shade(hex: string, pct: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 + pct / 100))));
  return `#${((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1)}`;
}

// Brand fonts (the harness stages these into public/fonts).
export const FONT_HEAD = 'Inter, system-ui, sans-serif';
export const FONT_BODY = 'Satoshi, system-ui, sans-serif';

// ─── Reveal contract ─────────────────────────────────────────────────────────
// startFrame: the absolute frame the element begins entering (target cue * fps).
// inFrames:   how long the entrance takes.
// pulseFrames: absolute frames at which a brief re-mention pulse fires.
export type Reveal = { startFrame: number; inFrames: number; pulseFrames?: number[] };

export const easeOutCubic = Easing.out(Easing.cubic);
export const easeOutBack = Easing.out(Easing.back(1.70158));
export const easeOutQuad = Easing.out(Easing.quad);
export const easeInOutQuad = Easing.inOut(Easing.quad);

// Entrance progress 0..1 for a reveal at the current frame.
export function appear(frame: number, r: Reveal, easing = easeOutCubic): number {
  return interpolate(frame, [r.startFrame, r.startFrame + r.inFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

// Re-mention pulse: a brief +6% scale bump centred on each pulse frame. Returns
// 1 at rest, so an empty/absent pulse list leaves the entrance untouched.
const PULSE_AMP = 0.06;
export function pulse(frame: number, r: Reveal, durFrames = Math.round(0.45 * FPS)): number {
  let s = 1;
  for (const pf of r.pulseFrames ?? []) {
    const local = frame - pf;
    if (local >= 0 && local <= durFrames) {
      s = Math.max(s, 1 + PULSE_AMP * Math.sin((local / durFrames) * Math.PI));
    }
  }
  return s;
}

// Map a timings.sequence (target/at/in seconds) + pulses to a Reveal per target.
// A composing template calls this once and then cueToReveal('iconPill').
export type TimingStep = { target: string; at: number; in?: number };
export type PulseStep = { target: string; at: number };
export type Timings = { sequence: TimingStep[]; pulses?: PulseStep[] };

export function makeCue(timings: Timings, fps = FPS) {
  return (target: string, defaultIn = 0.6): Reveal => {
    const step = timings.sequence.find((s) => s.target === target);
    const startFrame = Math.round((step?.at ?? 0) * fps);
    const inFrames = Math.round((step?.in ?? defaultIn) * fps);
    const pulseFrames = (timings.pulses ?? [])
      .filter((p) => p.target === target)
      .map((p) => Math.round(p.at * fps));
    return { startFrame, inFrames, pulseFrames };
  };
}

// ─── Icon helper ─────────────────────────────────────────────────────────────
// Renders icons/<id>.svg. With `tint`, recolours the icon to a solid colour via
// a CSS mask (use on saturated fills where the line art must read as one colour);
// without it, the icon shows in its native colours.
export const Icon: React.FC<{ id: string; size: number; tint?: string; style?: React.CSSProperties }> = ({
  id, size, tint, style,
}) => {
  const src = staticFile(`icons/${id}.svg`);
  if (tint) {
    return (
      <div
        style={{
          width: size, height: size,
          backgroundColor: tint,
          WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`,
          WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain', maskSize: 'contain',
          WebkitMaskPosition: 'center', maskPosition: 'center',
          ...style,
        }}
      />
    );
  }
  return <Img src={src} style={{ width: size, height: size, display: 'block', ...style }} />;
};

// Place a component on the 1920x1080 canvas. The composing template wraps each
// component in one of these so components stay placement-agnostic.
export const Place: React.FC<{ x: number; y: number; z?: number; children: React.ReactNode }> = ({
  x, y, z, children,
}) => (
  <div style={{ position: 'absolute', left: x, top: y, zIndex: z }}>{children}</div>
);
