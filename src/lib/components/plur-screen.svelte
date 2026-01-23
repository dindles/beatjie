<script lang="ts">
  interface Props {
    onclose: () => void;
  }

  let { onclose }: Props = $props();
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div class="plur-screen border">
  <div class="plur-content">
    <p class="plur-text text-logo">p.l.u.r.</p>
  </div>
</div>

<style>
  .plur-screen {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
  }

  .close-btn {
    align-self: flex-end;
    font-size: clamp(0.6rem, 1.6vmin, 0.9rem);
  }

  .plur-content {
    flex: 1;
    display: grid;
    place-items: center;
  }

  .plur-text {
    font-family: var(--font-text);
    text-align: center;
    letter-spacing: 0.1em;
  }
</style>
