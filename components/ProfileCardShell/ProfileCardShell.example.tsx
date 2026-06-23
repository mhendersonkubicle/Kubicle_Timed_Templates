import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useFonts, COLORS, FONT_HEAD, FONT_BODY } from '../_lib/kit';
import { ProfileCardShell } from './ProfileCardShell';

// Catalog example: three card size variants (single, duo, team) fully revealed,
// each showing the squash-and-stretch entrance. The cards are laid out on the
// canvas background (#EDEFF3, matching CharacterProfileCard's CANVAS_BG) so
// the white card + shadow reads exactly as it would in a composed template.
//
// The single card is centred and shows a minimal portrait placeholder + role row,
// mimicking the real CharacterProfileCard interior so the catalog entry is
// immediately recognisable. Duo and team cards are rendered at reduced scale
// (transform only, geometry stays canonical) so they fit the 1920x1080 frame.
//
// Icon ids reuse the same ids from CharacterProfileCard's own example so they
// resolve to real assets in the icon library.
export const ProfileCardShellExample: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const r = { startFrame: 0, inFrames: 12 };

  // Accent colours: one per variant to show the prop is forwarded cleanly.
  const accentBlue  = COLORS.blue;
  const accentPink  = '#F865B0';
  const accentTeal  = '#33CCCC';

  return (
    <AbsoluteFill
      style={{
        background: '#EDEFF3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
      }}
    >
      {/* single variant, 640x1000 r=40, centred on the canvas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
        {/* Blue accent single card */}
        <ProfileCardShell frame={frame} reveal={r} variant="single" accentColor={accentBlue}>
          {/* Accent portrait backing strip */}
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 30,
              width: 580,
              height: 620,
              borderRadius: 28,
              background: accentBlue,
              opacity: 0.18,
            }}
          />
          {/* Role row */}
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 682,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: FONT_HEAD,
                fontWeight: 800,
                fontSize: 38,
                color: '#0A0F18',
                letterSpacing: '-0.02em',
              }}
            >
              Product Strategist
            </span>
          </div>
          {/* Bio */}
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 752,
              width: 580,
              fontFamily: FONT_BODY,
              fontWeight: 500,
              fontSize: 22,
              color: '#6B7280',
              lineHeight: 1.35,
            }}
          >
            Helping early-stage teams ship faster and with confidence.
          </div>
          {/* Accent label chip */}
          <div
            style={{
              position: 'absolute',
              left: 30,
              bottom: 30,
              height: 48,
              padding: '0 24px',
              borderRadius: 24,
              background: accentBlue,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 700,
                fontSize: 20,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
              }}
            >
              single · 640 × 1000 · r40
            </span>
          </div>
        </ProfileCardShell>

        {/* Pink accent single card */}
        <ProfileCardShell
          frame={frame}
          reveal={{ startFrame: 4, inFrames: 12 }}
          variant="single"
          accentColor={accentPink}
        >
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 30,
              width: 580,
              height: 620,
              borderRadius: 28,
              background: accentPink,
              opacity: 0.18,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 682,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: FONT_HEAD,
                fontWeight: 800,
                fontSize: 38,
                color: '#0A0F18',
                letterSpacing: '-0.02em',
              }}
            >
              Data Analyst
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 30,
              top: 752,
              width: 580,
              fontFamily: FONT_BODY,
              fontWeight: 500,
              fontSize: 22,
              color: '#6B7280',
              lineHeight: 1.35,
            }}
          >
            Turning raw data into actionable strategy.
          </div>
          <div
            style={{
              position: 'absolute',
              left: 30,
              bottom: 30,
              height: 48,
              padding: '0 24px',
              borderRadius: 24,
              background: accentPink,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: FONT_BODY,
                fontWeight: 700,
                fontSize: 20,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
              }}
            >
              single · pink accent
            </span>
          </div>
        </ProfileCardShell>
      </div>

      {/* duo variant, 580x920 r=36, shown at 50% scale to fit */}
      <div style={{ transform: 'scale(0.38)', transformOrigin: 'center top' }}>
        <ProfileCardShell
          frame={frame}
          reveal={{ startFrame: 8, inFrames: 12 }}
          variant="duo"
          accentColor={accentTeal}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: FONT_HEAD,
                fontWeight: 800,
                fontSize: 64,
                color: '#0A0F18',
                opacity: 0.18,
              }}
            >
              duo · 580 × 920 · r36
            </span>
          </div>
        </ProfileCardShell>
      </div>
    </AbsoluteFill>
  );
};
