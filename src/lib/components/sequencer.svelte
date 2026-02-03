<!-- sequencer.svelte -->
<script lang="ts">
  import type { Sample } from '$lib/audio-classes/sample.svelte';
  import type { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte';
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte';

  interface Props {
    samples: Sample[];
    selected_sample: Sample | undefined;
    audio_sequencer: AudioSequencer;
    feedback_state: FeedbackState;
  }

  let { samples: _samples, selected_sample, audio_sequencer, feedback_state }: Props = $props();

  function handleSeqClick(sample: Sample, step_index: number) {
    sample.sequence[step_index] = !sample.sequence[step_index];
  }

  // Create an array of 16 items to represent the sequencer steps
  const SEQUENCER_STEPS = Array(16).fill(null);
</script>

<div
  class="sequencer"
  onmouseenter={() =>
    feedback_state.showTooltip(selected_sample ? 'per-sample sequencer' : '!select sample')}
  onmouseleave={() => feedback_state.clear()}
>
  {#if selected_sample}
    {#each SEQUENCER_STEPS as _, index (index)}
      <button
        class="step border emoji-sequencer"
        class:active={index === audio_sequencer.active_step_index}
        onclick={() => handleSeqClick(selected_sample, index)}
        onkeydown={() => handleSeqClick(selected_sample, index)}
      >
        {#if selected_sample.sequence[index]}
          {selected_sample.emoji}
        {:else}
          <span class="empty-step"></span>
        {/if}
      </button>
    {/each}
  {:else}
    <!-- Display placeholder steps when no sample is selected -->
    {#each SEQUENCER_STEPS as _, index (index)}
      <div
        class="placeholder-step border"
        class:active={index === audio_sequencer.active_step_index}
        role="button"
        tabindex="-1"
      ></div>
    {/each}
  {/if}
</div>

<style>
  .sequencer {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(2, 1fr); /* Add this for 2 rows of 8 steps */
    gap: var(--spacing);
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
    border-radius: 6px;
  }
</style>
