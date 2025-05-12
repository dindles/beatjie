<script lang="ts">
  interface Props {
    help_overlay_active: boolean
  }
  let { help_overlay_active = $bindable() }: Props = $props()
</script>

<div class="help-overlay">
  <div class="overlay-content">
    <div class="app-settings-help-toggle-container">
      <div class="app-settings element no-border"></div>
      <div class="help-toggle">
        <button
          class="emoji-small"
          onclick={() => {
            help_overlay_active = false
          }}>❌</button
        >
      </div>
    </div>
    <div class="display no-border"></div>
    <div class="pack-select element">
      <div class="help-text">select a pack</div>
    </div>
    <div class="samples element">
      <div class="help-text">select a sample</div>
    </div>
    <div class="selected-sample-settings element">
      <div class="help-text">selected-sample effects</div>
    </div>
    <div class="sequencer element">
      <div class="help-text">selected-sample sequencer</div>
    </div>
    <div class="transport-and-main-settings element">
      <div class="help-text">stop/start, main-channel effects, bpm</div>
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
    grid-template-rows: 1fr 1.5fr 1fr 4fr 2fr 2fr 2fr;
    padding: 0.4%;
  }

  .element {
    border: 3px solid var(--user-colour);
    border-radius: var(--border-radius);
    color: var(--user-colour);
    background-color: var(--black-or-white);
    gap: var(--spacing);
    display: grid;
    place-items: center;
    text-align: center;
  }

  .help-text {
    grid-column: 1 / -1;
    font-size: 2rem;
  }

  .app-settings-help-toggle-container {
    width: 100%;
    padding: 1rem;
    display: flex;
  }

  .help-toggle {
    margin-left: auto;
  }

  .no-border {
    border: none;
  }
</style>
