// Example: a case-study logo card. `logo` is a FICTIONAL company id (resolves to
// logos/Company-FinSage-light.svg, staged via stage-logos.py); the name is in the
// artwork. Just the "CASE STUDY" eyebrow + the logo, dead centre. The case-study
// detail goes in the NEXT scene with a points/list template.
import { CaseStudyIntro } from '../../CaseStudyIntro';

export const CaseStudyCard = () => (
  <CaseStudyIntro
    eyebrow="Case Study"
    logo="Company-FinSage-light"
    timings={{
      sequence: [
        { target: 'setup', at: 0.2 },
        { target: 'eyebrow', at: 0.4 },
        { target: 'logo', at: 1.0 },
      ],
      pulses: [],
    }}
  />
);
