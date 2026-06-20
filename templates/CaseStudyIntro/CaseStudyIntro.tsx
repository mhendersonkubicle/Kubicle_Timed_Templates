import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { z } from 'zod';

// CaseStudyIntro, a clean establishing card for a case study.
//   A platinum card: a small "CASE STUDY" eyebrow + the made-up company logo,
//   dead centre. The logo's wordmark carries the company name, so there is no
//   other text. That is the whole scene, it just lands the company.
//
// The case-study DETAIL (what the company is, its situation, its points) belongs
// in the NEXT scene, using a normal points/list template. Keep this card simple.
//
// Reveal-sequence timing model. IMPORTANT: the logo is a FICTIONAL company logo
// from the Logos library (logos/<id>.svg), NOT an icon. The card is LIGHT, so use
// a "-light" logo variant.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const revealStepSchema = z.object({
  target: z.enum(['setup', 'eyebrow', 'logo']),
  at: z.number().nonnegative(),
  in: z.number().positive().default(0.6),
});
export type RevealStep = z.infer<typeof revealStepSchema>;
export type CaseStudyIntroTarget = RevealStep['target'];

export const pulseStepSchema = z.object({
  target: z.enum(['logo']),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const caseStudyIntroTimingSchema = z.object({
  sequence: z.array(revealStepSchema).default([]),
  pulses: z.array(pulseStepSchema).default([]),
});

export const caseStudyIntroSchema = z.object({
  // Small eyebrow above the logo. Dodger Blue, uppercased. <=24 chars.
  eyebrow: z.string().min(1).max(24).default('Case Study'),
  // Fictional company logo id INCLUDING the variant, e.g. "Company-FinSage-light".
  // Resolves to logos/<logo>.svg. The card is light, so use a "-light" id.
  // The company NAME is part of the logo artwork; do not add it as text.
  logo: z.string().min(1),
  timings: caseStudyIntroTimingSchema.optional(),
});

export type CaseStudyIntroProps = z.infer<typeof caseStudyIntroSchema>;

export const caseStudyIntroMeta = {
  description:
    'A clean establishing card for a case study: a platinum background with a small ' +
    'Dodger-Blue "CASE STUDY" eyebrow and a made-up company logo centred (the wordmark ' +
    'carries the name). That is the whole scene, it just lands the company; the case-study ' +
    'detail goes in the next scene with a points/list template. The logo is a Logos/ ' +
    'company logo (logos/<id>.svg), never an icon.',
  authoringNotes:
    'Supply `logo` as a fictional company id WITH the -light variant (e.g. ' +
    '"Company-FinSage-light"); it resolves to logos/<logo>.svg and the name is in the ' +
    'artwork. Reveal order: setup (eyebrow fades in), logo. Keep the card to eyebrow + ' +
    'logo only; put the case-study points in the FOLLOWING scene. See GUIDANCE.md.',
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────

const W = 1920;
const H = 1080;
const CENTER_X = W / 2;

const EYEBROW_CY = 372;
const LOGO_CY    = 540;          // dead centre
const LOGO_BOX_W = 760;          // wide lockups scale to this width, aspect preserved
const LOGO_BOX_H = 220;

const PLATINUM = '#E6ECF2';
const DODGER   = '#0496FF';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const easeOutCubic = Easing.out(Easing.cubic);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ─── Re-mention pulse ─────────────────────────────────────────────────────────
const PULSE_DUR_S = 0.45;
const PULSE_AMP = 0.05;
function pulseScale(frame: number, pulseFrames: number[], durF: number): number {
  let s = 1;
  for (const pf of pulseFrames) {
    const local = frame - pf;
    if (local >= 0 && local <= durF) s = Math.max(s, 1 + PULSE_AMP * Math.sin((local / durF) * Math.PI));
  }
  return s;
}

// ─── Main scene ───────────────────────────────────────────────────────────────

export const CaseStudyIntro: React.FC<CaseStudyIntroProps> = ({ eyebrow, logo, timings }) => {
  const frame = useCurrentFrame();

  const [logoHtml, setLogoHtml] = useState('');
  const [handle] = useState(() => delayRender(`Loading logo: ${logo}`));
  useEffect(() => {
    fetch(staticFile(`logos/${logo}.svg`))
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((raw) => setLogoHtml(raw.replace(/<\?xml[^>]*\?>\s*/g, '')))
      .catch(() => setLogoHtml(''))
      .finally(() => continueRender(handle));
  }, [logo, handle]);

  const byTarget = new Map<CaseStudyIntroTarget, RevealStep>((timings?.sequence ?? []).map((s) => [s.target, s] as const));
  const cue = (t: CaseStudyIntroTarget) => byTarget.get(t);
  const durOf = (s: RevealStep) => s.in ?? 0.6;
  const prog = (s: RevealStep) => clamp01((frame - f(s.at)) / Math.max(1, f(durOf(s))));

  const pulseDurF = f(PULSE_DUR_S);
  const pulseLogo = pulseScale(frame, (timings?.pulses ?? []).filter((p) => p.target === 'logo').map((p) => f(p.at)), pulseDurF);

  const cEyebrow = cue('eyebrow') ?? cue('setup');
  const cLogo = cue('logo');

  return (
    <AbsoluteFill style={{ background: PLATINUM, overflow: 'hidden' }}>
      {/* Eyebrow */}
      {cEyebrow && (
        <div
          style={{
            position: 'absolute', left: 0, top: EYEBROW_CY, width: W, textAlign: 'center',
            opacity: prog(cEyebrow),
            fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800,
            fontSize: 34, letterSpacing: '0.18em', color: DODGER, textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>
      )}

      {/* Company logo, dead centre (name is in the artwork) */}
      {cLogo && logoHtml && (
        <div
          style={{
            position: 'absolute', left: CENTER_X - LOGO_BOX_W / 2, top: LOGO_CY - LOGO_BOX_H / 2,
            width: LOGO_BOX_W, height: LOGO_BOX_H,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: prog(cLogo),
            transform: `translateY(${(1 - easeOutCubic(prog(cLogo))) * 24}px) scale(${pulseLogo})`,
            transformOrigin: 'center center',
          }}
          dangerouslySetInnerHTML={{ __html: logoHtml.replace(/<svg([^>]*?)>/, (m, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, '')} preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block">`) }}
        />
      )}
    </AbsoluteFill>
  );
};
