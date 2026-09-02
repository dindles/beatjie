<script lang="ts">
  import BrandHeader from './brand-header.svelte'
  import KeyboardControls from './keyboard-controls-help.svelte'
  import DemoVideo from './demo-video.svelte'

  interface Props {
    handleAudioConfirm: () => void
    handleAudioDeny: () => void
    // samples are loading: the start button becomes a busy indicator in the same footprint
    loading?: boolean
  }

  let {
    handleAudioConfirm: handle_audio_confirm,
    handleAudioDeny: handle_audio_deny,
    loading = false
  }: Props = $props()

  let show_kbd_controls = $state(false)
  let show_video = $state(false)
</script>

{#if show_kbd_controls}
  <KeyboardControls onclose={() => (show_kbd_controls = false)} />
{:else if show_video}
  <DemoVideo onclose={() => (show_video = false)} />
{:else}
  <div class="intro-screen">
    <BrandHeader tagline="have fun, make beats" />

    <div class="consent">
      <button
        class="start border border-case text-small"
        aria-describedby="audio-note"
        aria-disabled={loading}
        aria-busy={loading}
        onclick={() => {
          if (!loading) handle_audio_confirm()
        }}
      >
        {#if loading}
          loading…
        {:else}
          <span class="play-icon" aria-hidden="true">▶</span> start
        {/if}
      </button>
      <p id="audio-note" class="audio-note" role="status">
        {#if loading}
          loading samples
        {:else}
          this page makes noise.
          <button class="link" onclick={handle_audio_deny}>no thanks</button>
        {/if}
      </p>
    </div>

    <div class="secondary">
      <button class="ghost" onclick={() => (show_kbd_controls = true)}>
        <span class="icon" aria-hidden="true">⌨</span> keyboard controls
      </button>
      <button class="ghost" onclick={() => (show_video = true)}>
        <span class="icon" aria-hidden="true">🎬</span> watch demo
      </button>
    </div>

    <a
      class="credit"
      href="https://dindles.net"
      target="_blank"
      rel="noopener"
      aria-label="dindles.net (opens in a new tab)"
    >
      <svg class="blob" viewBox="0 0 300 299" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g transform="translate(0,299) scale(0.05,-0.05)" fill="currentColor">
          <path
            d="M2211 5205 c-33 -5 -82 -31 -109 -57 -38 -38 -40 -46 -12 -35 29 11
34 7 23 -21 -7 -19 -13 -39 -13 -43 0 -4 -38 -18 -85 -30 -54 -14 -118 -54
-175 -110 -49 -48 -121 -102 -160 -119 -182 -84 -211 -111 -282 -269 -41 -91
-102 -174 -197 -271 -157 -160 -181 -219 -181 -453 0 -160 -10 -177 -101 -177
-21 0 -68 -27 -106 -60 l-69 -60 4 -685 c4 -641 7 -691 45 -785 23 -55 71
-221 108 -370 41 -163 89 -306 123 -360 30 -49 67 -117 83 -150 93 -200 221
-278 493 -302 166 -15 347 -73 411 -131 48 -43 138 -48 209 -11 41 22 95 22
300 1 532 -55 769 -49 1120 31 50 11 143 30 208 43 106 21 134 38 262 159 114
108 165 142 255 168 62 18 138 54 169 80 54 46 399 172 469 172 17 0 41 11 53
25 11 14 67 43 125 65 168 65 219 140 219 321 0 96 10 167 28 195 162 252 106
1349 -84 1649 -33 52 -66 126 -74 164 -9 43 -55 112 -119 180 -57 61 -120 149
-140 196 -21 47 -50 96 -66 109 -16 14 -37 44 -46 68 -12 32 -49 53 -133 77
-567 157 -644 186 -748 279 -56 51 -116 92 -134 92 -17 0 -47 15 -67 32 -48
44 -207 60 -268 28 -64 -35 -101 -3 -137 118 l-27 92 -97 -6 c-54 -4 -168 -24
-253 -45 l-156 -38 -114 72 c-63 39 -138 87 -166 107 -45 31 -114 48 -279 68
-27 4 -77 2 -109 -3z"
          />
        </g>
      </svg>
      dindles.net
    </a>
  </div>
{/if}

<style>
  .intro-screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: clamp(1.2rem, 4vmin, 2.6rem);
    padding: 1.5rem 1rem;
    text-align: center;
  }

  .consent {
    display: grid;
    justify-items: center;
    gap: 0.7em;
  }

  /* the one heavy-bordered element on the screen: the primary action */
  .start {
    aspect-ratio: unset;
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    padding: 0.3em 1.1em 0.3em 0.9em;
    cursor: pointer;
  }

  .start[aria-disabled='true'] {
    cursor: progress;
  }

  .play-icon {
    font-family: var(--font-emoji);
    font-variant-emoji: text;
    font-size: 0.8em;
  }

  .audio-note {
    font-family: var(--font-text);
    font-size: var(--text-display);
    /* two lines reserved so the header doesn't shift when the note changes to 'loading samples' */
    min-height: 2.6em;
  }

  .link {
    display: inline;
    aspect-ratio: unset;
    padding: 0;
    font: inherit;
    text-decoration: underline;
    text-underline-offset: 0.15em;
    cursor: pointer;
  }

  .link:hover {
    text-decoration-thickness: 2px;
  }

  .secondary {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem 1.6rem;
  }

  /* quiet text buttons: the underline appears on hover/focus so "start" stays the obvious action */
  .ghost {
    aspect-ratio: unset;
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    padding: 0.3em 0.2em;
    font-family: var(--font-text);
    font-size: var(--text-display);
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 0.2em;
    transition: text-decoration-color 0.15s ease;
    cursor: pointer;
  }

  .ghost:hover,
  .ghost:focus-visible {
    text-decoration-color: currentColor;
  }

  .icon {
    font-family: var(--font-emoji);
    font-variant-emoji: text;
  }

  .credit {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-text);
    font-size: clamp(0.75rem, 0.4rem + 1.2vmin, 1rem);
    cursor: pointer;
  }

  .credit:hover {
    text-decoration-thickness: 2px;
  }

  .blob {
    width: 1.2em;
    height: 1.2em;
    color: var(--user-colour);
  }
</style>
