<!-- sequencer.svelte -->
<script lang="ts">
  import type { Sample } from '$lib/classes/audio-models.svelte'
  import type { AudioSequencer } from '$lib/classes/audio-sequencer.svelte'

  interface Props {
    samples: Sample[]
    selected_sample: Sample | undefined
    audio_sequencer: AudioSequencer
  }

  let { samples, selected_sample, audio_sequencer }: Props = $props()

  function handleSeqClick(sample: Sample, step_index: number) {
    sample.sequence[step_index] = !sample.sequence[step_index]
  }

  // Create an array of 16 items to represent the sequencer steps
  const sequencerSteps = Array(16).fill(null)
</script>

<div class="sequencer">
  {#if selected_sample}
    {#each sequencerSteps as _, index}
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
    {#each sequencerSteps as _, index}
      <div
        class="placeholder-step border"
        class:active={index === audio_sequencer.active_step_index}
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
  }
</style>
