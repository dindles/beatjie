# Tonal device: a depth system for beatjie

Design notes for a future pass. A first attempt was made and reverted on the `design`
branch on 2026-09-02 (commits `fbafda1` intro redesign and `bb3d418` ui hierarchy are still
in history for reference). It tried a stroke-weight scale (case / pad / hairline), bar
grouping in the sequencer, hairline pads for the per-sample row, a bordered display with a
resting trace, and a launch-screen intro with a single start button. This document
describes the fuller direction: giving the panel real surfaces so it reads as a handheld
instrument rather than a wireframe, without losing the line-art emoji identity or the
single-hue palette.

## Why it is hard today

`src/app.css` paints every element:

```css
* {
  color: var(--user-colour);
  background-color: var(--black-or-white);
}
```

That guarantees the two-colour look, but it also means there is nowhere for a surface to
come from: every box is the same fill as the page. Step one of any depth work is to unwind
that rule so only the page and the case carry a background and components opt in.

## Tokens

Derive a small tonal scale from the two existing colours with `color-mix()` so the theme
toggle, hue presets and disco mode keep working unchanged. Supported in Chrome 111, Safari
16.2 and Firefox 113.

```css
:root {
  --ink: var(--user-colour);
  --paper: var(--black-or-white);

  --surface-0: color-mix(in oklch, var(--paper) 97%, var(--ink)); /* recessed: the screen */
  --surface-1: color-mix(in oklch, var(--paper) 93%, var(--ink)); /* the case */
  --surface-2: color-mix(in oklch, var(--paper) 88%, var(--ink)); /* pads */
  --line: color-mix(in oklch, var(--ink) 40%, var(--paper)); /* hairlines */
  --glow: color-mix(in oklch, var(--ink) 55%, transparent);
}
```

Then:

- `body` gets `--paper`; `.app` gets `--surface-1`.
- `.border` stops setting `background-color`; pads set `--surface-2` themselves.
- `.active` / `.playing` inversion stays exactly as it is (ink fill, paper text). It is the
  strongest cue in the system and should remain the only full inversion.

Keep `--line` at or above 3:1 against the surface it sits on (WCAG 1.4.11 for component
boundaries). At 40% ink on paper that holds for every preset in both themes; check with
`pnpm contrast` after changing the mix.

## Theme attribute

Glow reads well on a dark ground and looks dirty on a light one, where a drop shadow is the
equivalent cue. Add `data-theme="light|dark"` to `<html>` from `applyColorSettingsToDOM()`
and `changeTheme()` in `app-settings.svelte`, and from the inline script in `app.html`, so
CSS can branch:

```css
:root[data-theme='light'] {
  --lift: 0 0 14px var(--glow); /* colour-on-black: neon */
}
:root[data-theme='dark'] {
  --lift: 0 2px 6px rgb(0 0 0 / 0.18); /* colour-on-white: shadow */
}
```

(The app's naming is inverted from the usual: "light" is colour on black.)

## Per-component treatment

**Ground.** Under the whole unit, a soft radial gradient on `body` and a large low-opacity
shadow on `.app`, so the device sits on something. This alone does most of the work.

**Case.** `.app` on `--surface-1`, the 4px stroke kept, plus `inset 0 1px 0` of `--line` for a
top bevel. Corner radius can grow to 22px once there is a surface to round.

**Pads (samples, main effects, play).** `--surface-2` fill, current stroke, and an inset
bottom edge that compresses on press:

```css
.pad {
  box-shadow: inset 0 -3px 0 var(--line);
  transition:
    translate 60ms ease,
    box-shadow 60ms ease;
}
.pad:active,
.pad.playing {
  translate: 0 2px;
  box-shadow: inset 0 -1px 0 var(--line);
}
```

The `press` action fires on `pointerdown`, so the visual press and the sound line up. Wrap
the transition in `@media (prefers-reduced-motion: no-preference)`.

**Screen.** `.display` on `--surface-0` with an inset shadow (`inset 0 2px 8px rgb(0 0 0 /
0.35)` on dark ground, lighter on light). The waveform gets `ctx.shadowBlur = 8` and
`ctx.shadowColor = --glow` in `draw()`; the resting trace stays thin and unlit. Feedback
text sits inside the screen as now, with `text-shadow: var(--lift)` on dark ground.

**Steps.** Hairline `--line` boxes on `--surface-0` (they belong to the screen, not the
case). The playhead keeps its inversion and gains `box-shadow: var(--lift)`.

**Toolbar.** Unbordered as now, but on `--surface-1` so the icons sit on the case, not the
page.

## Palette

The presets in `colour.ts` are out of sRGB gamut for most hues, so what renders is the
clipped colour, not the oklch value. `pnpm contrast` prints the numbers; today:

| hue | on black (L 0.9) | on white (L 0.45) |
| --- | ---------------- | ----------------- |
| 30  | #ffc898 clipped  | #b50000 clipped   |
| 90  | #ffe53b clipped  | #864400 clipped   |
| 140 | #9dff89 clipped  | #007100 clipped   |
| 200 | #00ffff clipped  | #008488 clipped   |
| 280 | #c7ffff clipped  | #4b70d2 in gamut  |
| 330 | #ffe4ff clipped  | #944190 in gamut  |

Colour-on-white is the weak one: hue 90 becomes a brown, 140 a flat green, and hue 200 sits
at 4.45:1, just under the 4.5:1 text threshold. Two options:

1. **Gamut-aware chroma.** Replace `calculateChroma(lightness)` with a per-hue lookup of the
   largest in-gamut chroma at that lightness (six values per theme, hand-tuned once). Keeps
   the single-hue model.
2. **Ink + accent.** On white, use a near-black ink (`oklch(0.25 0.03 hue)`) for text and
   strokes and reserve the hue for fills and the glow. Bigger change, better result.

Either way every preset must stay at 4.5:1 for text and 3:1 for strokes; the script is the
gate.

## Deferred accessibility enhancements

Not failures, but worth doing alongside this work:

- Arrow-key navigation with a roving tabindex for the 16-step and 8-sample grids (ARIA
  toolbar/grid pattern), so a keyboard user tabs once into a grid instead of 16 times
  through it.
- Native `<dialog>` with `showModal()` for the help and demo overlays, replacing the
  `inert` bookkeeping in `dialogAction.ts`.
- `<input type="range">` for BPM instead of `role="slider"` on a button.

## Order of work

1. Unwind the `*` background rule; introduce the tokens; nothing should look different yet.
2. Ground and case.
3. Screen and steps.
4. Pads and press.
5. Palette pass with `pnpm contrast`.
6. Screenshots at 1280×800, 390×844, 1024×560 and 640×400 in both themes, and a keyboard
   pass with the help dialog open.
