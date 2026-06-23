// DEMO: a template assembled purely from library components, proving the
// composition pattern, the YinYang LEFT side merged with Splitscreen-style icon
// pills on the right, plus a WordTab and an IconBadge. One timings.sequence
// drives every component via makeCue (same model fit-timing.py produces).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { makeCue, COLORS, type Timings } from '../_lib/kit';
import { WordTab } from '../WordTab/WordTab';
import { YinYangSide } from '../YinYangSide/YinYangSide';
import { IconPill } from '../IconPill/IconPill';
import { IconBadge } from '../IconBadge/IconBadge';
import { Place } from '../_lib/kit';

const TIMINGS: Timings = {
  sequence: [
    { target: 'wordTab', at: 0.3, in: 0.5 },
    { target: 'badge', at: 0.8, in: 0.6 },
    { target: 'leftTitle', at: 1.2, in: 0.5 },
    { target: 'leftBox0', at: 1.8, in: 0.5 },
    { target: 'leftBox1', at: 2.4, in: 0.5 },
    { target: 'pill0', at: 3.0, in: 0.5 },
    { target: 'pill1', at: 3.6, in: 0.5 },
    { target: 'pill2', at: 4.2, in: 0.5 },
  ],
  pulses: [],
};

export const ComposedDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = makeCue(TIMINGS);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COLORS.oxford}, ${COLORS.navy})` }}>
      <Place x={120} y={70}>
        <WordTab frame={frame} reveal={cue('wordTab')} text="Manual vs Agent" />
      </Place>

      <Place x={1520} y={60}>
        <IconBadge frame={frame} reveal={cue('badge')} icon="network-system-dark" circleColor="teal" size={240} />
      </Place>

      <Place x={120} y={300}>
        <YinYangSide
          frame={frame}
          side="left"
          title="The manual way"
          titleReveal={cue('leftTitle')}
          boxes={[
            { icon: 'documents-clipboard-dark', text: 'Hand-keyed', reveal: cue('leftBox0') },
            { icon: 'business-strategy-target-dark', text: 'Error-prone', reveal: cue('leftBox1') },
          ]}
        />
      </Place>

      <Place x={1040} y={360}>
        <IconPill frame={frame} reveal={cue('pill0')} text="Reads the record" icon="science-magnifyingglass-dark" color="pink" width={640} />
      </Place>
      <Place x={1040} y={500}>
        <IconPill frame={frame} reveal={cue('pill1')} text="Updates the field" icon="core-values-value-dark" color="pink" width={640} />
      </Place>
      <Place x={1040} y={640}>
        <IconPill frame={frame} reveal={cue('pill2')} text="Triggers the next step" icon="teamwork-collaboration-dark" color="pink" width={640} />
      </Place>
    </AbsoluteFill>
  );
};
