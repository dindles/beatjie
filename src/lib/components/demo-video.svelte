<script lang="ts">
  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();
</script>

<div class="demo-video">
  <div class="header">
    <button class="close-btn emoji-small" onclick={onclose} aria-label="close"> ❌ </button>
  </div>

  <div class="video-container">
    <video controls playsinline>
      <source src="/video/beatjie_demo.mp4" type="video/mp4" />
      <track kind="captions" />
    </video>
  </div>
</div>

<style>
  .demo-video {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
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

  .video-container {
    flex: 1;
    display: grid;
    place-content: center;
  }

  video {
    max-width: 100%;
    max-height: 100%;
    border-radius: 4px;
  }
</style>
