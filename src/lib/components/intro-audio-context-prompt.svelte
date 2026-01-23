<script lang="ts">
  let { handleAudioConfirm: handle_audio_confirm, handleAudioDeny: handle_audio_deny } = $props();
</script>

<div class="intro-screen">
  <div class="audio-prompt">
    <p class="text-small">
      this page <br />uses audio. <br />is that ok?
    </p>
    <div class="buttons">
      <button class="emoji-small" onclick={handle_audio_confirm}>👍</button>
      <button class="emoji-small" onclick={handle_audio_deny}>👎</button>
    </div>
  </div>
</div>

<style>
  .intro-screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .audio-prompt {
    display: grid;
    place-content: center;
    text-align: center;
    gap: 1em;
  }

  .buttons {
    display: flex;
    gap: 1em;
    justify-content: center;
  }
</style>
