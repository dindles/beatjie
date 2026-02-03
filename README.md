# Beatjie

A simple sample player and sequencer using Svelte 5 and Tone.js.

**Have fun, make beats!**

[Try it live](https://dindles.net/beatjie)

## Structure

```
src/
├── routes/
│   └── +page.svelte              # Main app entry
├── lib/
│   ├── audio-classes/            # Audio engine & sequencer logic
│   │   ├── audio-engine.svelte.ts
│   │   ├── audio-sequencer.svelte.ts
│   │   ├── main-audio-bus.svelte.ts
│   │   ├── audio-loader.svelte.ts
│   │   └── sample.svelte.ts
│   ├── components/               # UI components
│   │   ├── sequencer.svelte
│   │   ├── samples.svelte
│   │   ├── display.svelte
│   │   └── ...
│   ├── data/                     # Audio packs & config
│   ├── types/                    # TypeScript definitions
│   ├── utils/                    # Pattern sharing, colour storage
│   └── actions/                  # Touch gestures
└── app.css                       # Global styles
```

## Thanks

- Matt DesLauriers ([@mattdesl](https://github.com/mattdesl)) made a page (https://tone-demos.glitch.me/) of elegant, simple, progressive Tone.js demos which were very helpful while I was learning about Tone, especially in relation to implementing effects and the visual analyser.
- Max Fung's [@mxfng](https://github.com/mxfng) drumhaus (https://www.drumha.us/) is a gorgeous, sophisticated implementation of a drum sequencer (_those knobs!_). His code is neat and easy to grasp. I'm particularly indebted to his approach to structuring and processing samples and packs.
- Beatjie's design is inspired by, but obviously can't compare to, [fors' apps](https://fors.fm/), specifically Opal.
- I used Anthropic's Claude 3.5, 4 and 4.5 extensively through the process of making Beatjie and learning more about creative development for the web.
