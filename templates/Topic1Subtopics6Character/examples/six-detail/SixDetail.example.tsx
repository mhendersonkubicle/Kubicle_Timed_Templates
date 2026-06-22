import React from 'react';
import { Topic1Subtopics6Character } from '../../Topic1Subtopics6Character';

// EXAMPLE SCENE, one topic broken into six detail subtopics, on the
// reveal-sequence model.
//
// The list is a LINEAR top-to-bottom waterfall, so reveal order = row order.
// `setup` brings in the background AND the character panel/portrait as one
// unit (the character is silent scaffolding, not a narrated beat); `title`
// slides the header pill in; then `row0…row5` reveal one detail pill at a
// time (outline scales in, then the caption types out). Sync each row{i}.at
// to the narration cue that introduces that detail, and give each row enough
// `in` (~1.4 s default) to cover both the scale and the typewriter.
//
// The title icon resolves from the shared Small-Icons set; the portrait from
// the shared characters/ set. No MP4, this is a timing/layout reference.
export const SixDetailExample: React.FC = () => (
  <Topic1Subtopics6Character
    mainTitle="Data Modelling"
    titleIcon="business-strategy-target-dark"
    character={{ id: 'male_middleage_white', characterHeight: 850, characterY: 163 }}
    details={[
      'Define entities and relationships',
      'Choose a normalisation level',
      'Map primary and foreign keys',
      'Validate against business rules',
      'Review with stakeholders',
      'Document the final schema',
    ]}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 0.8 },
        { target: 'title', at: 0.5, in: 0.8 },
        { target: 'row0', at: 1.3 },
        { target: 'row1', at: 2.7 },
        { target: 'row2', at: 4.1 },
        { target: 'row3', at: 5.5 },
        { target: 'row4', at: 6.9 },
        { target: 'row5', at: 8.3 },
      ],
    }}
  />
);
