import React from 'react';
import { Checklist5Pills } from '../../Checklist5Pills';

// EXAMPLE SCENE, a 4-item responsibilities checklist on the reveal-sequence
// model.
//
// A checklist is read top-to-bottom, so reveal order = list order. Schedule the
// `setup` step (the hero icon fades in), then one `item{i}` per responsibility
// in list order. Each item{i} reveals one pill as a single object, pill
// fade-up -> circle slide -> tick -> text all cascade inside its `in` window
// (default 1.7 s). Sync each item{i}.at to the narration cue that ticks off
// that item.
//
// The hero icon resolves from the shared Icons/ library (native colours).
// No MP4 is rendered, this is a timing/layout reference only.
export const ProjectLeadChecklistExample: React.FC = () => (
  <Checklist5Pills
    responsibilities={[
      'Define project scope',
      'Lead daily stand-ups',
      'Review every pull request',
      'Share progress weekly',
    ]}
    hero={{ kind: 'icon', id: 'strategic-consulting-target-light' }}
    timings={{
      sequence: [
        { target: 'setup', at: 0.2, in: 1.0 },
        { target: 'item0', at: 1.4 },
        { target: 'item1', at: 3.3 },
        { target: 'item2', at: 5.2 },
        { target: 'item3', at: 7.1 },
      ],
    }}
  />
);
