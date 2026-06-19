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

// TextThread2Characters, an SMS/iMessage thread flanked by the two people
// talking, rebuilt on the STANDARD reveal-sequence timing model.
//
// Three balanced columns on a soft platinum-blue canvas:
//   • Left character  -> wild-strawberry panel -> wild-strawberry "received" bubbles.
//   • Right character -> dodger-blue panel    -> dodger-blue "sent" bubbles.
//   • Phone is a clean white rounded card (no bezel) with a status bar,
//     iMessage-style header, message feed, and footer drawn directly inside.
//   • All three columns share one matched drop shadow so they lift off the
//     canvas with the same visual weight.
//
// Reveal-sequence model:
//   • setup      , the thread FRAME stages in as one scaffolding reveal: the
//                    phone card scales up + fades in, and both colour-matched
//                    character panels fade in just after. No message text yet.
//   • message0..N, each chat bubble pops in ONE AT A TIME in send order
//                    (alternating sides per its `side`), at its own cue. N is
//                    messages.length (3-6). A message{i} with i >= N is ignored.
//
// The thread is inherently LINEAR (bubbles land in send order), so reveal order
// = message order. See GUIDANCE.md for selection + narration rules.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const textThread2CharactersMessageSchema = z.object({
  // Which character "sent" this message. Side maps to that character's
  // on-canvas position AND to the bubble's left/right alignment + colour.
  side: z.enum(['left', 'right']),
  // Message body. Satoshi Medium 22 px inside the bubble. ≤80 chars keeps
  // each message to one or two wrapped lines.
  text: z.string().min(1).max(80),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (the
// soft platinum-blue stage with nothing on it). Each step is one "object". All
// times are scene-relative SECONDS.
//
// Addressable targets:
//   setup              the thread FRAME: phone card scales/fades in + both
//                      character panels fade in (one scaffolding reveal).
//   message0..messageN-1   one chat bubble revealed as a single object (pop +
//                      fade). N is messages.length (3-6). message{i} with
//                      i >= N is ignored.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|message[0-9]+)$/),
  at: z.number().nonnegative(),          // when it starts appearing
  in: z.number().positive().default(0.6), // entrance duration (pop + fade)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed bubble is NAMED AGAIN later in the
// narration (>~2-3s after its reveal), it gives a brief, subtle brand pulse at
// the exact re-mention timestamp. `at` is the scene-relative second of the
// re-mention (taken from the SRT). target is a content bubble (message{i});
// setup is not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^message[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const textThread2CharactersTimingsSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

// Character library, every PNG in the shared CHARACTER LIBRARY (PNG) set.
// They are uniformly-framed waist-up portraits, so the scene renders all of
// them at one fixed framing (see FIXED_CHARACTER_ZOOM): pick any id and the
// two characters always sit at the same size and position. Swapping a
// character is just changing its id, no per-character tuning needed.
export const CHARACTER_IDS = [
  'Female_middleage_Asian',
  'female_earlycareer_black',
  'female_earlycareer_middleeastern',
  'female_earlycareer_white',
  'female_earlycareer_white2',
  'female_earlycareer_white3',
  'female_midcareer_white',
  'female_middleage_white',
  'female_middleage_white2',
  'female_middleage_white3',
  'male_earlycareer_black',
  'male_middleage_asian',
  'male_middleage_black',
  'male_middleage_white',
  'male_middleage_white2',
  'male_middleage_white3',
] as const;

export const characterIdSchema = z.enum(CHARACTER_IDS);

export const textThread2CharactersSchema = z.object({
  // Bold-black contact name in the phone's header.
  contactName:    z.string().min(1).max(22),
  // Pick any id from the character library, both render at identical framing.
  leftCharacter:  characterIdSchema,
  rightCharacter: characterIdSchema,
  // The text thread. Order matters, messages land in this order (3-6).
  messages:       z.array(textThread2CharactersMessageSchema).min(3).max(6),
  timings:        textThread2CharactersTimingsSchema.optional(),
});

export type TextThread2CharactersProps = z.infer<
  typeof textThread2CharactersSchema
>;

export const textThread2CharactersMeta = {
  description:
    'Three balanced columns: a wild-strawberry panel containing the left ' +
    'character, a clean white iMessage-style phone in the middle, and a ' +
    'dodger-blue panel containing the right character. Each character\'s ' +
    'panel matches their bubble colour for a tight visual link between who ' +
    'is speaking and which side of the thread their message lands on. Best ' +
    'for dialogue, Q&A, or any back-and-forth exchange between two people.',
  authoringNotes:
    'Supply 3-6 messages. Each is { side: "left" | "right", text: ≤80 chars }. ' +
    'side maps to which on-canvas character "sent" it AND to that bubble\'s ' +
    'colour: left ⇒ wild-strawberry received bubble, right ⇒ dodger-blue sent ' +
    'bubble. contactName ≤22 chars shows bold-black at the top of the phone. ' +
    'leftCharacter / rightCharacter are ids from the character library (e.g. ' +
    'female_earlycareer_white, male_middleage_black). Both always render at the ' +
    'same fixed framing, so swapping a character is just changing its id, they ' +
    'never differ in size or position. The bubble stack auto-lays-out for ' +
    'whatever count (3-6) you supply. ' +
    'TIMING (reveal-sequence model): nothing is shown by default, every element ' +
    'appears only when a step in `timings.sequence` targets it. Schedule a ' +
    '`setup` step first (the thread frame: phone card + both character panels ' +
    'stage in), then one `message{i}` per message in SEND ORDER. Each step is ' +
    '{ target, at (seconds), in? (entrance duration, default 0.6) }. The thread ' +
    'is inherently LINEAR, so reveal order = message order; sync each ' +
    'message{i}.at to the narration cue that delivers that line. A re-mention ' +
    'pulse (timings.pulses: { target: message{i}, at }) gives an already-shown ' +
    'bubble a brief brand pulse when its line is referenced again. See ' +
    'GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants ────────────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Three columns sum to the canvas width:
//   60 [margin] + 580 [left panel] + 20 [gap] + 600 [phone] + 20 [gap]
//   + 580 [right panel] + 60 [margin] = 1920
const COLUMN_TOP = 60;
const COLUMN_H   = 960;
const COLUMN_RADIUS = 36;

const LEFT_PANEL_LEFT  = 60;
const PANEL_W          = 580;
const PHONE_LEFT       = LEFT_PANEL_LEFT + PANEL_W + 20;     // 660
const PHONE_W          = 600;
const RIGHT_PANEL_LEFT = PHONE_LEFT + PHONE_W + 20;          // 1280

// Phone internals.
const STATUS_BAR_H = 42;
const HEADER_H     = 92;
const FOOTER_H     = 82;
const FEED_TOP     = STATUS_BAR_H + HEADER_H;                // 134
const FEED_BOTTOM  = COLUMN_H - FOOTER_H;                    // 878
const FEED_PAD_X   = 22;
const FEED_PAD_TOP = 22;

// Bubble sizing.
const BUBBLE_MAX_W  = PHONE_W - 2 * FEED_PAD_X - 90;         // ~466
const BUBBLE_PAD_X  = 20;
const BUBBLE_PAD_Y  = 14;
const BUBBLE_RADIUS = 24;
const BUBBLE_GAP    = 16;

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Internal sub-stagger proportions, expressed as fractions of the `setup`
// window so the frame's compound entrance survives the collapse to one
// {at, in}: the phone fills the whole window; both character panels start a
// fraction in and finish with it (preserving the prototype's panel delay).
const PANELS_OFFSET_FRAC = 0.45;

const easeOutCubic   = Easing.out(Easing.cubic);
const easeOutBackPop = Easing.out(Easing.back(1.6));

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

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

// Soft cool-white canvas, gives both the pink and the blue panels room to
// breathe without competing.
const CANVAS_BG       = '#F4F7FB';
const WILD_STRAWBERRY = '#F865B0';                           // received side
const DODGER_BLUE     = '#0496FF';                           // sent side
const WHITE           = '#FFFFFF';
const DARK_TEXT       = '#0A0F18';
const HEADER_NAME     = '#0A0F18';
const HEADER_LINK     = '#0496FF';
const SOFT_DIVIDER    = '#E2E6EC';
const INPUT_BORDER    = '#DDE2E8';
const PLACEHOLDER     = '#9CA3AF';

// Soft inner gradients on the character panels give them depth.
const WILD_STRAWBERRY_PANEL_BG =
  'linear-gradient(180deg, #FB85C2 0%, #F865B0 52%, #DC4C97 100%)';
const DODGER_PANEL_BG =
  'linear-gradient(180deg, #36AEFF 0%, #0496FF 50%, #027ED9 100%)';

// One shared drop shadow so all three columns (left panel, phone, right
// panel) lift off the canvas with the same visual weight.
const COLUMN_SHADOW =
  '0 24px 50px rgba(5, 36, 56, 0.18), ' +
  '0 6px 16px rgba(5, 36, 56, 0.10)';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold = new FontFace(
      'Satoshi',
      `url(${SATOSHI_BOLD_SRC}) format('woff2')`,
      { weight: '700', display: 'block' },
    );
    const medium = new FontFace(
      'Satoshi',
      `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`,
      { weight: '500', display: 'block' },
    );
    const [b, m] = await Promise.all([bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

// ─── Inline glyphs (status bar + header chevron + camera) ────────────────────

function ChevronLeft({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M15 5 L8 12 L15 19"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SignalDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: i === 0 ? color : 'transparent',
            border: `1.5px solid ${color}`,
          }}
        />
      ))}
    </div>
  );
}

function BatteryIcon({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <div
        style={{
          width: 22,
          height: 11,
          border: `1.5px solid ${color}`,
          borderRadius: 2,
          padding: 1,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', height: '100%', background: color }} />
      </div>
      <div style={{ width: 2, height: 5, background: color, borderRadius: 1 }} />
    </div>
  );
}

function CameraIcon({ color }: { color: string }) {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <rect
        x={2.5}
        y={6}
        width={19}
        height={13}
        rx={2.5}
        stroke={color}
        strokeWidth={1.8}
      />
      <path
        d="M8 6 L9.5 4 H14.5 L16 6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx={12} cy={12.5} r={3.5} stroke={color} strokeWidth={1.8} />
    </svg>
  );
}

// ─── Character panel (colour-matched card containing a portrait PNG) ─────────

// One fixed framing for every character so the two sides always match in size
// and position. The library PNGs are uniformly-framed waist-up portraits; this
// scale crops them to a consistent head-and-shoulders shot inside the panel.
const FIXED_CHARACTER_ZOOM = 1.1;

function CharacterPanel({
  id,
  side,
  background,
  opacity,
}: {
  id: string;
  side: 'left' | 'right';
  background: string;
  opacity: number;
}) {
  // Scale every character up from the top of the panel by the same factor; the
  // bottom spills out of the (overflow: hidden) panel, leaving a uniform crop.
  const transform = `scale(${FIXED_CHARACTER_ZOOM})`;
  return (
    <div
      style={{
        position: 'absolute',
        left: side === 'left' ? LEFT_PANEL_LEFT : RIGHT_PANEL_LEFT,
        top:  COLUMN_TOP,
        width:  PANEL_W,
        height: COLUMN_H,
        borderRadius: COLUMN_RADIUS,
        background,
        boxShadow: COLUMN_SHADOW,
        overflow: 'hidden',
        opacity,
      }}
    >
      <Img
        src={staticFile(`characters/${id}.png`)}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          transform,
          transformOrigin: 'center top',
          // Subtle drop shadow that follows the PNG's alpha mask, so the
          // figure (not its bounding box) casts a soft shadow against the
          // coloured panel behind it.
          filter:
            'drop-shadow(0 12px 18px rgba(5, 36, 56, 0.28)) ' +
            'drop-shadow(0 3px 6px rgba(5, 36, 56, 0.18))',
        }}
      />
    </div>
  );
}

// ─── Phone card (white rounded rectangle, no bezel) ──────────────────────────

function PhoneCard({
  contactName,
  scale,
  opacity,
  children,
}: {
  contactName: string;
  scale: number;
  opacity: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE_LEFT,
        top:  COLUMN_TOP,
        width:  PHONE_W,
        height: COLUMN_H,
        borderRadius: COLUMN_RADIUS,
        background: WHITE,
        boxShadow: COLUMN_SHADOW,
        overflow: 'hidden',
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
        opacity,
      }}
    >
      {/* Status bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top:  0,
          width:  PHONE_W,
          height: STATUS_BAR_H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          boxSizing: 'border-box',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: DARK_TEXT,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <SignalDots color={DARK_TEXT} />
          <span>Sprint</span>
        </div>
        <span>9:41 AM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>100%</span>
          <BatteryIcon color={DARK_TEXT} />
        </div>
      </div>

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top:  STATUS_BAR_H,
          width:  PHONE_W,
          height: HEADER_H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          boxSizing: 'border-box',
          borderBottom: `1px solid ${SOFT_DIVIDER}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={24} color={HEADER_LINK} />
          <span
            style={{
              fontFamily: "'Satoshi', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 19,
              color: HEADER_LINK,
            }}
          >
            Messages
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: HEADER_NAME,
          }}
        >
          {contactName}
        </span>
        <span
          style={{
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 19,
            color: HEADER_LINK,
          }}
        >
          Contact
        </span>
      </div>

      {/* Feed slot, children render inside this clipped region */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top:  FEED_TOP,
          width:  PHONE_W,
          height: FEED_BOTTOM - FEED_TOP,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top:  COLUMN_H - FOOTER_H,
          width:  PHONE_W,
          height: FOOTER_H,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 18px',
          boxSizing: 'border-box',
          borderTop: `1px solid ${SOFT_DIVIDER}`,
          background: WHITE,
        }}
      >
        <CameraIcon color={DARK_TEXT} />
        <div
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            border: `1px solid ${INPUT_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 18,
            color: PLACEHOLDER,
          }}
        >
          iMessage
        </div>
        <span
          style={{
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 19,
            color: HEADER_LINK,
          }}
        >
          Send
        </span>
      </div>
    </div>
  );
}

// ─── Message bubble (one revealed object) ────────────────────────────────────
// Gated on its message{i} reveal step: the bubble pops in (scale easeOutBack +
// fade) over the step's window, around its own anchored corner. A re-mention
// pulse is multiplied into the OUTER transform around the bubble's own centre,
// composing with (never replacing) the reveal pop. frame < startF -> absent.

function Bubble({
  frame,
  side,
  text,
  top,
  startF,
  durF,
  pulseFrames,
}: {
  frame: number;
  side: 'left' | 'right';
  text: string;
  top:  number;
  startF: number;
  durF: number;
  pulseFrames: number[];
}) {
  const local = frame - startF;
  if (local < 0) return null;

  const isLeft = side === 'left';

  // Entrance pop + fade over the step's window.
  let revealScale: number;
  let opacity: number;
  if (local >= durF) {
    revealScale = 1;
    opacity = 1;
  } else {
    const p = local / durF;
    revealScale = interpolate(easeOutBackPop(p), [0, 1], [0.85, 1]);
    opacity = clamp01(p * 2);
  }

  // Re-mention pulse: a brief scale bump around the bubble's own centre,
  // composed (multiplied) into the outer transform on top of the reveal pop.
  // 1 outside pulse windows so the entrance is untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top,
        width: PHONE_W,
        display: 'flex',
        justifyContent: isLeft ? 'flex-start' : 'flex-end',
        padding: `0 ${FEED_PAD_X}px`,
        boxSizing: 'border-box',
        opacity,
        // Reveal pop and re-mention pulse compose in one transform; both pivot
        // on the bubble's own anchored corner so the bump never drifts.
        transform: `scale(${revealScale * pulse})`,
        transformOrigin: isLeft ? '0% 100%' : '100% 100%',
      }}
    >
      <div
        style={{
          maxWidth: BUBBLE_MAX_W,
          padding: `${BUBBLE_PAD_Y}px ${BUBBLE_PAD_X}px`,
          borderRadius: BUBBLE_RADIUS,
          background: isLeft ? WILD_STRAWBERRY : DODGER_BLUE,
          color:      WHITE,
          // Break long unbroken tokens (URLs, hashes) so they wrap inside the
          // bubble instead of overflowing past BUBBLE_MAX_W and clipping at the
          // feed edge.
          overflowWrap: 'break-word',
          wordBreak:    'break-word',
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 22,
          lineHeight: 1.28,
          letterSpacing: '-0.005em',
        }}
      >
        {text}
      </div>
    </div>
  );
}

// Rough text-measurement for vertical stacking of bubbles.
function estimateBubbleHeight(text: string): number {
  const charsPerLine = Math.floor((BUBBLE_MAX_W - 2 * BUBBLE_PAD_X) / 12);
  const words = text.split(/\s+/);
  let lines = 1;
  let cur = 0;
  for (const w of words) {
    const wl = w.length + 1;
    if (cur + wl > charsPerLine && cur > 0) {
      lines++;
      cur = wl;
    } else {
      cur += wl;
    }
  }
  const lineH = 30;
  return BUBBLE_PAD_Y * 2 + lines * lineH;
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const TextThread2Characters: React.FC<TextThread2CharactersProps> = ({
  contactName,
  leftCharacter,
  rightCharacter,
  messages,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() =>
    delayRender('Loading TextThread2Characters fonts'),
  );
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

  // Re-mention pulse frames per message{i} (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `message${i}`)
      .map((p) => f(p.at));

  // ── setup, the thread FRAME stages in (phone card + both panels) ─────────
  // The phone fills the whole setup window; both character panels fade in over
  // the back portion (internal sub-stagger preserving the prototype's delay).
  const cSetup = cue('setup');
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupDurF   = cSetup ? f(durOf(cSetup)) : 0;

  const phoneEased = cSetup
    ? interpolate(frame, [setupStartF, setupStartF + setupDurF], [0, 1], {
        extrapolateLeft:  'clamp',
        extrapolateRight: 'clamp',
        easing: easeOutCubic,
      })
    : 0;
  const phoneScale   = interpolate(phoneEased, [0, 1], [0.92, 1]);
  const phoneOpacity = phoneEased;

  const panelOpacity = cSetup
    ? interpolate(
        frame,
        [setupStartF + setupDurF * PANELS_OFFSET_FRAC, setupStartF + setupDurF],
        [0, 1],
        {
          extrapolateLeft:  'clamp',
          extrapolateRight: 'clamp',
          easing: easeOutCubic,
        },
      )
    : 0;

  // Pre-compute message slot heights so bubbles auto-stack for any count (3-6).
  const heights = messages.map((m) => estimateBubbleHeight(m.text));
  const tops: number[] = [];
  let cursor = FEED_PAD_TOP;
  for (let i = 0; i < messages.length; i++) {
    tops.push(cursor);
    cursor += heights[i] + BUBBLE_GAP;
  }

  return (
    <AbsoluteFill style={{ background: CANVAS_BG, overflow: 'hidden' }}>
      {/* setup, the thread frame: both character panels + the phone card stage
          in as one scaffolding reveal (only when the sequence schedules it). */}
      {cSetup && (
        <>
          <CharacterPanel
            id={leftCharacter}
            side="left"
            background={WILD_STRAWBERRY_PANEL_BG}
            opacity={panelOpacity}
          />
          <CharacterPanel
            id={rightCharacter}
            side="right"
            background={DODGER_PANEL_BG}
            opacity={panelOpacity}
          />

          <PhoneCard
            contactName={contactName}
            scale={phoneScale}
            opacity={phoneOpacity}
          >
            {/* message{i}, each chat bubble gated on its own reveal step. */}
            {messages.map((m, i) => {
              const c = cue(`message${i}`);
              return c ? (
                <Bubble
                  key={i}
                  frame={frame}
                  side={m.side}
                  text={m.text}
                  top={tops[i]!}
                  startF={f(c.at)}
                  durF={f(durOf(c))}
                  pulseFrames={pulseFramesFor(i)}
                />
              ) : null;
            })}
          </PhoneCard>
        </>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const textThread2CharactersDefaultProps: TextThread2CharactersProps = {
  contactName: 'Maya',
  leftCharacter: 'female_earlycareer_white',
  rightCharacter: 'male_middleage_black',
  messages: [
    { side: 'left', text: 'Quick check, are we still on track for sprint demo Friday?' },
    { side: 'right', text: 'Yep. Two stories left, both in QA.' },
    { side: 'left', text: 'Nice. Need anything from me before then?' },
    { side: 'right', text: 'Sign-off on the new dashboard mockups would help.' },
    { side: 'left', text: 'On it tonight. Feedback by EOD tomorrow.' },
    { side: 'right', text: 'Perfect, thanks Maya.' },
  ],
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2, in: 0.9 },
      { target: 'message0', at: 1.0, in: 0.6 },
      { target: 'message1', at: 2.8, in: 0.6 },
      { target: 'message2', at: 4.6, in: 0.6 },
      { target: 'message3', at: 6.4, in: 0.6 },
      { target: 'message4', at: 8.2, in: 0.6 },
      { target: 'message5', at: 10.0, in: 0.6 },
    ],
    pulses: [],
  },
};
