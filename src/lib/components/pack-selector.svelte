<!-- PackSelector.svelte -->
<script lang="ts">
  import type { Packs, Sample } from '$lib/audio/audio-models.svelte'
  let {
    packs,
    SAMPLES,
    selected_sample,
    selected_pack_index = $bindable(),
  }: {
    packs: Packs
    SAMPLES: Sample[]
    selected_sample: Sample | undefined
    selected_pack_index: number
  } = $props()

  function selectPack(direction: 'prev' | 'next' | 'random') {
    switch (direction) {
      case 'prev':
        selected_pack_index =
          (selected_pack_index - 1 + packs.length) % packs.length
        break
      case 'next':
        selected_pack_index = (selected_pack_index + 1) % packs.length
        break
      case 'random':
        selected_pack_index = Math.floor(Math.random() * packs.length)
        break
    }
  }
</script>

<div class="pack-select">
  <button
    class="pack-select-prev emoji-small"
    onclick={() => selectPack('prev')}>👈</button
  >
  <div class="pack-indicators">
    {#each packs as pack, index}
      <div
        class="pack-indicator border"
        class:active={index === selected_pack_index}
        class:playing={SAMPLES.some(
          (sample) => sample.pack === pack.name && sample.is_playing
        )}
      ></div>
    {/each}
  </div>
  <button
    class="pack-select-next emoji-small"
    onclick={() => selectPack('next')}>👉</button
  >
</div>

<style>
  .pack-select {
    display: grid;
    grid-template-columns: auto 1fr auto;
    place-items: center;
    gap: var(--spacing);
  }

  .pack-indicators {
    display: flex;
    gap: var(--spacing);
    justify-content: center;
  }

  .pack-indicator {
    aspect-ratio: 1;
    height: 1.2em;
    transition: all 0.1s ease;
  }

  .pack-indicator.playing {
    transform: scale(1.1);
  }
</style>
