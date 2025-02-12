<!-- Packs.svelte -->
<script lang="ts">
  import type { Packs, Sample } from '$lib/audio/audio-models.svelte'
  import PackSelector from '$lib/components/pack-selector.svelte'

  let {
    packs,
    selected_pack_index = $bindable(),
    SAMPLES,
    handleSampleClick,
    selected_sample,
  }: {
    packs: Packs
    SAMPLES: Sample[]
    selected_pack_index: number
    handleSampleClick: (sample: Sample | undefined) => void
    selected_sample: Sample | undefined
  } = $props()

  function getSampleByID(sample_id: number) {
    return SAMPLES.find((s: Sample) => s.id === sample_id)
  }
</script>

<PackSelector {packs} {SAMPLES} {selected_sample} bind:selected_pack_index />

{#key selected_pack_index}
  <div class="pack">
    {#each SAMPLES as sample: Sample}
      {#if sample && sample.pack === packs[selected_pack_index].name}
        <button
          class="sample border emoji-large"
          class:active={sample.id === selected_sample?.id}
          class:playing={sample.is_playing}
          onclick={() => handleSampleClick(getSampleByID(sample.id))}
        >
          {sample.emoji}
        </button>
      {/if}
    {/each}
  </div>
{/key}

<style>
  .pack {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
  }
</style>
