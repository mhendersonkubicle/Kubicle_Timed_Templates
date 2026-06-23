# StatPairRow

A horizontal row of exactly two countable-metric stat units, each pairing a
small greyed SVG icon (person / grid / heart) with a bold formatted number.
Extracted from the bottom-row band of `CharacterProfileCard`.

## Build type

**Code-first.** Pure CSS/SVG, no baked PNGs. Recolourable via `valueColor` and
`iconColor` props. Placement-agnostic (wrap in `<Place x y>` from the kit).

## Source template

`CharacterProfileCard` (the `Stat` helper + `BOTTOM_ROW_Y` band).

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `frame` | `number` | required | Current Remotion frame |
| `reveal` | `Reveal` | required | Kit reveal contract |
| `stats` | `[StatUnit, StatUnit]` | required | Exactly two stat items |
| `stagger` | `number` (frames) | `~2` | Extra frame offset on the second stat's entrance |
| `size` | `'single' \| 'duo'` | `'single'` | `'single'` = fontSize 22 (standard card); `'duo'` = fontSize 20 (tighter two-card layout) |
| `valueColor` | `string` | `#0A0F18` | Bold number colour |
| `iconColor` | `string` | `#9CA3AF` | Icon stroke colour |

### StatUnit

```ts
{ icon: 'followers' | 'posts' | 'likes'; value: number }
```

- `followers`: person outline (circle + arc)
- `posts`: 2x2 grid of rounded squares
- `likes`: heart outline

`value` is formatted with thousands commas (`toLocaleString('en-US')`).

## Layout geometry

Lifted verbatim from `CharacterProfileCard`:

- Row height: 56 px
- Left inset of first stat: 30 px (`CARD_PAD`)
- Horizontal pitch between stat columns: 140 px (`STAT_PITCH`)
- Icon/value gap: 8 px (`STAT_GAP`)

## Entrance animation

Each stat slides up 20 px + fades in (`easeOutCubic`), then holds. The second
stat is staggered by `stagger` frames (default ~2) to give a brief cascade
effect. Re-mention pulse via the `pulseFrames` field on the `Reveal`.

## Variants

Two size variants ship:

- `single` (default): fontSize 22, for a standard single-card context
- `duo`: fontSize 20, for tighter two-card layouts

Icon colour and value colour are free props so the row adapts to any surface.

## Example

```tsx
<Place x={640} y={994}>
  <StatPairRow
    frame={frame}
    reveal={cue('stat0')}
    stats={[
      { icon: 'followers', value: 1248 },
      { icon: 'posts',     value: 86 },
    ]}
    size="single"
  />
</Place>
```
