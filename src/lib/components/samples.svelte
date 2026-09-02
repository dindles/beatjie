<script lang="ts">
  import * as Tone from 'tone'
  import { tick, untrack } from 'svelte'
  import type { Packs } from '$lib/types/audio-types'
  import type { Sample } from '$lib/audio-classes/sample.svelte'
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte'
  import PackSelector from '$lib/components/pack-selector.svelte'
  import SelectedSampleSettings from '$lib/components/selected-sample-settings.svelte'
  import { AudioContext } from '$lib/audio-classes/audio-context.svelte'
  import { cubicOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import { swipe } from '$lib/actions/swipeAction'
  import { press } from '$lib/actions/pressAction'
  import { prefersReducedMotion } from '$lib/utils/reduced-motion.svelte'

  interface Props {
    pitches: string[]
    packs: Packs
    samples: Sample[]
    audio_context: AudioContext
    selected_sample: Sample | undefined
    selected_pack_index?: number
    preview_samples_active?: boolean
    feedback_state: FeedbackState
  }

  let {
    pitches,
    packs,
    samples,
    audio_context,
    selected_sample = $bindable(),
    selected_pack_index = $bindable(0),
    preview_samples_active = $bindable(true),
    feedback_state
  }: Props = $props()

  let animating = $state(false)
  // previous-value tracking: must lag one update behind selected_pack_index so
  // slide_direction can compare them; a writable $derived would resync immediately
  // eslint-disable-next-line svelte/prefer-writable-derived
  let previous_pack_index = $state(selected_pack_index)

  let pack_grid: HTMLDivElement | undefined = $state(undefined)
  // index (within the visible pack) of the focused sample button, so focus can be
  // restored after {#key} rebuilds the grid on a pack change
  let focused_sample_index: number | null = $state(null)

  let visible_samples = $derived(
    samples.filter((sample) => sample.pack === packs[selected_pack_index].name)
  )

  let slide_direction = $derived.by(() => {
    const diff = selected_pack_index - previous_pack_index
    if (diff === 0) return 1 as const
    if (Math.abs(diff) > packs.length / 2) {
      return (diff > 0 ? 1 : -1) as -1 | 1
    }
    return (diff > 0 ? -1 : 1) as -1 | 1
  })

  $effect(() => {
    previous_pack_index = selected_pack_index
  })

  $effect(() => {
    void selected_pack_index
    const index = untrack(() => focused_sample_index)
    if (index === null) return
    tick().then(() => {
      pack_grid?.querySelectorAll<HTMLElement>('.sample')[index]?.focus()
    })
  })

  function handleSampleFocus(index: number) {
    focused_sample_index = index
  }

  function handleSampleBlur(event: FocusEvent) {
    // focus moving to another element means the user left the grid on purpose;
    // a null relatedTarget is the {#key} rebuild (or a click on empty space)
    if (event.relatedTarget !== null) focused_sample_index = null
  }

  function handleSampleClick(sample: Sample) {
    selected_sample = sample

    if (preview_samples_active && audio_context.isInitialised()) {
      sample.play(Tone.now())
    }
  }

  function changePack(direction: 'prev' | 'next') {
    if (animating) return

    animating = true

    const new_index =
      direction === 'prev'
        ? (selected_pack_index - 1 + packs.length) % packs.length
        : (selected_pack_index + 1) % packs.length

    selected_pack_index = new_index

    setTimeout(() => {
      animating = false
    }, 250)
  }

  function togglePreview() {
    preview_samples_active = !preview_samples_active
  }
</script>

<div class="packs-container">
  <div class="pack-selector-and-preview-toggle">
    <PackSelector {packs} {samples} {feedback_state} bind:selected_pack_index />

    <button
      class="preview-toggle emoji-small"
      onmouseenter={() => feedback_state.showTooltip('sample preview')}
      onmouseleave={() => feedback_state.clear()}
      onfocusin={() => feedback_state.showTooltip('sample preview')}
      onfocusout={() => feedback_state.clear()}
      onclick={togglePreview}
      aria-label="sample preview"
      aria-pressed={preview_samples_active}
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
        role="group"
        aria-label="sample select"
        bind:this={pack_grid}
        onmouseenter={() => feedback_state.showTooltip('sample select')}
        onmouseleave={() => feedback_state.clear()}
        onfocusin={() => feedback_state.showTooltip('sample select')}
        onfocusout={() => feedback_state.clear()}
        in:fly={{
          duration: prefersReducedMotion() ? 0 : 250,
          easing: cubicOut,
          x: slide_direction * -300
        }}
        out:fly={{
          duration: prefersReducedMotion() ? 0 : 120,
          easing: cubicOut,
          x: slide_direction * 300
        }}
      >
        {#each visible_samples as sample, index (sample.id)}
          <button
            class="sample border emoji-large"
            class:active={sample.id === selected_sample?.id}
            class:playing={sample.is_playing}
            use:press={() => handleSampleClick(sample)}
            ontouchstart={(e) => {
              e.stopPropagation()
            }}
            onfocus={() => handleSampleFocus(index)}
            onblur={handleSampleBlur}
            aria-label="{sample.name} sample"
            aria-pressed={sample.id === selected_sample?.id}
          >
            {sample.emoji}
          </button>
        {/each}
      </div>
    {/key}
  </div>
  <SelectedSampleSettings {selected_sample} {pitches} {feedback_state} />
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
