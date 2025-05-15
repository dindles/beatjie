<!-- PackSelector.svelte -->
<script lang="ts">
  import type { Packs, Sample } from '$lib/audio/audio-models.svelte'
  let {
    packs,
    samples,
    selected_pack_index = $bindable(),
  }: {
    packs: Packs
    samples: Sample[]
    selected_pack_index: number
  } = $props()

  function selectPack(index: number) {
    selected_pack_index = index
  }
</script>

<div class="pack-select">
  <div class="pack-indicators">
    {#each packs as pack, index}
      <button
        class="pack-indicator border"
        class:active={index === selected_pack_index}
        class:playing={samples.some(
          (sample) => sample.pack === pack.name && sample.is_playing
        )}
        onclick={() => selectPack(index)}
        aria-label={pack.name}
      ></button>
    {/each}
  </div>
</div>

<style>
  .pack-select {
    display: grid;
    place-items: center;
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
