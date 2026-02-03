<script lang="ts">
  import * as Tone from 'tone';
  import type { Packs } from '$lib/types/audio';
  import type { Sample } from '$lib/audio-classes/sample.svelte';
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte';
  import PackSelector from '$lib/components/pack-selector.svelte';
  import { AudioEngine } from '$lib/audio-classes/audio-engine.svelte';
  import { MainAudioBus } from '$lib/audio-classes/main-audio-bus.svelte';
  import { cubicOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import { swipe } from '$lib/actions/swipeAction';

  import SelectedSampleSettings from '$lib/components/selected-sample-settings.svelte';

  interface Props {
    pitches: string[];
    packs: Packs;
    samples: Sample[];
    audio_engine: AudioEngine;
    main_audio_bus: MainAudioBus;
    selected_sample: Sample | undefined;
    selected_pack_index?: number;
    preview_samples_active?: boolean;
    feedback_state: FeedbackState;
  }

  let {
    pitches,
    packs,
    samples,
    audio_engine,
    main_audio_bus,
    selected_sample = $bindable(),
    selected_pack_index = $bindable(0),
    preview_samples_active = $bindable(true),
    feedback_state
  }: Props = $props();

  let _slide_direction = $state<-1 | 1>(1);
  let animating = $state(false);

  let previous_pack_index = $state(selected_pack_index);

  $effect(() => {
    if (previous_pack_index !== selected_pack_index) {
      // Determine direction based on index change
      const diff = selected_pack_index - previous_pack_index;

      // Handle wrap-around cases
      if (Math.abs(diff) > packs.length / 2) {
        // Wrapped around - reverse the direction
        _slide_direction = diff > 0 ? 1 : -1;
      } else {
        // Normal case
        _slide_direction = diff > 0 ? -1 : 1;
      }

      previous_pack_index = selected_pack_index;
    }
  });

  function getSampleByID(sample_id: number) {
    return samples.find((s: Sample) => s.id === sample_id);
  }

  function handleSampleClick(sample: Sample | undefined) {
    if (!sample) return;

    function selectSample(sample_id: number) {
      selected_sample = samples.find((s) => s.id === sample_id);
    }

    function triggerSample(sample: Sample | undefined) {
      if (audio_engine.isInitialised() && sample) {
        sample.play(Tone.now());
      }
    }

    selectSample(sample.id);

    if (preview_samples_active) {
      triggerSample(sample);
    }
  }

  function changePack(direction: 'prev' | 'next') {
    if (animating) return;

    animating = true;
    _slide_direction = direction === 'prev' ? 1 : -1; // prev swipes content from left (positive x)

    const new_index =
      direction === 'prev'
        ? (selected_pack_index - 1 + packs.length) % packs.length
        : (selected_pack_index + 1) % packs.length;

    selected_pack_index = new_index;

    setTimeout(() => {
      animating = false;
    }, 250);
  }

  function togglePreview() {
    preview_samples_active = !preview_samples_active;
  }
</script>

<div class="packs-container">
  <div class="pack-selector-and-preview-toggle">
    <PackSelector {packs} {samples} {feedback_state} bind:selected_pack_index />

    <button
      class="preview-toggle emoji-small"
      onmouseenter={() => feedback_state.showTooltip('sample preview')}
      onmouseleave={() => feedback_state.clear()}
      onclick={togglePreview}
      aria-label={preview_samples_active ? 'disable sample preview' : 'enable sample preview'}
    >
      {preview_samples_active ? '🎧' : '🚫'}
    </button>
  </div>

  <div
    class="pack-container"
    use:swipe={{
      onSwipeLeft: () => changePack('next'),
      onSwipeRight: () => changePack('prev')
    }}
  >
    {#key selected_pack_index}
      <div
        class="pack"
        onmouseenter={() => feedback_state.showTooltip('sample select')}
        onmouseleave={() => feedback_state.clear()}
        in:fly={{
          duration: 250,
          easing: cubicOut,
          x: (() => {
            const diff = selected_pack_index - previous_pack_index;
            const direction =
              Math.abs(diff) > packs.length / 2
                ? diff > 0
                  ? 1
                  : -1 // wrapped
                : diff > 0
                  ? -1
                  : 1; // normal
            return direction * -300;
          })(),
          y: 0
        }}
        out:fly={{
          duration: 120,
          easing: cubicOut,
          x: (() => {
            const diff = selected_pack_index - previous_pack_index;
            const direction =
              Math.abs(diff) > packs.length / 2 ? (diff > 0 ? 1 : -1) : diff > 0 ? -1 : 1;
            return direction * 300;
          })(),
          y: 0
        }}
      >
        {#each samples as sample: Sample (sample.id)}
          {#if sample && sample.pack === packs[selected_pack_index].name}
            <button
              class="sample border emoji-large"
              class:active={sample.id === selected_sample?.id}
              class:playing={sample.is_playing}
              onclick={() => handleSampleClick(getSampleByID(sample.id))}
              ontouchstart={(e) => {
                e.stopPropagation();
              }}
            >
              {sample.emoji}
            </button>
          {/if}
        {/each}
      </div>
    {/key}
  </div>
  <SelectedSampleSettings {selected_sample} {pitches} {main_audio_bus} {feedback_state} />
</div>

<style>
  .packs-container {
    width: 100%;
    height: 100%;
  }

  .pack-selector-and-preview-toggle {
    display: flex;
    aspect-ratio: 8/0.8;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 0.2rem;
  }

  .preview-toggle {
    margin-left: auto;
  }

  .pack-container {
    position: relative;
    aspect-ratio: 2/1;
    overflow: hidden;
    touch-action: pan-y;
    height: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  .pack {
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
  }
</style>
