<!-- sequencer.svelte -->
<script lang="ts">
  import type { Sample } from '$lib/audio-classes/sample.svelte'
  import type { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte'
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte'
  import { press } from '$lib/actions/pressAction'

  interface Props {
    selected_sample: Sample | undefined
    sequencer: AudioSequencer
    feedback_state: FeedbackState
  }

  let { selected_sample, sequencer, feedback_state }: Props = $props()

  function handleSeqClick(sample: Sample, step_index: number) {
    sample.sequence[step_index] = !sample.sequence[step_index]
  }

  const SEQUENCER_STEPS = Array(16).fill(null)
</script>

<div
  class="sequencer"
  role="group"
  aria-label="step sequencer"
  onmouseenter={() =>
    feedback_state.showTooltip(selected_sample ? 'per-sample sequencer' : '!select sample')}
  onmouseleave={() => feedback_state.clear()}
  onfocusin={() =>
    feedback_state.showTooltip(selected_sample ? 'per-sample sequencer' : '!select sample')}
  onfocusout={() => feedback_state.clear()}
>
  {#if selected_sample}
    {#each SEQUENCER_STEPS as _, index (index)}
      <button
        class="step border border-hair emoji-sequencer"
        class:active={index === sequencer.active_step_index}
        use:press={() => handleSeqClick(selected_sample, index)}
        aria-label="{selected_sample.name} step {index + 1}"
        aria-pressed={selected_sample.sequence[index]}
      >
        {#if selected_sample.sequence[index]}
          {selected_sample.emoji}
        {:else}
          <span class="empty-step"></span>
        {/if}
      </button>
    {/each}
  {:else}
    <!-- display placeholder steps when no sample is selected -->
    {#each SEQUENCER_STEPS as _, index (index)}
      <div
        class="placeholder-step border border-hair"
        class:active={index === sequencer.active_step_index}
        aria-hidden="true"
      ></div>
    {/each}
  {/if}
</div>

<style>
  /* 16 steps as four bars: each row is two groups of four with a spacer column between */
  .sequencer {
    display: grid;
    grid-template-columns: repeat(4, 1fr) calc(var(--spacing) * 2) repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: var(--spacing);
  }

  .sequencer > :nth-child(8n + 5) {
    grid-column-start: 6;
  }

  .emoji-sequencer {
    font-family: var(--font-emoji);
    font-size: var(--emoji-sequencer);
  }

  .placeholder-step {
    aspect-ratio: 1;
    min-height: 100%;
  }

  .empty-step {
    display: block;
    min-height: 1em;
  }

  .step {
    display: grid;
    place-items: center;
  }

  /* steps show their state via emoji content; skip the global pressed-dot */
  .step::after {
    content: none;
  }

  /* playhead position gets a size cue on top of the colour inversion */
  .step.active,
  .placeholder-step.active {
    scale: 0.92;
  }
</style>
