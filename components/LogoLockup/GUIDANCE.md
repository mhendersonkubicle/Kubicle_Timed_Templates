# LogoLockup

A centred SVG logo box that fits any external vector logo within a fixed bounding box using `preserveAspectRatio="xMidYMid meet"`. Extracted from the `CaseStudyIntro` template's logo panel.

## What it is

A placement-agnostic container that fetches a logo SVG from `logos/<logoId>.svg`, strips its width/height attributes, and renders it scaled-to-fit inside a 760x220px bounding box (matching CaseStudyIntro exactly). A subtle border ring defines the box edge on any surface.

## Build type

**Code-first.** Pure CSS container; no baked PNG artwork. Fully recolourable border ring via the `variant` prop. The inner SVG is the real logo file.

## Source template

`CaseStudyIntro` (see `templates/CaseStudyIntro/CaseStudyIntro.tsx`). Geometry: `LOGO_BOX_W=760`, `LOGO_BOX_H=220`, centred at canvas midpoint (960, 540).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | `{ startFrame, inFrames, pulseFrames? }` |
| `logoId` | `string` | required | Logo id WITHOUT `.svg`, e.g. `"Company-FinSage-light"`. Resolves to `logos/<logoId>.svg`. |
| `variant` | `'default' \| 'light'` | `'default'` | `default` = dark bg (oxford/navy); `light` = light bg (platinum/white). Controls the border ring colour. |
| `width` | `number` | `760` | Bounding box width in px. |
| `height` | `number` | `220` | Bounding box height in px. |

## Variants

- **`default`** : use on dark (oxford/navy) backgrounds. Use a `-light` logo variant (e.g. `Company-FinSage-light`) so the artwork reads on dark.
- **`light`** : use on light (platinum/white) backgrounds. Also use a `-light` logo variant; the border ring shifts to a subtle ink tint.

## Animation

- **Entrance**: opacity 0 to 1 + translateY(24px to 0) using `easeOutCubic` over `reveal.inFrames`.
- **Re-mention pulse**: +5% scale half-sine centred on each frame in `reveal.pulseFrames`. Matches `CaseStudyIntro` exactly.

## Logo source

Logos live in `public/logos/<id>.svg`. Stage them with `script-pipeline/stage-logos.py`. Never use an icon from `public/icons/` here: the lockup is for fictional company or software wordmark logos, not icon art.

## Placement

Place-agnostic. Wrap in `<Place x y>` from `_lib/kit` to position on the 1920x1080 canvas:

```tsx
<Place x={960 - 760 / 2} y={540 - 220 / 2}>
  <LogoLockup frame={frame} reveal={cue('logo')} logoId="Company-FinSage-light" />
</Place>
```
