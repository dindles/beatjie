<script lang="ts">
  import * as Tone from 'tone'
  import type { Packs, Sample } from '$lib/classes/audio-models.svelte'
  import PackSelector from '$lib/components/pack-selector.svelte'
  import { AudioEngine } from '$lib/classes/audio-engine.svelte'
  import { cubicOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import { swipe } from '$lib/actions/swipeAction'

  interface Props {
    packs: Packs
    samples: Sample[]
    audio_engine: AudioEngine
    selected_sample: Sample | undefined
    selected_pack_index?: number
  }

  let {
    packs,
    samples,
    audio_engine,
    selected_sample = $bindable(),
    selected_pack_index = $bindable(0),
  }: Props = $props()

  let slide_direction = $state<-1 | 1>(1)
  let animating = $state(false)

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

  function changePack(direction: 'prev' | 'next') {
    if (animating) return

    animating = true
    slide_direction = direction === 'prev' ? 1 : -1 // prev swipes content from left (positive x)

    const newIndex =
      direction === 'prev'
        ? (selected_pack_index - 1 + packs.length) % packs.length
        : (selected_pack_index + 1) % packs.length

    selected_pack_index = newIndex

    setTimeout(() => {
      animating = false
    }, 250)
  }

  function togglePreview() {
    preview_samples_active = !preview_samples_active
  }
</script>

<div class="pack-selector-and-preview-toggle">
  <PackSelector {packs} {samples} bind:selected_pack_index />

  <button
    class="preview-toggle emoji-small"
    onclick={togglePreview}
    aria-label={preview_samples_active
      ? 'Disable sample preview'
      : 'Enable sample preview'}
  >
    {preview_samples_active ? '🎧' : '🚫'}
  </button>
</div>

<div
  class="pack-container"
  use:swipe={{
    onSwipeLeft: () => changePack('next'),
    onSwipeRight: () => changePack('prev'),
  }}
>
  {#key selected_pack_index}
    <div
      class="pack"
      in:fly={{
        duration: 250,
        easing: cubicOut,
        x: slide_direction * -300,
        y: 0,
      }}
      out:fly={{
        duration: 120,
        easing: cubicOut,
        x: slide_direction * 300,
        y: 0,
      }}
    >
      {#each samples as sample: Sample}
        {#if sample && sample.pack === packs[selected_pack_index].name}
          <button
            class="sample border emoji-large"
            class:active={sample.id === selected_sample?.id}
            class:playing={sample.is_playing}
            onclick={() => handleSampleClick(getSampleByID(sample.id))}
            ontouchstart={(e) => {
              e.stopPropagation()
            }}
          >
            {sample.emoji}
          </button>
        {/if}
      {/each}
    </div>
  {/key}
</div>

<style>
  .pack-selector-and-preview-toggle {
    display: flex;
    aspect-ratio: 8/1;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .preview-toggle {
    margin-left: auto;
  }

  .pack-container {
    aspect-ratio: 2/1;
    width: 100%;
    overflow: hidden;
    touch-action: pan-y;
    height: 100%;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }

  .pack {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
  }
</style>
