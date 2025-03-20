<!-- help-overlay.svelte -->
<script lang="ts">
  interface Props {
    help_overlay_active: boolean
  }

  let { help_overlay_active = $bindable() }: Props = $props()
</script>

<div class="app border">
  <div class="app-settings">
    app settings – help, colours and clear sequences
    <div class="help-toggle">
      <button
        class="emoji-small"
        onclick={() => {
          help_overlay_active = !help_overlay_active
        }}>❓</button
      >
    </div>
  </div>
  <div class="display">display</div>
  <div class="pack-select">use the pack selectors to switch sample packs</div>
  <div class="samples">
    samples - choose one to play, add to sequencer, or apply effects
  </div>
  <div class="selected-sample-settings">effects for the selected sample</div>
  <div class="sequencer">16-step sequencer</div>
  <div class="transport-and-main-settings">
    sequencer stop/start, bpm and main channel effects
  </div>
</div>

<style>
  .app {
    aspect-ratio: 4/6.6;
    overflow: hidden;
    padding: 0.4%;
    grid-template-rows: auto auto 1fr auto auto;
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
    display: block;
  }
</style>
