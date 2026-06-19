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

// Cards5Falling, single-focus falling-card sequence.
//   • 1-5 cards on a flat #E6ECF2 background, each using card_header.png for its
//     blue-gradient header + Oxford Blue body. Every card sits at the SAME
//     centred position; only one is on screen at a time.
//   • A card slides down from above the frame (easeOutCubic over its `in`), lands
//     at centre, then falls through the frame (easeInOutCubic) to reveal the
//     next card. Each card carries a bookmark glyph + bold title in the header
//     and one large dark-mode icon in the body.
//
// Reveal-sequence model note on EXIT motion: the standard model schedules only
// appearances ({ target, at, in }), it has no "leaves at" field. The signature
// single-card-at-a-time look is preserved by DERIVING each card's exit from the
// NEXT scheduled card's `at`: card{i} begins to fall when card{i+1} fires. The
// last scheduled card persists (it has no successor to trigger its fall).

// ─── Schema ──────────────────────────────────────────────────────────────────

const cardSchema = z.object({
  // Header title, bold white, single line, kept INSIDE the dodger-blue header
  // box. ~24-char ceiling so it fits on one line; the title is also width-capped
  // and clipped in the layout so it can never spill past the box onto the
  // platinum background.
  title: z.string().min(1).max(24),
  // Icon ID from the catalog (use the "-dark" variants, platinum-white +
  // dodger-blue, so the glyph reads on the Oxford-Blue body).
  icon: z.string().min(1),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just the
// platinum fill). All times are scene-relative SECONDS.
//
// Addressable targets (INDEXED):
//   card0..cardN-1   one card revealed as a single object: header (bookmark +
//                    title) and body icon slide in together as a unit. N is
//                    cards.length (1-5). A card{i} with i >= N is ignored.
// There is NO `setup` target: this template has no shared scaffolding, the
// first content object IS the first card sliding in.
export const revealStepSchema = z.object({
  target: z.string().regex(/^card[0-9]+$/),
  at: z.number().nonnegative(),           // when the card starts sliding in
  in: z.number().positive().default(0.9), // entrance (slide-down) duration
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed card is NAMED AGAIN later in the
// narration (>~2-3s after its reveal, while it is still on screen), it gives a
// brief, subtle brand pulse at the exact re-mention timestamp. `at` is the
// scene-relative second of the re-mention (taken from the SRT). Targets are the
// same INDEXED card slots as the reveal sequence (card0..cardN-1); a pulse only
// has a visible effect while that card is on screen. See README "re-mention
// pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^card[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const cards5FallingTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const cards5FallingSchema = z.object({
  // 1 to 5 cards, ordered top-of-stack first. Each card occupies the same
  // centred position and is shown in turn, so fewer cards simply means a
  // shorter sequence (no layout reflow needed).
  cards: z.array(cardSchema).min(1).max(5),
  timings: cards5FallingTimingSchema.optional(),
});

export type Cards5FallingProps = z.infer<typeof cards5FallingSchema>;

export const cards5FallingMeta = {
  description:
    'Single-focus card sequence: rectangular cards with a blue-gradient header ' +
    '(bookmark icon + bold title) above an Oxford Blue body panel showing one ' +
    'large white-tinted icon. Each card slides down from above, lands centred, ' +
    'then falls through the frame to reveal the next, only one card is on ' +
    'screen at a time. Best for a flat, ordered list of point-cards introduced ' +
    'one after another.',
  authoringNotes:
    'Provide 1 to 5 cards, each is shown in turn at the same centred position, ' +
    'so fewer cards just makes a shorter sequence. Each needs an icon id and a ' +
    'short title, strict 24-character max, bold white, kept inside the ' +
    'dodger-blue header box (width-capped and clipped, so it never spills onto ' +
    'the platinum background). Write tight noun phrases (2-4 words), parallel in ' +
    'form across cards. Use DARK-MODE icons (the "-dark" suffix in the Library): ' +
    'platinum-white + dodger-blue, which read on the Oxford-Blue body. "-light" ' +
    'icons have a dark element that disappears on the body. Give each card a ' +
    'DIFFERENT icon. GOOD title: "Edit notes", "Watch lecture", "Track ' +
    'progress". BAD: "Edit your course notes" (too long). ' +
    'TIMING (reveal-sequence model): nothing shows by default, schedule one ' +
    '`card{i}` per card in order (card0, card1, ...). There is NO setup target. ' +
    'Each step is { target, at (seconds), in? (slide-in duration, default 0.9) } ' +
    'and reveals the whole card (header + title + body icon) as one object. The ' +
    'single-card aesthetic is preserved automatically: card{i} falls away when ' +
    'card{i+1} fires; the last scheduled card persists. NARRATION MUST be ' +
    'linear-by-card: fully deliver one card before the next (the prior card has ' +
    'already fallen out of frame), never reference a later card before its cue. ' +
    'See GUIDANCE.md for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const CARD_HEADER_SRC = staticFile('Template-Specific-Assets/Cards5Falling/card_header.png');
const INTER_BOLD_SRC  = staticFile('fonts/Inter-Bold.woff2');

// ─── Layout constants (measured directly from the supplied PNGs) ─────────────

// Card_header.png solid bbox: x=436..1494, y=206..913 (W=1059, H=708).
// Header (blue gradient): y=206..356; body (Oxford Blue): y=357..913.
const CARD_LEFT     = 436;
const CARD_RIGHT    = 1494;
const CARD_TOP      = 206;
const CARD_BOTTOM   = 913;
const CARD_CX       = (CARD_LEFT + CARD_RIGHT) / 2;      // 965
const HEADER_BOTTOM = 356;
const HEADER_CY     = (CARD_TOP + HEADER_BOTTOM) / 2;    // 281
const BODY_CY       = (HEADER_BOTTOM + CARD_BOTTOM) / 2; // 635

// Header layout, bookmark icon at left, title to its right.
const BOOKMARK_LEFT = 480;
const BOOKMARK_SIZE = 80;
const BOOKMARK_TOP  = HEADER_CY - BOOKMARK_SIZE / 2;
const TITLE_LEFT    = BOOKMARK_LEFT + BOOKMARK_SIZE + 32;
// Max width the title may occupy before the card's right edge, keeps the title
// INSIDE the dodger-blue header box (clipped, never spilling onto the platinum
// background). 44px right padding mirrors the bookmark's left inset.
const TITLE_MAX_WIDTH = CARD_RIGHT - TITLE_LEFT - 44;

// Body icon, large central placeholder.
const BODY_ICON_SIZE = 380;

// ─── Animation timings ────────────────────────────────────────────────────────

const FPS = 30;
const f   = (s: number) => Math.round(s * FPS);

// Travel distances (px). Entry starts above the frame, drop ends below it.
const ENTRY_TRAVEL = -1100;
const DROP_TRAVEL  =  1100;

// Slow, glassy fall, easeInOutCubic over this many seconds (a fixed visual
// constant lifted from the prototype; the standard model does not schedule
// exits, so the fall duration stays internal).
const DROP_DURATION = 2.0;

const entryEase = Easing.out(Easing.cubic);
const dropEase  = Easing.inOut(Easing.cubic);

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

// ─── Font loading ─────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadBrandFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold = new FontFace('Inter', `url(${INTER_BOLD_SRC}) format('woff2')`, {
      weight: '700',
      display: 'block',
    });
    const loaded = await bold.load();
    (document.fonts as FontFaceSet & { add(f: FontFace): void }).add(loaded);
  })();
  return fontsPromise;
}

// ─── Bookmark icon (header decoration, identical on every card) ──────────────

function BookmarkIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="#FFFFFF"
    >
      <path d="m12 1c-7.71 0-11 3.29-11 11s3.29 11 11 11 11-3.29 11-11-3.29-11-11-11zm0 20c-6.561 0-9-2.439-9-9s2.439-9 9-9 9 2.439 9 9-2.439 9-9 9zm2.066-14.754c-.66-.161-1.354-.244-2.065-.246-.703.002-1.395.085-2.055.246-1.413.345-2.484 1.509-2.729 2.966-.32 1.913-.274 4.991.107 7.163.156.954 1.034 1.642 1.984 1.624.565 0 1.085-.232 1.497-.677.233-.251.844-.856 1.189-1.199.332.336 1.013 1.023 1.268 1.257.575.526 1.264.729 1.947.559.777-.193 1.343-.795 1.477-1.565.381-2.171.428-5.25.107-7.161-.244-1.457-1.315-2.621-2.729-2.966zm.686 9.751c-.348-.218-1.412-1.386-1.454-1.397-.608-.744-1.917-.767-2.553-.05-.184.181-1.104 1.091-1.45 1.478-.342-1.945-.388-4.794-.104-6.485.111-.667.595-1.197 1.23-1.353.507-.124 1.041-.188 1.58-.189.548.002 1.084.065 1.591.189.636.155 1.119.687 1.23 1.354.283 1.69.237 4.538-.07 6.454z" />
    </svg>
 );
}

// ─── Single card ──────────────────────────────────────────────────────────────
// Renders one card, gated and timed by its reveal step. The card slides in from
// above over `entryDur`; if a `dropStart` is supplied (the successor card's
// cue), it then falls through the frame over DROP_DURATION. The last scheduled
// card has dropStart === null and persists.

function Card({
  title,
  icon,
  startF,
  entryDur,
  dropStartF,
  pulseFrames,
}: {
  title: string;
  icon: string;
  startF: number;            // frame at which this card begins sliding in
  entryDur: number;          // entrance (slide-down) duration in frames
  dropStartF: number | null; // frame at which this card falls out (successor's cue), or null
  pulseFrames: number[];     // re-mention pulse frames for this card
}) {
  const frame = useCurrentFrame();

  // Hidden until this card's reveal step fires.
  if (frame < startF) return null;
  // Once it has fully fallen out of frame, stop rendering it.
  if (dropStartF !== null && frame >= dropStartF + f(DROP_DURATION)) return null;

  const local = frame - startF;

  // Default to "settled at centre"; entry slide overrides early, drop overrides late.
  let translateY = 0;

  if (local < entryDur) {
    translateY = interpolate(local, [0, entryDur], [ENTRY_TRAVEL, 0], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: entryEase,
    });
  }

  if (dropStartF !== null && frame >= dropStartF) {
    translateY = interpolate(frame, [dropStartF, dropStartF + f(DROP_DURATION)], [0, DROP_TRAVEL], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: dropEase,
    });
  }

  // Re-mention pulse: a brief scale bump around the card's own centre, composed
  // INTO the same transform as the slide/fall translate so it never replaces the
  // entrance/exit motion (pulseScale returns 1 outside pulse windows).
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateY(${translateY}px) scale(${pulse})`,
        transformOrigin: `${CARD_CX}px ${(CARD_TOP + CARD_BOTTOM) / 2}px`,
        willChange: 'transform',
        pointerEvents: 'none',
      }}
    >
      {/* Card asset (header gradient + Oxford Blue body) */}
      <Img
        src={CARD_HEADER_SRC}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* Header: bookmark icon */}
      <div
        style={{
          position: 'absolute',
          left: BOOKMARK_LEFT,
          top:  BOOKMARK_TOP,
          width:  BOOKMARK_SIZE,
          height: BOOKMARK_SIZE,
        }}
      >
        <BookmarkIcon size={BOOKMARK_SIZE} />
      </div>

      {/* Header: title */}
      <div
        style={{
          position: 'absolute',
          left: TITLE_LEFT,
          top:  HEADER_CY,
          transform: 'translateY(-50%)',
          color: '#FFFFFF',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 55,
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
          // Stay inside the header box, clip rather than spill onto the platinum bg.
          maxWidth: TITLE_MAX_WIDTH,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </div>

      {/* Body: large central icon, SVGs carry their own white+Dodger Blue colors */}
      <div
        style={{
          position: 'absolute',
          left: CARD_CX - BODY_ICON_SIZE / 2,
          top:  BODY_CY - BODY_ICON_SIZE / 2,
          width:  BODY_ICON_SIZE,
          height: BODY_ICON_SIZE,
        }}
      >
        <Img
          src={staticFile(`icons/${icon}.svg`)}
          alt=""
          style={{
            width:  BODY_ICON_SIZE,
            height: BODY_ICON_SIZE,
          }}
        />
      </div>
    </div>
 );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const Cards5Falling: React.FC<Cards5FallingProps> = ({ cards, timings }) => {
  const [handle] = useState(() => delayRender('Loading Cards5Falling fonts'));
  useEffect(() => {
    loadBrandFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent.
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
 );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 0.9);

  // Re-mention pulse frames per card (from timings.pulses), keyed by card index.
  const pulseFramesFor = (i: number) =>
    (timings?.pulses ?? []).filter((p) => p.target === `card${i}`).map((p) => f(p.at));

  // Render last → first so the earliest-indexed scheduled card is the LAST DOM
  // child and naturally sits on top of the others during overlaps (matching the
  // "stack of cards" semantics, later cards wait underneath until needed).
  const renderOrder = Array.from({ length: cards.length }, (_, i) => i).reverse();

  return (
    <AbsoluteFill style={{ background: '#E6ECF2', overflow: 'hidden' }}>
      {renderOrder.map((i) => {
        const c = cue(`card${i}`);
        if (!c) return null;

        // EXIT derivation: this card falls out when the NEXT scheduled card
        // fires. Find the nearest later-indexed card that has its own step.
        let dropStartF: number | null = null;
        for (let j = i + 1; j < cards.length; j++) {
          const next = cue(`card${j}`);
          if (next) {
            dropStartF = f(next.at);
            break;
          }
        }

        return (
          <Card
            key={i}
            title={cards[i]!.title}
            icon={cards[i]!.icon}
            startF={f(c.at)}
            entryDur={f(durOf(c))}
            dropStartF={dropStartF}
            pulseFrames={pulseFramesFor(i)}
          />
       );
      })}
    </AbsoluteFill>
 );
};
