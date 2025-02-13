<!-- Packs.svelte -->
<script lang="ts">
  import * as Tone from 'tone'
  import type { Packs, Sample } from '$lib/audio/audio-models.svelte'
  import PackSelector from '$lib/components/pack-selector.svelte'
  import { AudioEngine } from '$lib/audio/audio-engine.svelte'

  interface Props {
    packs: Packs
    samples: Sample[]
    audio_engine: AudioEngine
    selected_sample: Sample | undefined
  }

  let {
    packs,
    samples,
    audio_engine,
    selected_sample = $bindable(),
  }: Props = $props()

  let selected_pack_index: number = $state(0)

  // todo: decide on this
  let preview_samples_active: boolean = $state(true)

  function getSampleByID(sample_id: number) {
    return samples.find((s: Sample) => s.id === sample_id)
  }

  function handleSampleClick(sample: Sample | undefined) {
    if (!sample) return

    function selectSample(sample_id: number) {
      selected_sample = samples.find((s) => s.id === sample_id)
    }

    function triggerSample(sample: Sample | undefined) {
      if (audio_engine.isInitialised() && sample) {
        sample.play(Tone.now())
      }
    }

    selectSample(sample.id)

    if (preview_samples_active) {
      triggerSample(sample)
    }
  }
</script>

<PackSelector {packs} {samples} bind:selected_pack_index />

{#key selected_pack_index}
  <div class="pack">
    {#each samples as sample: Sample}
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
