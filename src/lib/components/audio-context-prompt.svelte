<script lang="ts">
  let { handleAudioConfirm: handle_audio_confirm, handleAudioDeny: handle_audio_deny } = $props();
</script>

<div class="audio-context-prompt">
  <div class="welcome text-logo"><i>beatjie</i></div>
  <div class="emoji-large">🙂</div>
  <p class="text-small">
    this page <br />uses audio. <br />is that ok?
  </p>
  <div>
    <button class="emoji-small" onclick={handle_audio_confirm}>👍</button>
    <button class="emoji-small" onclick={handle_audio_deny}>👎</button>
  </div>
</div>

<style>
  .audio-context-prompt {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    text-align: center;
    gap: 1em;
  }

  .audio-context-prompt button {
    display: inline-block;
  }

  .audio-context-prompt div {
    display: flex;
    gap: 1em;
    justify-content: center;
  }
</style>
