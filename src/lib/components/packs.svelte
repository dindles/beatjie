<!-- Packs.svelte -->
<script lang="ts">
  import type { Packs, Sample } from '$lib/audio/audio-models.svelte'
  import PackSelector from '$lib/components/pack-selector.svelte'

  let {
    packs,
    selected_pack_index = $bindable(),
    SAMPLES,
    handleSampleClick,
  }: {
    packs: Packs
    SAMPLES: Sample[]
    selected_pack_index: number
    handleSampleClick: (sample: Sample | undefined) => void
  } = $props()
  let selected_sample: Sample | undefined = $state(undefined)

  function getSampleByID(sample_id: number) {
    return SAMPLES.find((s: Sample) => s.id === sample_id)
  }
</script>

<PackSelector {packs} {SAMPLES} bind:selected_pack_index />

{#key selected_pack_index}
  <div class="pack">
    {#each SAMPLES as sample}
      {#if sample && sample.pack === packs[selected_pack_index].name}
        <button
          class="sample border emoji-large"
          class:active={sample.id === selected_sample?.id}
          class:playing={sample.playing}
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
