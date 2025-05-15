<!-- Samples.svelte -->
<script lang="ts">
  import * as Tone from 'tone'
  import type { Packs, Sample } from '$lib/audio/audio-models.svelte'
  import PackSelector from '$lib/components/pack-selector.svelte'
  import { AudioEngine } from '$lib/audio/audio-engine.svelte'
  import { cubicOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'

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

  let selected_pack_index: number = $state(
    Math.floor(Math.random() * packs.length)
  )

  let touch_start_x = $state(0)
  let touch_end_x = $state(0)
  let is_swiping = $state(false)

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

  function handleTouchStart(e: TouchEvent) {
    touch_start_x = e.touches[0].clientX
    is_swiping = true
  }

  function handleTouchMove(e: TouchEvent) {
    if (!is_swiping) return
    touch_end_x = e.touches[0].clientX
  }

  function handleTouchEnd() {
    if (!is_swiping) return

    const minSwipeDistance = 50 // minimum distance to register as a swipe
    const swipeDistance = touch_end_x - touch_start_x

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        changePack('prev')
      } else {
        changePack('next')
      }
    }

    is_swiping = false
  }

  function changePack(direction: 'prev' | 'next') {
    if (animating) return

    animating = true
    slide_direction = direction === 'prev' ? 1 : -1

    const newIndex =
      direction === 'prev'
        ? (selected_pack_index - 1 + packs.length) % packs.length
        : (selected_pack_index + 1) % packs.length

    selected_pack_index = newIndex

    setTimeout(() => {
      animating = false
    }, 350) // match this with transition duration
  }
</script>

<PackSelector {packs} {samples} bind:selected_pack_index />

<div
  class="pack-container"
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
>
  <div class="pack-animation-container">
    {#key selected_pack_index}
      <div
        class="pack"
        in:fly={{
          duration: 300,
          easing: cubicOut,
          x: slide_direction * 300,
          y: 0,
        }}
        out:fly={{
          duration: 150,
          easing: cubicOut,
          x: slide_direction * -300,
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
            >
              {sample.emoji}
            </button>
          {/if}
        {/each}
      </div>
    {/key}
  </div>
</div>

<style>
  .pack-container {
    width: 100%;
    overflow: hidden;
    touch-action: pan-y;
    height: 100%;
  }

  .pack-animation-container {
    position: relative;
    width: 100%;
    min-height: 300px;
  }

  .pack {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
</style>
