<script lang="ts">
  interface Props {
    help_overlay_active: boolean
  }
  let { help_overlay_active = $bindable() }: Props = $props()
</script>

<div class="help-overlay">
  <div class="overlay-content">
    <div class="app-settings element">
      app settings – help, colours and clear sequences
      <div class="help-toggle">
        <button
          class="emoji-small"
          onclick={() => {
            help_overlay_active = false
          }}>❌</button
        >
      </div>
    </div>
    <div class="display element">display</div>
    <div class="pack-select element">
      use the pack selectors to switch sample packs
    </div>
    <div class="samples element">
      samples - choose one to play, add to sequencer, or apply effects
    </div>
    <div class="selected-sample-settings element">
      effects for the selected sample
    </div>
    <div class="sequencer element">16-step sequencer</div>
    <div class="transport-and-main-settings element">
      sequencer stop/start, bpm and main channel effects
    </div>
  </div>
</div>

<style>
  .help-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.85);
    color: white;
    z-index: 100;
  }

  .overlay-content {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto auto 1fr auto auto;
    padding: 0.4%;
  }

  .element {
    border: 1px solid var(--border-color, white);
    border-radius: var(--border-radius, 4px);
    text-align: center;
  }

  .app-settings {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1rem;
  }

  .display {
    width: 100%;
    aspect-ratio: 4/0.5;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .pack-select {
    display: grid;
    grid-template-columns: auto 1fr auto;
    place-items: center;
    gap: var(--spacing);
  }

  .samples {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    place-items: center;
  }

  .selected-sample-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    place-items: center;
    margin-top: 0.4em;
    margin-bottom: 0.4em;
  }

  .sequencer {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: var(--spacing);
    place-items: center;
  }

  .transport-and-main-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    place-items: center;
    margin-top: 0.4em;
    margin-bottom: 0.4em;
  }

  .help-toggle {
    position: absolute;
    right: 1rem;
  }
</style>
