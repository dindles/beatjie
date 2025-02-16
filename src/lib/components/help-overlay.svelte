<script lang="ts">
  let { help_overlay_active = $bindable() } = $props()
</script>

<div class="app border">
  <div class="app-settings">
    app settings
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
  <div class="samples">samples</div>
  <div class="selected-sample-settings">selected sample settings</div>
  <div class="sequencer">sequencer</div>
  <div class="transport-and-main-settings">transport and main settings</div>
</div>

<style>
  .app {
    aspect-ratio: 4/6.9;
    overflow: hidden;
    padding: 0.4%;
    grid-template-rows: auto auto 1fr auto auto;
  }
</style>
