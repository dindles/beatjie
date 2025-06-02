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
    <div class="display no-border">
      <div class="help-text overview">
        <ul>
          <li>tap samples</li>
          <li>each sample has its own sequencer and effects</li>
        </ul>
      </div>
    </div>
    <div class="pack-select element">
      <div class="help-text"><i>select a pack</i></div>
    </div>
    <div class="samples element">
      <div class="help-text"><i>select a sample</i></div>
    </div>
    <div class="selected-sample-settings element">
      <div class="help-text"><i>per-sample fx</i></div>
    </div>
    <div class="sequencer element">
      <div class="help-text"><i>per-sample sequencer</i></div>
    </div>
    <div class="transport-and-main-settings element">
      <div class="help-text"><i>play/stop, main-channel fx, bpm</i></div>
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
    grid-template-rows: 1fr 1.2fr 1fr 4fr 2fr 2fr 2fr;
    padding: 0.4%;
    gap: 0.4%;
  }

  .element {
    border: 3px solid var(--user-colour);
    border-radius: var(--border-radius);
    border-style: dashed;
    color: var(--user-colour);
    background-color: var(--black-or-white);
    gap: var(--spacing);
    display: grid;
    place-items: center;
    text-align: center;
  }

  .help-text {
    font-family: var(--font-text);
    grid-column: 1 / -1;
    font-size: var(--text-small);
  }

  .overview {
    font-size: var(--font-text);
    text-align: center;
  }

  .app-settings-help-toggle-container {
    width: 100%;
    display: flex;
  }

  .help-toggle {
    margin-left: auto;
    margin-top: 0.5rem;
    margin-right: 0.5rem;
  }

  .no-border {
    border: none;
  }
</style>
