# todo

## v1.0

- check mobile 🤬

mobile layout in production issue

- development app appears correctly on mobile and desktop
- production app build appears correctly on desktop
- production app flickers continuously on mobile, seemingly alternating small and large (overflowing screen) elements

i've already tried the following without resolving the issue:

- removing 90vh in +page.svelte styles
- removing aspect-ratio in +page.svelte styles
- changing font display type (block/swap)
- replacing --emoji-large: clamp(2.8rem, 8vmin, 6rem); etc. with --emoji-large: 1rem etc.
- adding
  @media (max-width: 768px) {

  - {
    -webkit-transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    -webkit-perspective: 1000;
    }

  body {
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  }
  }

@media (max-width: 768px) and (hover: none) {

- {
  animation: none !important;
  transition: none !important;
  }
  }
  to app.css

nb: here's a clue. when i added max-height and max-width to +page.svelte, the app border _and the delete sequences button conformed_, but the other content continued to jump in size and flicker.

reproducible:
chrome, safari and brave iphone se

- todos and console.logs

- videos: d&b, usual test house w/ scream

## 1.1

- color/sequences persist between sessions

- font subsetting? https://fontfaceobserver.com/?

- undo sequence deletion

- adjust sample volumes

- keyboard control

  - space to start/stop transport
  - asdf, jkl; to play samples

- visualiser
  - add toggles between waveform and fft?
  - threlte?
