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

// GroupChat, full-bleed desktop chat window in our oxford-blue palette,
// rebuilt on the STANDARD reveal-sequence timing model.
//   • Oxford-blue panel chat window floats on a platinum (#E6ECF2) base.
//   • Chat window fills most of the canvas: header strip (group name +
//     member count + member avatars), message feed in the middle, faux
//     "Message" input bar at the bottom.
//   • All "them" messages align LEFT (group-chat / observer view); fromMe
//     messages right-align in a dodger-blue bubble. Bubbles share one style;
//     author names get per-author colour tints from a curated palette so
//     multiple voices read as distinct without going garish.
//   • Avatars are auto-generated coloured circles with initials.
//   • Per-message rhythm: typing pulse (3 staggered dots) → bubble fades and
//     slides up. Once the feed fills, older messages scroll up so the latest
//     stays in view; the scroll for message i+1 is driven by THAT message's
//     reveal cue.
//
// TIMING MODEL: timing is a separate, ordered list of reveal steps. An
// element appears ONLY if a step targets it; the default (empty sequence) is
// a blank platinum canvas (nothing staged). All times are scene-relative
// SECONDS. See GUIDANCE.md and templates/README.md.

// ─── Schema ──────────────────────────────────────────────────────────────────

export const groupChatMessageSchema = z.object({
  author:   z.string().min(1).max(22),
  text:     z.string().min(1).max(110),
  // True → message is "from you", right-aligned in a dodger-blue bubble,
  // no avatar/name, no typing pulse (like sending in WhatsApp).
  fromMe:   z.boolean().optional(),
  // If true, a typing pulse plays before the bubble lands. Defaults to true on
  // every left-aligned message except the first. Ignored when fromMe is true.
  showTyping: z.boolean().optional(),
});

// ─── Reveal-sequence timing (STANDARD MODEL) ─────────────────────────────────
// Timing is a separate, ordered list of reveal steps. An element appears ONLY
// if a step targets it; the default (empty sequence) is a blank canvas (just
// the platinum stage). All times are scene-relative SECONDS.
//
// Addressable targets:
//   setup               the chat frame/scaffold (window panel + header +
//                        footer) bounces up from below as one scaffolding unit.
//   message0..messageN-1 one chat message revealed as a single object: its
//                        avatar + author name + (optional) typing pulse → the
//                        bubble fades and slides up. N is messages.length
//                        (3-8). A message{i} with i >= N is ignored. Each new
//                        message{i} (i > 0) also scrolls the feed up by one row
//                        so the latest message stays in view.
export const revealStepSchema = z.object({
  target: z.string().regex(/^(setup|message[0-9]+)$/),
  at: z.number().nonnegative(),          // when it starts appearing
  in: z.number().positive().default(1.0), // entrance duration (typing → bubble)
});
export type RevealStep = z.infer<typeof revealStepSchema>;

// Re-mention pulse: when an already-revealed message is REFERRED TO AGAIN later
// in the narration (>~2-3s after its reveal), it gives a brief, subtle brand
// pulse at the exact re-mention timestamp. `at` is the scene-relative second of
// the re-mention (taken from the SRT). target is a content message (message{i});
// setup is not pulsable. See README "re-mention pulse" principle.
export const pulseStepSchema = z.object({
  target: z.string().regex(/^message[0-9]+$/),
  at: z.number().nonnegative(),
});
export type PulseStep = z.infer<typeof pulseStepSchema>;

export const groupChatTimingSchema = z.object({
  // Ordered reveal sequence. Default empty -> nothing on screen.
  sequence: z.array(revealStepSchema).default([]),
  // Optional re-mention pulses (brief brand pulse on re-mention).
  pulses: z.array(pulseStepSchema).default([]),
});

export const groupChatSchema = z.object({
  groupName:   z.string().min(1).max(36),
  memberCount: z.number().int().positive(),
  messages:    z.array(groupChatMessageSchema).min(3).max(8),
  timings:     groupChatTimingSchema.optional(),
});

export type GroupChatProps = z.infer<typeof groupChatSchema>;

export const groupChatMeta = {
  description:
    'Full-bleed desktop group-chat window styled like WhatsApp adapted to ' +
    'the oxford-blue palette. Use to dramatise multi-character discussion: ' +
    'manager + employees, panel discussion, support thread, etc.',
  authoringNotes:
    'Supply 3-8 messages in conversation order. Each message: author (<=22 ' +
    'chars), text (<=110 chars; long messages wrap to 2 lines). Set ' +
    'fromMe: true on messages sent by the viewer / protagonist, they ' +
    'right-align in a dodger-blue bubble with no avatar or name. Mix fromMe ' +
    'and not for the classic two-sided WhatsApp look. Avatars on the left are ' +
    'auto-generated coloured circles with initials, one tint per author ' +
    'assigned in first-appearance order. showTyping defaults true for every ' +
    'left message except the first; set false to skip the pulse. fromMe ' +
    'messages never show a typing pulse (you do not see your own typing). ' +
    'groupName <=36 chars. The message feed auto-scrolls so the latest line ' +
    'stays in view, so any count from 3 to 8 reads cleanly. ' +
    'TIMING (reveal-sequence model): nothing shows by default, schedule a ' +
    '`setup` step (the chat frame bounces up) then one `message{i}` per ' +
    'message in conversation order. Each message{i} reveals that message as ' +
    'one object (avatar/name + optional typing pulse -> bubble) and scrolls ' +
    'the feed up by a row. Sync each message{i}.at to the narration cue that ' +
    'introduces that line; the conversation is inherently LINEAR so reveal ' +
    'order = message order. Re-mention pulses (timings.pulses) give a revealed ' +
    'message a brief brand pulse when it is referred to again. See GUIDANCE.md ' +
    'for full selection and narration rules.',
} as const;

// ─── Assets ──────────────────────────────────────────────────────────────────

const SATOSHI_BOLD_SRC   = staticFile('fonts/Satoshi-Bold.woff2');
const SATOSHI_MEDIUM_SRC = staticFile('fonts/Satoshi-Medium.woff2');

// ─── Layout constants (px on a 1920×1080 canvas) ─────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Chat window
const WIN_LEFT   = 60;
const WIN_TOP    = 50;
const WIN_RIGHT  = CANVAS_W - 60;     // 1860
const WIN_BOT    = CANVAS_H - 50;     // 1030
const WIN_W      = WIN_RIGHT - WIN_LEFT;
const WIN_H      = WIN_BOT - WIN_TOP;
const WIN_RADIUS = 28;

// Header (top strip of the window)
const HEADER_H   = 110;
const HEADER_BOT = WIN_TOP + HEADER_H;

// Footer (faux input bar)
const FOOTER_H    = 90;
const FOOTER_TOP  = WIN_BOT - FOOTER_H;

// Message feed (positions are relative to the feed-clip div, which sits at
// canvas y = HEADER_BOT and is FOOTER_TOP − HEADER_BOT tall).
const FEED_PAD_BOT = 20;
const MSG_LEFT  = WIN_LEFT + 50;       // 110 (in canvas coords; only used for X)

// Each row has a fixed slot height so scroll math stays simple.
const ROW_H     = 132;
const ROW_GAP   = 22;
const ROW_SLOT  = ROW_H + ROW_GAP;     // 154

// Avatar
const AVATAR_SIZE  = 64;
const AVATAR_RIGHT_PAD = 20;

// Bubble
const BUBBLE_LEFT       = MSG_LEFT + AVATAR_SIZE + AVATAR_RIGHT_PAD;   // 194
const BUBBLE_MAX_W      = 760;
const BUBBLE_PAD_X      = 26;
const BUBBLE_PAD_Y      = 16;
const BUBBLE_RADIUS     = 22;
const NAME_HEIGHT       = 28;
const NAME_TO_BUBBLE_GAP = 8;

// Typing pulse bubble dimensions
const TYPING_W = 96;
const TYPING_H = 50;

// ─── Animation timings ───────────────────────────────────────────────────────

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

// Internal sub-stagger proportions, expressed as fractions of a message step's
// `in` window so the per-message rhythm survives the collapse to one {at, in}:
//   • typing pulse occupies the first ~55% of the window (left messages only),
//   • the bubble bounces in over the last ~45%.
// The feed scroll (push earlier rows up by one) runs over the FIRST part of the
// window so room is made before the new bubble lands.
const TYPING_FRAC = 0.55;   // typing window as a fraction of `in`
const SCROLL_FRAC = 0.40;   // scroll window as a fraction of the NEXT step's `in`

const easeOutCubic   = Easing.out(Easing.cubic);
const easeInOutCubic = Easing.inOut(Easing.cubic);
// Bouncy-but-controlled overshoot for bubble pop-ins.
const easeOutBackBouncy = Easing.out(Easing.back(1.6));
// Subtle back-overshoot for the chat frame settling up from below.
const easeOutBackSettle = Easing.out(Easing.back(1.15));

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

// ─── Visual style fragments ──────────────────────────────────────────────────

// Platinum-blue base, the chat window floats on top with its own dark
// oxford-blue panel so it reads as a high-contrast "card" against the light bg.
const BG_COLOR = '#E6ECF2';

// Chat window panel (sits on top of the bg gradient)
const WIN_BG =
  'linear-gradient(180deg, #0e2741 0%, #08172a 100%)';
const WIN_BORDER  = '1px solid rgba(255,255,255,0.08)';
const WIN_SHADOW  = '0 24px 60px rgba(0,0,0,0.45)';

// Header has a slightly darker tone
const HEADER_BG = 'linear-gradient(180deg, #0b2138 0%, #07172a 100%)';

// Footer input bar
const FOOTER_BG = 'linear-gradient(180deg, #07172a 0%, #050f1c 100%)';
const INPUT_BG  = 'rgba(255,255,255,0.06)';

// Left-aligned bubbles, neutral mid-blue tint, used by every speaker
// except the "me" voice.
const BUBBLE_BG =
  'linear-gradient(180deg, #1c3c5c 0%, #122c46 100%)';
const BUBBLE_BORDER = '1px solid rgba(255,255,255,0.06)';

// "Me" bubble, dodger-blue gradient, matches our caption-pill palette,
// right-aligned to mirror real WhatsApp.
const ME_BUBBLE_BG =
  'linear-gradient(180deg, #1A9CFE 0%, #0686EE 100%)';
const ME_BUBBLE_BORDER = '1px solid rgba(255,255,255,0.10)';

// Author-name tint palette (deterministic by first appearance)
const AUTHOR_TINTS = [
  '#0794FD', // dodger blue
  '#4DD0B6', // mint
  '#FBBF24', // amber
  '#FF9A8B', // salmon
  '#A78BFA', // lavender
] as const;

// Build a per-author tint by FIRST-APPEARANCE ORDER. Guarantees unique colours
// for up to AUTHOR_TINTS.length distinct authors.
function buildAuthorTints(messages: GroupChatProps['messages']): Map<string, string> {
  const map = new Map<string, string>();
  let i = 0;
  for (const m of messages) {
    if (!map.has(m.author)) {
      map.set(m.author, AUTHOR_TINTS[i % AUTHOR_TINTS.length]!);
      i++;
    }
  }
  return map;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '?';
  const last  = parts.length > 1 ? parts[parts.length - 1]![0] : '';
  return (first + last).toUpperCase();
}

const TEXT_WHITE       = '#FFFFFF';
const TEXT_DIM         = 'rgba(255,255,255,0.55)';
const TEXT_VERYDIM     = 'rgba(255,255,255,0.32)';

// ─── Font loading ────────────────────────────────────────────────────────────

let fontsPromise: Promise<void> | null = null;

function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  fontsPromise = (async () => {
    const bold   = new FontFace('Satoshi', `url(${SATOSHI_BOLD_SRC}) format('woff2')`,  { weight: '700', display: 'block' });
    const medium = new FontFace('Satoshi', `url(${SATOSHI_MEDIUM_SRC}) format('woff2')`, { weight: '500', display: 'block' });
    const [b, m] = await Promise.all([bold.load(), medium.load()]);
    const fonts = document.fonts as FontFaceSet & { add(fc: FontFace): void };
    fonts.add(b);
    fonts.add(m);
  })();
  return fontsPromise;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ author, size, tint }: { author: string; size: number; tint: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: tint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.20), inset 0 1px 2px rgba(255,255,255,0.25)',
      }}
    >
      <span
        style={{
          color: TEXT_WHITE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: size * 0.40,
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        {initialsOf(author)}
      </span>
    </div>
  );
}

function TypingDots({ frame, startF }: { frame: number; startF: number }) {
  const local = frame - startF;
  // 30-frame breathing cycle with a 5-frame per-dot stagger.
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
      {[0, 1, 2].map(i => {
        const phase = ((local - i * 5) % 30 + 30) % 30;
        const op = phase < 15
          ? 0.30 + 0.70 * (phase / 15)
          : 0.30 + 0.70 * (1 - (phase - 15) / 15);
        return (
          <div
            key={i}
            style={{
              width: 11, height: 11, borderRadius: '50%',
              background: '#FFFFFF',
              opacity: op,
            }}
          />
        );
      })}
    </div>
  );
}

function Header({ groupName, memberCount, messages, tints, opacity }: {
  groupName: string;
  memberCount: number;
  messages: GroupChatProps['messages'];
  tints: Map<string, string>;
  opacity: number;
}) {
  // Show up to 4 distinct member avatars in the header (right side).
  const seen = new Set<string>();
  const headerAvatars = messages
    .filter(m => { if (seen.has(m.author)) return false; seen.add(m.author); return true; })
    .slice(0, 4);

  return (
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
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 36px',
        opacity,
      }}
    >
      {/* Group icon, circular cluster background */}
      <div
        style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(180deg, #0794FD 0%, #0075D8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: TEXT_WHITE,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 700, fontSize: 28,
          marginRight: 20,
          boxShadow: 'inset 0 -3px 6px rgba(0,72,140,0.25)',
        }}
      >
        #
      </div>

      {/* Group info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            color: TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: '-0.01em',
          }}
        >
          {groupName}
        </div>
        <div
          style={{
            color: TEXT_DIM,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 19,
          }}
        >
          {memberCount} members
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Stacked member avatars on the right */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {headerAvatars.map((m, i) => (
          <div
            key={m.author}
            style={{
              marginLeft: i === 0 ? 0 : -16,
              border: '2px solid #0b2138',
              borderRadius: '50%',
              width: 48, height: 48,
            }}
          >
            <Avatar author={m.author} size={44} tint={tints.get(m.author) ?? AUTHOR_TINTS[0]!} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({ opacity }: { opacity: number }) {
  return (
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
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 36px',
        gap: 16,
        opacity,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 54,
          background: INPUT_BG,
          borderRadius: 27,
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          color: TEXT_VERYDIM,
          fontFamily: "'Satoshi', system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 22,
        }}
      >
        Message
      </div>
      {/* Send button (paper-plane-ish triangle) */}
      <div
        style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'linear-gradient(180deg, #0794FD 0%, #0075D8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'inset 0 -3px 6px rgba(0,72,140,0.30)',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12 L21 4 L14 21 L12 13 Z"/>
        </svg>
      </div>
    </div>
  );
}

function MessageRow({
  message, rowY, tint, frame, typingStartF, bubbleStartF, bubbleDurF, showTyping, pulseFrames, centerX,
}: {
  message: GroupChatProps['messages'][number];
  rowY: number;                  // clip-relative y for top of row
  tint: string;
  frame: number;
  typingStartF: number;
  bubbleStartF: number;
  bubbleDurF: number;
  showTyping: boolean;
  pulseFrames: number[];
  centerX: number;               // canvas x of the message's own centre (pulse origin)
}) {
  const fromMe = message.fromMe ?? false;

  // Avatar + name fade in at the start of the typing window (or bubble start if
  // no typing). Only used for left-aligned ("them") messages.
  const enterStart = showTyping ? typingStartF : bubbleStartF;
  const enterDur   = f(0.30);
  const enterLocal = frame - enterStart;
  const enterOp    = interpolate(enterLocal, [0, enterDur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });

  if (enterLocal < 0) return null;

  // Re-mention pulse: a brief scale bump around the message's centre, only
  // after it has fully landed (so it never collides with the entrance). 1 at
  // rest, so an empty pulse list leaves the reveal transform untouched.
  const pulse = pulseScale(frame, pulseFrames, f(PULSE_DUR_S));

  // Typing pulse visibility (left messages only, you never see your own
  // typing). Fades out as the bubble starts to land.
  const typingOp = showTyping && !fromMe
    ? interpolate(frame, [typingStartF + 3, typingStartF + 8, bubbleStartF, bubbleStartF + 4], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      })
    : 0;

  // Bubble bounce-in: scale 0.80 → 1.0 with a smooth back-overshoot, paired
  // with a short upward slide and a fast opacity fade.
  const bubbleLocal = frame - bubbleStartF;
  const bubbleOp = interpolate(bubbleLocal, [0, bubbleDurF * 0.55], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic,
  });
  const bubbleScale = interpolate(bubbleLocal, [0, bubbleDurF], [0.80, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackBouncy,
  });
  const bubbleDy = interpolate(bubbleLocal, [0, bubbleDurF], [18, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutBackBouncy,
  });

  // Bubble top Y, aligned at the same height as left messages so successive
  // rows read evenly even when alternating left/right.
  const bubbleTopY = rowY + NAME_HEIGHT + NAME_TO_BUBBLE_GAP;
  // For right-aligned ("me") messages we anchor by right edge using `right:`.
  const RIGHT_PAD = 36;

  // Outer pulse wrapper, scaled around the message's own centre so the
  // re-mention bump composes with (never replaces) each child's reveal
  // transform. transformOrigin is the message centre on the canvas; the wrapper
  // spans the whole clip via inset:0.
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `scale(${pulse})`,
        transformOrigin: `${centerX}px ${bubbleTopY + ROW_H / 2}px`,
        pointerEvents: 'none',
      }}
    >
      {/* Avatar, only for left-aligned messages */}
      {!fromMe && (
        <div
          style={{
            position: 'absolute',
            left: MSG_LEFT,
            top:  rowY + (NAME_HEIGHT + NAME_TO_BUBBLE_GAP) - 4,
            opacity: enterOp,
          }}
        >
          <Avatar author={message.author} size={AVATAR_SIZE} tint={tint} />
        </div>
      )}

      {/* Author name, only for left-aligned messages */}
      {!fromMe && (
        <div
          style={{
            position: 'absolute',
            left: BUBBLE_LEFT,
            top:  rowY,
            color: tint,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-0.005em',
            opacity: enterOp,
          }}
        >
          {message.author}
        </div>
      )}

      {/* Typing pulse bubble, left-aligned only */}
      {showTyping && !fromMe && (
        <div
          style={{
            position: 'absolute',
            left: BUBBLE_LEFT,
            top:  bubbleTopY,
            width:  TYPING_W,
            height: TYPING_H,
            borderRadius: BUBBLE_RADIUS,
            background: BUBBLE_BG,
            border: BUBBLE_BORDER,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: typingOp,
          }}
        >
          <TypingDots frame={frame} startF={typingStartF} />
        </div>
      )}

      {/* Message bubble, left or right aligned depending on fromMe */}
      {bubbleOp > 0 && (
        <div
          style={{
            position: 'absolute',
            top:  bubbleTopY,
            ...(fromMe
              ? { right: RIGHT_PAD }
              : { left: BUBBLE_LEFT }),
            maxWidth: BUBBLE_MAX_W,
            padding: `${BUBBLE_PAD_Y}px ${BUBBLE_PAD_X}px`,
            borderRadius: BUBBLE_RADIUS,
            background: fromMe ? ME_BUBBLE_BG : BUBBLE_BG,
            border:     fromMe ? ME_BUBBLE_BORDER : BUBBLE_BORDER,
            color: TEXT_WHITE,
            fontFamily: "'Satoshi', system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.30,
            letterSpacing: '-0.005em',
            opacity: bubbleOp,
            transform: `translateY(${bubbleDy}px) scale(${bubbleScale})`,
            transformOrigin: fromMe ? 'top right' : 'top left',
            // Subtle WhatsApp-style "tail", top-left for them, top-right for me.
            ...(fromMe
              ? { borderTopRightRadius: 8 }
              : { borderTopLeftRadius: 8 }),
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

// ─── Main scene ──────────────────────────────────────────────────────────────

export const GroupChat: React.FC<GroupChatProps> = ({
  groupName,
  memberCount,
  messages,
  timings,
}) => {
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender('Loading GroupChat fonts'));
  useEffect(() => {
    loadFonts()
      .catch(() => { /* font failure is non-fatal */ })
      .finally(() => continueRender(handle));
  }, [handle]);

  // Author colour tints, assigned by first appearance for guaranteed uniqueness.
  const tints = buildAuthorTints(messages);

  // ── Reveal-sequence lookup ──────────────────────────────────────────────
  // An element renders ONLY if the sequence targets it. No step -> absent.
  const byTarget = new Map<string, RevealStep>(
    (timings?.sequence ?? []).map((s) => [s.target, s] as const),
  );
  const cue = (target: string): RevealStep | undefined => byTarget.get(target);
  const durOf = (s: RevealStep) => (s.in ?? 1.0);

  // Re-mention pulse frames per message{i} (from timings.pulses).
  const pulseFramesFor = (i: number): number[] =>
    (timings?.pulses ?? [])
      .filter((p) => p.target === `message${i}`)
      .map((p) => f(p.at));

  // ── setup: the chat frame/scaffold bounces up from below the canvas. ───────
  // The whole window (panel + header + footer + feed) shares one transform so
  // it moves as a single unit. Only rendered when setup is scheduled.
  const cSetup = cue('setup');
  const setupStartF = cSetup ? f(cSetup.at) : 0;
  const setupEndF   = cSetup ? f(cSetup.at + durOf(cSetup)) : 0;
  const containerDy = cSetup
    ? interpolate(frame, [setupStartF, setupEndF], [CANVAS_H, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: easeOutBackSettle,
      })
    : CANVAS_H;

  // ── Per-message key frames, derived straight from each message{i} step. ────
  // A message reveals as one object over its `in` window:
  //   typing pulse (first TYPING_FRAC of the window) -> bubble bounce-in.
  // fromMe messages never show typing (you don't see your own typing).
  type Sched = {
    present:      boolean;   // does the sequence schedule this message?
    revealAtF:    number;    // step.at in frames (also the scroll trigger)
    inF:          number;    // step.in in frames
    typingStartF: number;
    bubbleStartF: number;
    bubbleDurF:   number;
    showTyping:   boolean;
  };
  const scheds: Sched[] = messages.map((m, i) => {
    const c = cue(`message${i}`);
    if (!c) {
      return {
        present: false, revealAtF: 0, inF: 0, typingStartF: 0,
        bubbleStartF: 0, bubbleDurF: 0, showTyping: false,
      };
    }
    const revealAtF = f(c.at);
    const inF       = f(durOf(c));
    const showTyping = m.fromMe ? false : (m.showTyping ?? (i > 0));
    const typingStartF = revealAtF;
    const typingWinF   = Math.round(inF * TYPING_FRAC);
    const bubbleStartF = showTyping ? typingStartF + typingWinF : typingStartF;
    const bubbleDurF   = Math.max(1, inF - (bubbleStartF - revealAtF));
    return { present: true, revealAtF, inF, typingStartF, bubbleStartF, bubbleDurF, showTyping };
  });

  // Clip area dimensions (relative to the clip div that wraps the feed).
  const CLIP_H = FOOTER_TOP - HEADER_BOT;
  const FEED_BOT_IN_CLIP = CLIP_H - FEED_PAD_BOT;
  const BOTTOM_ROW_Y_IN_CLIP = FEED_BOT_IN_CLIP - ROW_H;  // top of the bottom row

  // ── Per-message row Y (clip-relative, anchored at the bottom) ──────────────
  // Each newer scheduled message j > i contributes a smooth +1-row upward
  // shift to message i, driven by message j's OWN reveal cue. The scroll runs
  // over the first SCROLL_FRAC of message j's `in` window so room is made
  // before j's bubble lands.
  function rowYInClipFor(i: number, frame: number): number {
    let shiftRows = 0;
    for (let j = i + 1; j < messages.length; j++) {
      const sj = scheds[j]!;
      if (!sj.present) continue;
      const scrollDurF = Math.max(1, Math.round(sj.inF * SCROLL_FRAC));
      const p = interpolate(frame, [sj.revealAtF, sj.revealAtF + scrollDurF], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOutCubic,
      });
      shiftRows += p;
    }
    return BOTTOM_ROW_Y_IN_CLIP - shiftRows * ROW_SLOT;
  }

  // Centre X for the pulse origin of each message (canvas coords). Left messages
  // pulse around the bubble column; fromMe messages around the right column.
  function centerXFor(fromMe: boolean): number {
    return fromMe
      ? WIN_RIGHT - 36 - BUBBLE_MAX_W / 2
      : BUBBLE_LEFT + BUBBLE_MAX_W / 2;
  }

  return (
    <AbsoluteFill style={{ background: BG_COLOR, overflow: 'hidden' }}>
      {/* setup: the entire chat frame shares one transform so the whole window
          bounces up from below the canvas. Rendered only when setup is
          scheduled (blank platinum stage otherwise). */}
      {cSetup && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translateY(${containerDy}px)`,
          }}
        >
          {/* Chat window panel */}
          <div
            style={{
              position: 'absolute',
              left: WIN_LEFT,
              top:  WIN_TOP,
              width:  WIN_W,
              height: WIN_H,
              borderRadius: WIN_RADIUS,
              background: WIN_BG,
              border: WIN_BORDER,
              boxShadow: WIN_SHADOW,
            }}
          />

          {/* Message feed clipping area */}
          <div
            style={{
              position: 'absolute',
              left: WIN_LEFT,
              top:  HEADER_BOT,
              width:  WIN_W,
              height: FOOTER_TOP - HEADER_BOT,
              overflow: 'hidden',
            }}
          >
            {messages.map((m, i) => {
              const s = scheds[i]!;
              // Render a message ONLY if its reveal step is scheduled and we
              // have reached its reveal frame (reveal-sequence gating).
              if (!s.present || frame < s.revealAtF) return null;
              const rowY = rowYInClipFor(i, frame);
              if (rowY + ROW_H < 0) return null;  // scrolled above the clip
              return (
                <MessageRow
                  key={`msg-${i}`}
                  message={m}
                  rowY={rowY}
                  tint={tints.get(m.author) ?? AUTHOR_TINTS[0]!}
                  frame={frame}
                  typingStartF={s.typingStartF}
                  bubbleStartF={s.bubbleStartF}
                  bubbleDurF={s.bubbleDurF}
                  showTyping={s.showTyping}
                  pulseFrames={pulseFramesFor(i)}
                  centerX={centerXFor(m.fromMe ?? false)}
                />
              );
            })}
          </div>

          {/* Header (above feed) */}
          <Header
            groupName={groupName}
            memberCount={memberCount}
            messages={messages}
            tints={tints}
            opacity={1}
          />

          {/* Footer (input bar) */}
          <Footer opacity={1} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── Demo / test props ───────────────────────────────────────────────────────

export const groupChatDefaultProps: GroupChatProps = {
  groupName:   'AI Discussion',
  memberCount: 5,
  messages: [
    {
      author: 'Robert',
      fromMe: true,
      text:   'Team, GPT-4 costs are getting tough. Should we test a smaller model?',
    },
    {
      author: 'Margaret',
      text:   'Cost savings would help, but what about quality?',
    },
    {
      author: 'Robert',
      fromMe: true,
      text:   'I am thinking a side-by-side eval on real traffic.',
    },
    {
      author: 'Jake',
      text:   'Haiku has been great for our classification tasks.',
    },
    {
      author: 'Kim',
      text:   'Could we route by complexity, small for easy, big for hard?',
    },
    {
      author: 'Chloe',
      text:   'I will set up the eval suite by Friday.',
    },
  ],
  timings: {
    sequence: [
      { target: 'setup',   at: 0.2, in: 1.0 },
      { target: 'message0', at: 1.4 },
      { target: 'message1', at: 3.0 },
      { target: 'message2', at: 4.6 },
      { target: 'message3', at: 6.2 },
      { target: 'message4', at: 7.8 },
      { target: 'message5', at: 9.4 },
    ],
  },
};
