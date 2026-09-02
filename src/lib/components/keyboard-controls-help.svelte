<script lang="ts">
  import { dialog } from '$lib/actions/dialogAction'

  interface Props {
    onclose: () => void
    shortcuts_enabled?: boolean
    can_toggle_shortcuts?: boolean
  }

  let {
    onclose,
    shortcuts_enabled = $bindable(true),
    can_toggle_shortcuts = false
  }: Props = $props()
</script>

<div
  class="keyboard-controls-help"
  role="dialog"
  aria-modal="true"
  aria-labelledby="keyboard-help-title"
  use:dialog={onclose}
>
  <div class="header">
    <h2 id="keyboard-help-title" class="title">keyboard controls</h2>
    <button class="close-btn emoji-small" onclick={onclose} aria-label="close"> ❌ </button>
  </div>

  <div class="controls-content">
    {#if can_toggle_shortcuts}
      <div class="controls-group">
        <p class="label">single-key shortcuts</p>
        <div class="keys">
          <button
            class="toggle"
            aria-pressed={shortcuts_enabled}
            onclick={() => (shortcuts_enabled = !shortcuts_enabled)}
          >
            {shortcuts_enabled ? 'on' : 'off'}
          </button>
        </div>
      </div>
    {/if}

    <div class="controls-group">
      <p class="label">pack select</p>
      <div class="keys">
        <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>
      </div>
    </div>

    <div class="controls-group">
      <p class="label">sample preview</p>
      <div class="keys">
        <kbd>P</kbd>
      </div>
    </div>

    <div class="controls-group">
      <p class="label">sample select and playback</p>
      <div class="keys keys-grid">
        <kbd>Q</kbd> <kbd>W</kbd> <kbd>E</kbd> <kbd>R</kbd>
        <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>F</kbd>
      </div>
    </div>

    <div class="controls-group">
      <p class="label">sample effects</p>
      <div class="keys">
        <kbd>Z</kbd> <kbd>X</kbd> <kbd>C</kbd> <kbd>V</kbd>
      </div>
    </div>

    <div class="controls-group">
      <p class="label">sequencer start/stop</p>
      <div class="keys">
        <kbd class="wide">space</kbd>
      </div>
    </div>

    <div class="controls-group">
      <p class="label">main effects</p>
      <div class="keys">
        <kbd>B</kbd> <kbd>N</kbd>
      </div>
    </div>

    <div class="controls-group">
      <p class="label">bpm</p>
      <div class="keys">
        <kbd>↑</kbd> <kbd>↓</kbd>
      </div>
    </div>

    <div class="controls-group">
      <p class="label">show this help</p>
      <div class="keys">
        <kbd>?</kbd>
      </div>
    </div>
  </div>
</div>

<style>
  .keyboard-controls-help {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .keyboard-controls-help::-webkit-scrollbar {
    display: none;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .title {
    font-family: var(--font-text);
    font-size: var(--text-display);
    font-weight: normal;
  }

  .close-btn {
    aspect-ratio: 1;
    font-size: clamp(0.8rem, 2vmin, 1.1rem);
    min-width: 28px;
    min-height: 28px;
  }

  /* label | keys, one row per group. keys keep their width; long labels wrap */
  .controls-content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content;
    gap: 0.6rem 1rem;
    align-items: center;
  }

  .controls-group {
    display: contents;
  }

  .label {
    font-family: var(--font-text);
    font-size: clamp(1rem, 1.6vmin, 0.9rem);
  }

  .keys {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .keys-grid {
    display: grid;
    grid-template-columns: repeat(4, auto);
    justify-content: end;
  }

  kbd,
  .toggle {
    font-family: var(--font-text);
    font-size: clamp(0.6rem, 1.8vmin, 1rem);
    border: 2px solid var(--user-colour);
    border-radius: 4px;
    padding: 0.15em 0.4em;
    min-width: 1.6em;
    text-align: center;
    display: inline-block;
    text-transform: uppercase;
  }

  kbd.wide {
    min-width: 3.5em;
  }

  .toggle {
    aspect-ratio: unset;
    min-width: 3.5em;
    cursor: pointer;
  }

  /* state is spelled out in the text; skip the global pressed-dot */
  .toggle::after {
    content: none;
  }
</style>
