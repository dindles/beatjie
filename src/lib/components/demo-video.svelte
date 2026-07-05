<script lang="ts">
  import { resolve } from '$app/paths'
  import { dialog } from '$lib/actions/dialogAction'

  interface Props {
    onclose: () => void
  }

  let { onclose }: Props = $props()

  // @ts-expect-error - resolve types are generated from routes, but it accepts any pathname
  const video_src = resolve('/video/beatjie_demo.mp4')
  // @ts-expect-error - resolve types are generated from routes, but it accepts any pathname
  const captions_src = resolve('/video/beatjie_demo.vtt')
</script>

<div
  class="demo-video"
  role="dialog"
  aria-modal="true"
  aria-label="demo video"
  use:dialog={onclose}
>
  <div class="header">
    <button class="close-btn emoji-small" onclick={onclose} aria-label="close"> ❌ </button>
  </div>

  <div class="video-container">
    <video controls playsinline>
      <source src={video_src} type="video/mp4" />
      <track kind="captions" src={captions_src} srclang="en" label="English" />
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
    font-size: clamp(0.8rem, 2vmin, 1.1rem);
    min-width: 28px;
    min-height: 28px;
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
