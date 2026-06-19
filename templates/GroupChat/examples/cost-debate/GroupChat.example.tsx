import React from 'react';
import { GroupChat } from '../../GroupChat';

// EXAMPLE SCENE, six-message team discussion (count variation + pulses).
//
// The schema accepts 3-8 messages. The feed auto-scrolls so the latest line
// stays in view, so any count reads cleanly. Here six messages are scheduled
// in conversation order: setup brings the chat frame up, then message0..5
// reveal one at a time. Two of the messages mark fromMe: true (the protagonist
// "Robert"), so they right-align in dodger-blue bubbles.
//
// A re-mention pulse is included: when the narration circles back to Margaret's
// quality concern at ~10.2 s, message1 gives a brief brand pulse.
//
// No MP4 is rendered (layout reference only).
export const CostDebateExample: React.FC = () => (
  <GroupChat
    groupName="AI Discussion"
    memberCount={5}
    messages={[
      { author: 'Robert',   fromMe: true, text: 'Team, GPT-4 costs are getting tough. Should we test a smaller model?' },
      { author: 'Margaret',               text: 'Cost savings would help, but what about quality?' },
      { author: 'Robert',   fromMe: true, text: 'I am thinking a side-by-side eval on real traffic.' },
      { author: 'Jake',                   text: 'Haiku has been great for our classification tasks.' },
      { author: 'Kim',                    text: 'Could we route by complexity, small for easy, big for hard?' },
      { author: 'Chloe',                  text: 'I will set up the eval suite by Friday.' },
    ]}
    timings={{
      sequence: [
        { target: 'setup',    at: 0.2, in: 1.0 },
        { target: 'message0', at: 1.4 },
        { target: 'message1', at: 3.0 },
        { target: 'message2', at: 4.6 },
        { target: 'message3', at: 6.2 },
        { target: 'message4', at: 7.8 },
        { target: 'message5', at: 9.4 },
      ],
      // Re-mention: the narration returns to Margaret's quality concern.
      pulses: [{ target: 'message1', at: 10.2 }],
    }}
  />
);
