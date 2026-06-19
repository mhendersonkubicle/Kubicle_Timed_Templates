import React, { useEffect, useState } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { z } from 'zod';

// KubicleAIChat, a Gemini-style AI chat scene rebuilt on the STANDARD
// reveal-sequence timing model.
//   • setup     , the chat UI shell slides up from below the canvas with a
//                  back-overshoot (window panel + header + footer plate + the
//                  empty input bar), then the centred greeting fades in over
//                  the splash. This is the staging reveal, scaffolding + the
//                  greeting, no answer content yet.
//   • prompt    , the user's prompt types into the input bar character by
//                  character, then the typed pill morphs (squash & stretch)
//                  into a right-aligned user bubble at the top of the feed.
//                  Typing + morph fold into this ONE object.
//   • intro     , the Kubicle AI typing pulse plays, then the brand badge +
//                  intro paragraph fade in beneath the user bubble.
//   • message0..N-1 , each numbered answer section (bold heading + body) pops
//                  in one at a time. N is response.sections.length (2-4).
//
// Reveal order is strictly LINEAR (a chat transcript builds top to bottom in
// the order the turns are spoken): setup -> prompt -> intro -> message0 ->
// message1 -> ... An element renders ONLY if a step in `timings.sequence`
// targets it; the default (empty sequence) is a blank platinum stage.
//
// Matches the GroupChat aesthetic: oxford-blue window, platinum splash base,
// dodger-blue user bubble. All visuals drawn in CSS / inline SVG plus the one
// white Kubicle logo PNG. No em-dash punctuation in the default copy.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const kubicleAISectionSchema = z.object({
  heading: z.string().min(1).max(48),
  body:    z.string().min(1).max(220),
});

// Count variation lives here: 2 to 4 answer sections. The feed auto-stacks the
// sections below the intro paragraph, and the AI response block is positioned
// below however tall the user bubble grows, so every count in range reads
// cleanly.
export const KUBICLE_AI_MIN_SECTIONS = 2;
export const KUBICLE_AI_MAX_SECTIONS = 4;

export const kubicleAIResponseSchema = z.object({
  intro:    z.string().min(1).max(200),
  sections: z.array(kubicleAISectionSchema)
    .min(KUBICLE_AI_MIN_SECTIONS)
    .max(KUBICLE_AI_MAX_SECTIONS),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (the
// platinum stage with nothing on it). Each step is one "object": the prompt
// step types the prompt AND morphs it into the bubble; the intro step plays the
// typing pulse AND fades the intro paragraph in. All times are scene-relative
// SECONDS.
//
// Addressable targets:
//   setup              chat UI shell slides up + greeting fades in (scaffolding)
//   prompt             user prompt types into the bar, then morphs to the bubble
//   intro              AI typing pulse, then brand badge + intro paragraph
//   message0..messageN-1   one numbered answer section each (N = sections.length,
//                          2-4). A message{i} with i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|prompt|intro|message[0-9]+)$/),
  at: z.number().nonnegative(),           // when it starts appearing
  in: z.number().positive().default(0.6), // entrance duration (see per-target notes)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed object is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a CONTENT object (prompt, intro, or
// message{i}); setup is not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^(prompt|intro|message[0-9]+)$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const kubicleAIChatTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const kubicleAIChatSchema = z.object({
  // Top-left brand name. Defaults to "Kubicle AI".
  brand:     z.string().min(1).max(24).optional(),
  // The big centred greeting on the splash screen.
  greeting:  z.string().min(1).max(56),
  // Sub-greeting below the main greeting (smaller, dim).
  subline:   z.string().min(1).max(72).optional(),
  // Placeholder shown in the input bar before the user types.
  inputPlaceholder: z.string().min(1).max(40).optional(),
  // What "the user" types into the input bar.
  userPrompt: z.string().min(1).max(140),
  // The AI's structured response.
  response:  kubicleAIResponseSchema,
  timings:   kubicleAIChatTimingsSchema.optional(),
});

export type KubicleAIChatProps = z.infer<typeof kubicleAIChatSchema>;

export const kubicleAIChatMeta = {
  description:
    'A Gemini-style AI chat scene: the chat UI shell slides up and a centred ' +
    'greeting fades in (setup), the user prompt types into the bar and morphs ' +
    'into a right-aligned user bubble (prompt), then the Kubicle AI response ' +
    'types in beneath it as an intro paragraph (intro) followed by 2 to 4 ' +
    'numbered sections (message{i}). Matches the GroupChat aesthetic: ' +
    'oxford-blue window, platinum splash base, dodger-blue user bubble.',
  authoringNotes:
    'Greeting: short and warm (e.g. "Hey Matthew, what should we work on?"). ' +
    'userPrompt: a single realistic question, ideally how-to or advice-seeking, ' +
    'under 140 chars. response.intro: one or two sentences framing the answer. ' +
    'response.sections: 2 to 4 entries; headings should start with a number ' +
    '("1. ", "2. ") for the Gemini list look. No em-dashes (use commas or "and"). ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Targets are: ' +
    'setup (shell slides up + greeting fades in), prompt (types then morphs to ' +
    'the user bubble), intro (typing pulse then intro paragraph), and one ' +
    'message{i} per answer section in order. Each step is { target, at (seconds), ' +
    'in? (entrance duration, default 0.6) }; the prompt step needs a longer `in` ' +
    'to cover typing + morph (e.g. 3.0). NARRATION MUST be linear, a chat ' +
    'transcript: the prompt is asked, then the answer is delivered intro-first ' +
    'and section by section in order, never out of sequence. The section count ' +
    '(2-4) is the built-in variation. See GUIDANCE.md for full selection and ' +
    'narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');
const KUBICLE_LOGO_SRC   = staticFile('Template-Specific-Assets/KubicleAIChat/kubicle-icon-white.png');

// ─── Layout constants ────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Chat window panel. Margins match the GroupChat template so the two scenes
// feel like siblings.
const WIN_LEFT   = 60;
const WIN_TOP    = 50;
const WIN_RIGHT  = CANVAS_W - 60;       // 1860
const WIN_BOT    = CANVAS_H - 50;       // 1030
const WIN_W      = WIN_RIGHT - WIN_LEFT;
const WIN_H      = WIN_BOT - WIN_TOP;
const WIN_RADIUS = 32;

// Header strip (Kubicle AI brand)
const HEADER_H   = 100;

// Footer (input bar)
const FOOTER_H   = 110;
const FOOTER_TOP = WIN_BOT - FOOTER_H;

// Input bar geometry, centred horizontally inside the window
const INPUT_W   = 1200;
const INPUT_H   = 78;
const INPUT_CX  = (WIN_LEFT + WIN_RIGHT) / 2;     // 960
const INPUT_TOP = FOOTER_TOP + (FOOTER_H - INPUT_H) / 2;  // ≈ 926
const INPUT_LEFT = INPUT_CX - INPUT_W / 2;
const INPUT_RADIUS = INPUT_H / 2;                  // full-pill

// User bubble target (top-right of chat feed)
const BUBBLE_MAX_W = 760;
const BUBBLE_PAD_X = 28;
const BUBBLE_PAD_Y = 18;
const BUBBLE_RADIUS = 24;
const BUBBLE_RIGHT = WIN_RIGHT - 60;              // 1780
const BUBBLE_TOP   = WIN_TOP + HEADER_H + 30;     // ≈ 190

// AI response container (left-aligned, below user bubble)
const RESP_LEFT  = WIN_LEFT + 60;                 // 140
const RESP_RIGHT = WIN_RIGHT - 60;                // 1780
const RESP_W     = RESP_RIGHT - RESP_LEFT;        // 1640

// Splash greeting (setup), centred
const GREETING_CY = WIN_TOP + (FOOTER_TOP - WIN_TOP) / 2 - 40;  // ≈ 480

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

const easeOutCubic   = Easing.out(Easing.cubic);
const easeInOutCubic = Easing.inOut(Easing.cubic);
const easeOutBack    = Easing.out(Easing.back(1.7));
// Subtle settling back-overshoot for the chat-window slide-up. Matches the
// value used by GroupChat so the two scenes share the same intro feel.
const easeOutBackSettle = Easing.out(Easing.back(1.15));

// Internal sub-stagger proportions, expressed as fractions of a step's `in`
// window so the compound prototype flourishes survive the collapse to one
// {at, in} per object:
//   setup:  the shell slides up over the whole window; the greeting fades in
//           over the back ~45% (once the shell has nearly landed).
//   prompt: the prompt types over the first ~70%, then morphs to the bubble
//           over the last ~30% (the greeting fades out as the morph begins).
//   intro:  the AI typing pulse plays over the first ~45%, then the brand badge
//           + intro paragraph fade in over the back portion.
const SETUP_GREET_FRAC  = 0.55;  // greeting fade starts at 55% of setup window
const PROMPT_MORPH_FRAC = 0.70;  // morph starts at 70% of the prompt window
const INTRO_PULSE_FRAC  = 0.45;  // typing pulse occupies the first 45% of intro

// ─── Re-mention pulse (brand: brief + subtle) ────────────────────────────────
// A revealed object that is named again later gives a quick scale pulse at the
// re-mention. Brand values: ~0.45 s, +5 % peak, smooth up-and-down (half-sine).
const PULSE_DUR_S = 0.45;
const PULSE_AMP   = 0.05;
// Scale multiplier at `frame` given the pulse frames; 1 at rest, up to
// 1 + PULSE_AMP at a pulse peak. Overlapping pulses take the max.
function pulseScale(frame: number, pulseFrames: number[], durF: number): number {
  let s = 1;
  for (const pf of pulseFrames) {
    const local = frame - pf;
    if (local >= 0 && local <= durF) {
      s = Math.max(s, 1 + PULSE_AMP * Math.sin((local / durF) * Math.PI));
    }
  }
  return s;
}

// ─── Palette ─────────────────────────────────────────────────────────────────

// Solid platinum-blue base, same as GroupChat. The chat window panel sits on
// top in oxford-blue, so the canvas margin around it reads as light platinum.
const PLATINUM_BG = '#E6ECF2';

const WIN_BG     = 'linear-gradient(180deg, #0e2741 0%, #08172a 100%)';
const HEADER_BG  = 'linear-gradient(180deg, #0b2138 0%, #07172a 100%)';
const FOOTER_BG  = 'linear-gradient(180deg, #07172a 0%, #050f1c 100%)';
const INPUT_BG   = 'rgba(255,255,255,0.06)';
const INPUT_BORDER = '1px solid rgba(255,255,255,0.12)';

const ME_BUBBLE_BG     = 'linear-gradient(180deg, #1A9CFE 0%, #0686EE 100%)';
const ME_BUBBLE_BORDER = '1px solid rgba(255,255,255,0.10)';
// Plain dark drop shadow only, no blue halo / glow. Matches GroupChat.
const ME_BUBBLE_SHADOW = '0 4px 12px rgba(0,0,0,0.25)';

const TEXT_WHITE   = '#FFFFFF';
const TEXT_DIM     = 'rgba(255,255,255,0.65)';
const TEXT_VERYDIM = 'rgba(255,255,255,0.35)';

const DODGER       = '#0496FF';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold   = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,   { weight: '700', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`, { weight: '500', display: 'block' });
    const [b, m] = await Promise.all([bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp    = (a: number, b: number, t: number) => a + (b - a) * t;

// Estimate the end-state user-bubble box from the prompt text. Width follows a
// char-count heuristic; HEIGHT fits the wrapped lines so a long, multi-line
// prompt gets a comfortably sized bubble. The main scene calls this too, to
// push the AI response below a tall bubble so the two never overlap. 0.52em is
// the approx average glyph width at the bubble's font/weight; 1.35 is the
// bubble line-height.
const USER_BUBBLE_FONT = 26;
function estimateUserBubble(fullText: string): { w: number; h: number; fontSize: number } {
  const w = Math.min(BUBBLE_MAX_W, Math.max(360, fullText.length * 14 + BUBBLE_PAD_X * 2));
  const lineH        = USER_BUBBLE_FONT * 1.35;
  const charsPerLine = Math.max(1, Math.floor((w - BUBBLE_PAD_X * 2) / (USER_BUBBLE_FONT * 0.52)));
  const lines        = Math.max(1, Math.ceil(fullText.length / charsPerLine));
  const h            = Math.max(88, Math.ceil(lines * lineH + BUBBLE_PAD_Y * 2));
  return { w, h, fontSize: USER_BUBBLE_FONT };
}

// ─── Kubicle AI brand mark (white PNG logo on alpha) ─────────────────────────

function SparkleIcon({ size = 36 }: { size?: number }) {
  return (
    <Img
      src={KUBICLE_LOGO_SRC}
      alt="Kubicle AI"
      style={{
        width: size,
        height: size,
        display: 'block',
        objectFit: 'contain',
      }}
    />
  );
}

// ─── Blinking cursor (dodger blue) ───────────────────────────────────────────

function Cursor({ frame, height = 30 }: { frame: number; height?: number }) {
  // 30-frame breathing, visible 0..15, faded 15..30.
  const phase = frame % 30;
  const op = phase < 15 ? 1 : 0.15;
  return (
    <span
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        width: 3,
        height,
        background: DODGER,
        marginLeft: 4,
        borderRadius: 1,
        opacity: op,
      }}
    />
  );
}

// ─── Splash greeting (revealed during setup) ─────────────────────────────────

function SplashGreeting({
  greeting, subline, opacity, lift,
}: {
  greeting: string;
  subline?: string;
  opacity: number;
  lift: number;     // 0 = at position, >0 = drifts up & fades for the morph
}) {
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: WIN_LEFT,
        top:  GREETING_CY - 80,
        width: WIN_W,
        textAlign: 'center',
        opacity,
        transform: `translateY(${-lift}px)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          color: TEXT_WHITE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 72,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textShadow: '0 4px 14px rgba(0,0,0,0.40)',
        }}
      >
        {greeting}
      </div>
      {subline && (
        <div
          style={{
            marginTop: 20,
            color: TEXT_DIM,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 28,
            letterSpacing: '-0.01em',
          }}
        >
          {subline}
        </div>
      )}
    </div>
  );
}

// ─── Empty input bar (revealed during setup, sits in the footer) ─────────────
// Drawn whenever the prompt step has NOT yet begun typing/morphing, so the
// splash always shows the bar the prompt will type into.

function EmptyInputBar({ placeholder }: { placeholder: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: INPUT_LEFT,
        top:  INPUT_TOP,
        width: INPUT_W,
        height: INPUT_H,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: INPUT_BG,
          border: INPUT_BORDER,
          borderRadius: INPUT_RADIUS,
        }}
      />
      {/* + button */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top:  '50%',
          transform: 'translateY(-50%)',
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          color: TEXT_DIM,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500, fontSize: 22,
        }}
      >
        +
      </div>
      {/* Send chip */}
      <div
        style={{
          position: 'absolute',
          right: 24,
          top:  '50%',
          transform: 'translateY(-50%)',
          color: TEXT_VERYDIM,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500, fontSize: 18,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}
      >
        Flash ▾
      </div>
      {/* Placeholder */}
      <div
        style={{
          position: 'absolute',
          left:  32 + 44,
          right: 32 + 80,
          top:   '50%',
          transform: 'translateY(-50%)',
          color: TEXT_VERYDIM,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500, fontSize: 28,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {placeholder}
      </div>
    </div>
  );
}

// ─── Morphing prompt: typed into input, then flies to user bubble ────────────
// Gated on the `prompt` reveal step. Typing runs over the first part of the
// window, the morph over the last part (PROMPT_MORPH_FRAC). A re-mention pulse
// composes into the OUTER transform around the object's own centre.

function MorphingPrompt({
  frame, fullText, placeholder, typeProgress, morphProgress, pulseFrames,
}: {
  frame: number;
  fullText: string;
  placeholder: string;
  typeProgress: number;     // 0..1
  morphProgress: number;    // 0..1
  pulseFrames: number[];
}) {
  // Number of characters revealed
  const chars = Math.floor(fullText.length * typeProgress);
  const visible = fullText.slice(0, chars);
  const isTyping = typeProgress > 0 && typeProgress < 1 && morphProgress < 0.01;

  // ─── Position interpolation ────────────────────────────────────────────────
  // Start: pill-shaped input bar (full INPUT_W) sitting at INPUT_TOP.
  // End: right-aligned bubble (auto-width up to BUBBLE_MAX_W) at top-right.
  const mp = clamp01(morphProgress);
  const ease = easeInOutCubic(mp);

  const startLeft = INPUT_LEFT;
  const startTop  = INPUT_TOP;
  const startW    = INPUT_W;
  const startH    = INPUT_H;
  const startRad  = INPUT_RADIUS;
  const startPadX = 32;
  const startFontSize = 28;
  const startTextAlign: 'left' | 'right' = 'left';

  // End bubble, width AND height sized to fit the wrapped text.
  const endBox  = estimateUserBubble(fullText);
  const endW    = endBox.w;
  const endLeft = BUBBLE_RIGHT - endW;
  const endTop  = BUBBLE_TOP;
  const endH    = endBox.h;
  const endRad  = BUBBLE_RADIUS;
  const endPadX = BUBBLE_PAD_X;
  const endFontSize = endBox.fontSize;
  const endTextAlign: 'left' | 'right' = 'left';

  const left = lerp(startLeft, endLeft, ease);
  const top  = lerp(startTop,  endTop,  ease);
  const w    = lerp(startW,    endW,    ease);
  const h    = lerp(startH,    endH,    ease);
  const rad  = lerp(startRad,  endRad,  ease);
  const padX = lerp(startPadX, endPadX, ease);
  const fontSize = lerp(startFontSize, endFontSize, ease);

  // ─── Squash & stretch ──────────────────────────────────────────────────────
  let scaleX = 1;
  let scaleY = 1;
  if (mp > 0) {
    if (mp < 0.18) {
      const a = mp / 0.18;
      scaleX = 1 + 0.10 * easeInOutCubic(a);
      scaleY = 1 - 0.12 * easeInOutCubic(a);
    } else if (mp < 0.78) {
      const a = (mp - 0.18) / 0.60;
      const tt = Math.sin(Math.PI * a);
      scaleX = 1 - 0.04 * tt;
      scaleY = 1 + 0.08 * tt;
    } else {
      const a = (mp - 0.78) / 0.22;
      const bounce = easeOutBack(a);
      scaleX = lerp(1.04, 1.00, bounce);
      scaleY = lerp(0.94, 1.00, bounce);
    }
  }

  // Re-mention pulse, composed with the squash/stretch on the outer transform.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // ─── Background crossfade ──────────────────────────────────────────────────
  const inputOp  = 1 - clamp01(mp / 0.35);
  const bubbleOp = clamp01((mp - 0.20) / 0.40);

  const textAlign: 'left' | 'right' = mp < 0.7 ? startTextAlign : endTextAlign;

  // Placeholder shown only when nothing has been typed yet
  const showPlaceholder = chars === 0 && mp === 0;

  // Centre of the object (for the pulse origin), in canvas coords.
  const cx = left + w / 2;
  const cy = top + h / 2;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${cx}px ${cy}px`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left, top,
          width: w,
          height: h,
          transform: `scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
      >
        {/* Input-bar surface */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: INPUT_BG,
            border: INPUT_BORDER,
            borderRadius: lerp(startRad, endRad, ease),
            opacity: inputOp,
          }}
        />
        {/* Bubble surface */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: ME_BUBBLE_BG,
            border: ME_BUBBLE_BORDER,
            borderRadius: rad,
            opacity: bubbleOp,
            boxShadow: bubbleOp > 0 ? ME_BUBBLE_SHADOW : 'none',
          }}
        />
        {/* + button (only visible in input mode) */}
        <div
          style={{
            position: 'absolute',
            left: 24,
            top:  '50%',
            transform: 'translateY(-50%)',
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
            color: TEXT_DIM,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500, fontSize: 22,
            opacity: inputOp,
          }}
        >
          +
        </div>
        {/* Send chip (right side, input mode) */}
        <div
          style={{
            position: 'absolute',
            right: 24,
            top:  '50%',
            transform: 'translateY(-50%)',
            color: TEXT_VERYDIM,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500, fontSize: 18,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            opacity: inputOp,
          }}
        >
          Flash ▾
        </div>

        {/* Text content */}
        <div
          style={{
            position: 'absolute',
            left:  padX + (inputOp > 0 ? 44 : 0),
            right: padX + (inputOp > 0 ? 80 : 0),
            top:   '50%',
            transform: 'translateY(-50%)',
            color: showPlaceholder ? TEXT_VERYDIM : TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize,
            letterSpacing: '-0.005em',
            lineHeight: 1.35,
            textAlign,
            whiteSpace: 'normal',
            overflow: 'hidden',
          }}
        >
          {showPlaceholder ? placeholder : visible}
          {isTyping && <Cursor frame={frame} height={fontSize * 1.1} />}
        </div>
      </div>
    </div>
  );
}

// ─── AI typing pulse ─────────────────────────────────────────────────────────

function AITypingPulse({ frame, startF, opacity, top }: {
  frame: number; startF: number; opacity: number; top: number;
}) {
  if (opacity <= 0) return null;
  const local = frame - startF;
  return (
    <div
      style={{
        position: 'absolute',
        left: RESP_LEFT,
        top,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity,
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(4,150,255,0.18)',
          border: '1px solid rgba(127,201,255,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <SparkleIcon size={26} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {[0, 1, 2].map(i => {
          const phase = ((local - i * 5) % 30 + 30) % 30;
          const a = phase < 15
            ? 0.30 + 0.70 * (phase / 15)
            : 0.30 + 0.70 * (1 - (phase - 15) / 15);
          return (
            <div
              key={i}
              style={{
                width: 12, height: 12, borderRadius: '50%',
                background: '#FFFFFF', opacity: a,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── AI intro block (brand badge + intro paragraph) ──────────────────────────
// Gated on the `intro` reveal step. The brand badge + intro paragraph fade in
// over the back portion of the intro window (the typing pulse runs first). A
// re-mention pulse composes into the OUTER transform around the block's centre.

function AIIntroBlock({
  intro, frame, fadeStartF, fadeDurF, responseTop, pulseFrames,
}: {
  intro: string;
  frame: number;
  fadeStartF: number;
  fadeDurF: number;
  responseTop: number;
  pulseFrames: number[];
}) {
  const introOp = easeOutCubic(interpolate(frame, [fadeStartF, fadeStartF + fadeDurF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }));
  const introLift = interpolate(frame, [fadeStartF, fadeStartF + fadeDurF], [16, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  // Re-mention pulse, around the intro block's own approximate centre.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const pulseCX = RESP_LEFT + RESP_W / 2;
  const pulseCY = responseTop + 80;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${pulseCX}px ${pulseCY}px`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: RESP_LEFT,
          top:  responseTop,
          width: RESP_W,
          pointerEvents: 'none',
        }}
      >
        {/* Brand badge above intro */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            opacity: introOp, transform: `translateY(${-introLift}px)`,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(4,150,255,0.18)',
              border: '1px solid rgba(127,201,255,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <SparkleIcon size={26} />
          </div>
          <div
            style={{
              color: TEXT_DIM,
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 500, fontSize: 18,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Kubicle AI
          </div>
        </div>

        {/* Intro paragraph */}
        <div
          style={{
            color: TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500, fontSize: 28,
            letterSpacing: '-0.005em',
            lineHeight: 1.5,
            opacity: introOp,
            transform: `translateY(${introLift}px)`,
          }}
        >
          {intro}
        </div>
      </div>
    </div>
  );
}

// ─── AI section (one numbered answer section) ────────────────────────────────
// Gated on its message{i} reveal step. Pops in with a back overshoot; a
// re-mention pulse composes into the OUTER transform around the section centre.

function AISection({
  section, frame, startF, durF, top, pulseFrames,
}: {
  section: { heading: string; body: string };
  frame: number;
  startF: number;
  durF: number;
  top: number;
  pulseFrames: number[];
}) {
  if (frame < startF) return null;

  const p = clamp01(interpolate(frame, [startF, startF + durF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  }));
  const eased = easeOutBack(p);
  const lift  = lerp(28, 0, eased);
  const scale = lerp(0.96, 1.0, eased);
  const op = clamp01(p * 1.3);

  // Re-mention pulse, around the section's own centre (approx).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));
  const pulseCX = RESP_LEFT + RESP_W / 2;
  const pulseCY = top + 50;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${pulseCX}px ${pulseCY}px`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: RESP_LEFT,
          top,
          width: RESP_W,
          opacity: op,
          transform: `translateY(${lift}px) scale(${scale})`,
          transformOrigin: 'left center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            color: TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700, fontSize: 30,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            marginBottom: 8,
          }}
        >
          {section.heading}
        </div>
        <div
          style={{
            color: TEXT_DIM,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500, fontSize: 24,
            letterSpacing: '-0.005em',
            lineHeight: 1.45,
          }}
        >
          {section.body}
        </div>
      </div>
    </div>
  );
}

// ─── Window chrome (header + footer + panel) ─────────────────────────────────

function ChatWindowFrame({
  brand, chatBgOpacity,
}: {
  brand: string;
  chatBgOpacity: number;     // 0 in splash → 1 in chat (lightens header divider)
}) {
  return (
    <>
      {/* Window panel */}
      <div
        style={{
          position: 'absolute',
          left: WIN_LEFT,
          top:  WIN_TOP,
          width: WIN_W,
          height: WIN_H,
          borderRadius: WIN_RADIUS,
          background: WIN_BG,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}
      />

      {/* Header strip (brand mark + name) */}
      <div
        style={{
          position: 'absolute',
          left: WIN_LEFT,
          top:  WIN_TOP,
          width: WIN_W,
          height: HEADER_H,
          background: HEADER_BG,
          borderTopLeftRadius:  WIN_RADIUS,
          borderTopRightRadius: WIN_RADIUS,
          borderBottom: `1px solid rgba(255,255,255,${0.04 + 0.06 * chatBgOpacity})`,
          display: 'flex', alignItems: 'center',
          padding: '0 36px',
          gap: 16,
        }}
      >
        <SparkleIcon size={36} />
        <div
          style={{
            color: TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700, fontSize: 28,
            letterSpacing: '-0.01em',
          }}
        >
          {brand}
        </div>
        {/* Tiny dim sub-label, mimicking Gemini's "Flash" model chip */}
        <div
          style={{
            marginLeft: 4,
            color: TEXT_VERYDIM,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500, fontSize: 18,
            letterSpacing: '0.02em',
            padding: '4px 10px',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 999,
          }}
        >
          Flash
        </div>
      </div>

      {/* Footer plate (the input bar floats over this) */}
      <div
        style={{
          position: 'absolute',
          left: WIN_LEFT,
          top:  FOOTER_TOP,
          width: WIN_W,
          height: FOOTER_H,
          background: FOOTER_BG,
          borderBottomLeftRadius:  WIN_RADIUS,
          borderBottomRightRadius: WIN_RADIUS,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      />
    </>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const KubicleAIChat: React.FC<KubicleAIChatProps> = ({
  brand = 'Kubicle AI',
  greeting,
  subline,
  inputPlaceholder = 'Ask Kubicle AI',
  userPrompt,
  response,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading KubicleAIChat fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence has a step targeting it. No step
  // -> the element is absent (blank-canvas default).
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
  );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.6);

  // Re-mention pulse frames per content target (from timings.pulses).
  const pulseFramesFor = (target: string): number[] =>
    (timings?.pulses ?? []).filter((p) => p.target === target).map((p) => f(p.at));

  // The user bubble grows to fit the prompt; the AI response starts below it so
  // a tall (multi-line) bubble never overlaps the answer. The 42px gap matches
  // the original single-line spacing.
  const userBubble  = estimateUserBubble(userPrompt);
  const responseTop = BUBBLE_TOP + userBubble.h + 42;

  // ── setup, chat shell slides up + greeting fades in (scaffolding) ─────────
  const cSetup = cue('setup');
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupDurF   = cSetup ? f(durOf(cSetup)) : 0;

  // Chat container slides up from below the canvas. Same easing as GroupChat.
  const containerDy = cSetup
    ? interpolate(frame, [setupStartF, setupStartF + setupDurF], [CANVAS_H, 0], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
        easing: easeOutBackSettle,
      })
    : 0;
  // Greeting fades in over the back portion of the setup window.
  const greetFadeStart = setupStartF + setupDurF * SETUP_GREET_FRAC;
  const greetIn = cSetup
    ? easeOutCubic(interpolate(frame, [greetFadeStart, setupStartF + setupDurF], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }))
    : 0;

  // ── prompt, types into the bar then morphs into the user bubble ───────────
  const cPrompt = cue('prompt');
  const promptStartF = cPrompt ? f(cPrompt.at) : 0;
  const promptDurF   = cPrompt ? f(durOf(cPrompt)) : 0;
  const typeEndF     = promptStartF + promptDurF * PROMPT_MORPH_FRAC;
  const morphStartF  = typeEndF;
  const morphEndF    = promptStartF + promptDurF;

  const typeProgress = cPrompt
    ? clamp01(interpolate(frame, [promptStartF, typeEndF], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: easeInOutCubic,
      }))
    : 0;
  const morphProgress = cPrompt
    ? clamp01(interpolate(frame, [morphStartF, morphEndF], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }))
    : 0;

  // Greeting fades OUT as the morph begins (the splash gives way to the feed).
  const greetOut = cPrompt
    ? easeInOutCubic(interpolate(frame, [morphStartF - 8, morphStartF + 18], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }))
    : 0;
  const greetOp = greetIn * (1 - greetOut);
  const greetLift = greetOut * 40;

  // Header divider darkens slightly once the morph completes (chat view).
  const chatBgOp = cPrompt
    ? clamp01(interpolate(frame, [morphStartF, morphEndF], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      }))
    : 0;

  // The empty input bar shows until the prompt starts typing/morphing. Once the
  // prompt step is active the MorphingPrompt draws the bar itself.
  const showEmptyBar = cSetup && (!cPrompt || frame < promptStartF);

  // ── intro, AI typing pulse then brand badge + intro paragraph ─────────────
  const cIntro = cue('intro');
  const introStartF = cIntro ? f(cIntro.at) : 0;
  const introDurF   = cIntro ? f(durOf(cIntro)) : 0;
  const pulseEndF   = introStartF + introDurF * INTRO_PULSE_FRAC;
  const introFadeStartF = pulseEndF;
  const introFadeDurF   = introDurF - introDurF * INTRO_PULSE_FRAC;

  // AI typing pulse: fades in at the intro start, fades out as the paragraph
  // begins to appear.
  const typingOp = cIntro
    ? clamp01(interpolate(frame, [introStartF, introStartF + 6], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })) * (1 - clamp01(interpolate(frame, [introFadeStartF - 6, introFadeStartF + 4], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })))
    : 0;

  // ── messages, each numbered section, gated on its own message{i} step ─────
  // Each section stacks below the intro paragraph plus the sections above it.
  // Heights are estimated from the body length so taller bodies still clear.
  const INTRO_BLOCK_H = 200;   // brand badge + intro paragraph + gap
  function sectionEstHeight(body: string): number {
    const charsPerLine = 92;            // approx at RESP_W / body font
    const lines = Math.max(1, Math.ceil(body.length / charsPerLine));
    return 30 + 8 + lines * 35 + 24;    // heading + gap + body lines + margin
  }
  let sectionTop = responseTop + INTRO_BLOCK_H;
  const sectionTops: number[] = [];
  for (const s of response.sections) {
    sectionTops.push(sectionTop);
    sectionTop += sectionEstHeight(s.body);
  }

  return (
    <AbsoluteFill style={{ background: PLATINUM_BG, overflow: 'hidden' }}>
      {/* Everything below moves as one unit: the entire chat scene slides up
          from below the canvas during setup, then sits still. */}
      {cSetup && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${containerDy}px)`,
          }}
        >
          {/* Chat-window frame (panel + header + footer) */}
          <ChatWindowFrame brand={brand} chatBgOpacity={chatBgOp} />

          {/* Splash greeting (revealed within setup, fades out at morph) */}
          <SplashGreeting
            greeting={greeting}
            subline={subline}
            opacity={greetOp}
            lift={greetLift}
          />

          {/* Empty input bar, shown until the prompt begins */}
          {showEmptyBar && <EmptyInputBar placeholder={inputPlaceholder} />}

          {/* Morphing prompt (types in the bar, then becomes the user bubble) */}
          {cPrompt && (
            <MorphingPrompt
              frame={frame}
              fullText={userPrompt}
              placeholder={inputPlaceholder}
              typeProgress={typeProgress}
              morphProgress={morphProgress}
              pulseFrames={pulseFramesFor('prompt')}
            />
          )}

          {/* AI typing pulse (first part of the intro window) */}
          {cIntro && (
            <AITypingPulse frame={frame} startF={introStartF} opacity={typingOp} top={responseTop} />
          )}

          {/* AI intro block (brand badge + intro paragraph) */}
          {cIntro && (
            <AIIntroBlock
              intro={response.intro}
              frame={frame}
              fadeStartF={introFadeStartF}
              fadeDurF={introFadeDurF}
              responseTop={responseTop}
              pulseFrames={pulseFramesFor('intro')}
            />
          )}

          {/* Answer sections, each gated on its own message{i} step */}
          {response.sections.map((section, i) => {
            const c = cue(`message${i}`);
            return c ? (
              <AISection
                key={`message-${i}`}
                section={section}
                frame={frame}
                startF={f(c.at)}
                durF={f(durOf(c))}
                top={sectionTops[i]!}
                pulseFrames={pulseFramesFor(`message${i}`)}
              />
            ) : null;
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const kubicleAIChatDefaultProps: KubicleAIChatProps = {
  brand: 'Kubicle AI',
  greeting: "Hey User, what's on your mind?",
  subline: 'Ask anything about your lesson, deck, or script.',
  inputPlaceholder: 'Ask Kubicle AI',
  userPrompt: 'How do I write a clear lesson script?',
  response: {
    intro:
      'Writing a clear lesson script comes down to three things: a strong ' +
      'opening, tight structure, and reading it aloud before you record.',
    sections: [
      {
        heading: '1. Open with the why',
        body:
          'Start with a single sentence that tells the learner what they ' +
          'will be able to do after the lesson. This sets expectations and ' +
          'earns their attention.',
      },
      {
        heading: '2. Chunk into three to five beats',
        body:
          'Break the body into a small number of clear sections. Each ' +
          'section should make a single point and finish with a quick ' +
          'summary line.',
      },
      {
        heading: '3. Read it aloud before recording',
        body:
          'Speak the script through once. Anywhere you stumble is a ' +
          'sentence that needs rewriting. Plain words beat clever ones ' +
          'every time.',
      },
    ],
  },
  timings: {
    sequence: [
      { target: 'setup',    at: 0.2, in: 1.4 },
      { target: 'prompt',   at: 1.8, in: 3.0 },
      { target: 'intro',    at: 5.2, in: 1.2 },
      { target: 'message0', at: 6.6, in: 0.6 },
      { target: 'message1', at: 8.2, in: 0.6 },
      { target: 'message2', at: 9.8, in: 0.6 },
    ],
    pulses: [],
  },
};
