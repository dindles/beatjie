<script lang="ts">
  interface Props {
    onclose: () => void
  }

  let { onclose }: Props = $props()
</script>

<div class="keyboard-controls border">
  <div class="header">
    <button class="close-btn emoji-small" onclick={onclose} aria-label="close"> ❌ </button>
  </div>

  <div class="controls-content">
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
  </div>
</div>

<style>
  .keyboard-controls {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .keyboard-controls::-webkit-scrollbar {
    display: none;
  }

  .header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .close-btn {
    aspect-ratio: 1;
    font-size: clamp(0.6rem, 1.6vmin, 0.9rem);
  }

  .controls-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .controls-group {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .label {
    font-family: var(--font-text);
    font-size: clamp(1rem, 1.6vmin, 0.9rem);
    opacity: 0.7;
  }

  .keys {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .keys-grid {
    display: grid;
    grid-template-columns: repeat(4, auto);
    justify-content: start;
  }

  kbd {
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
</style>
