import React from 'react';
import { KubicleAIChat } from '../../KubicleAIChat';

// EXAMPLE SCENE, "lesson script tips" prompt and 3-section answer.
//
// Demonstrates the reveal-sequence model on a chat exchange: the shell slides
// up and the greeting fades in (setup), the user prompt types in and morphs to
// the bubble (prompt), the AI thinks then frames the answer (intro), and three
// numbered sections pop in one at a time (message0..message2). This is the
// linear-transcript shape KubicleAIChat requires, see ../../GUIDANCE.md, Rule 1.
//
// Each step's `at` is the start time of the narration line that introduces it
// (scene-relative seconds; this scene starts at t=0 so SRT times map directly):
//   0.2  "Let's open Kubicle AI."                       -> setup
//   1.8  "How do I write a clear lesson script?"         -> prompt (types + morphs)
//   5.2  "It comes down to three things."                -> intro (pulse + paragraph)
//   6.6  "First, open with the why."                     -> message0
//   8.2  "Then chunk it into a few beats."               -> message1
//   9.8  "And finally, read it aloud before recording."  -> message2
//
// Two re-mention pulses are scheduled: at 12.0 the narration circles back to the
// opening ("that opening sentence really matters"), bumping message0; at 13.2 it
// re-names the prompt itself, bumping the user bubble. With an empty `pulses`
// array the scene renders identically.
//
// Assets: the white Kubicle logo PNG ships in Template-Specific-Assets/. No
// shared-library icons are used. No MP4 is rendered for this example.
export const LessonScriptTipsExample: React.FC = () => (
  <KubicleAIChat
    brand="Kubicle AI"
    greeting="Hey User, what's on your mind?"
    subline="Ask anything about your lesson, deck, or script."
    inputPlaceholder="Ask Kubicle AI"
    userPrompt="How do I write a clear lesson script?"
    response={{
      intro:
        'It comes down to three things: a strong opening, tight structure, ' +
        'and reading it aloud before you record.',
      sections: [
        {
          heading: '1. Open with the why',
          body:
            'Start with a single sentence that tells the learner what they ' +
            'will be able to do after the lesson. This earns their attention.',
        },
        {
          heading: '2. Chunk into a few beats',
          body:
            'Break the body into a small number of clear sections. Each ' +
            'section makes one point and finishes with a quick summary line.',
        },
        {
          heading: '3. Read it aloud',
          body:
            'Speak the script through once. Anywhere you stumble is a ' +
            'sentence that needs rewriting. Plain words beat clever ones.',
        },
      ],
    }}
    timings={{
      sequence: [
        { target: 'setup',    at: 0.2, in: 1.4 },
        { target: 'prompt',   at: 1.8, in: 3.0 },
        { target: 'intro',    at: 5.2, in: 1.2 },
        { target: 'message0', at: 6.6, in: 0.6 },
        { target: 'message1', at: 8.2, in: 0.6 },
        { target: 'message2', at: 9.8, in: 0.6 },
      ],
      pulses: [
        { target: 'message0', at: 12.0 },
        { target: 'prompt',   at: 13.2 },
      ],
    }}
  />
);
