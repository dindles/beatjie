<script lang="ts">
  import type { Sample } from '$lib/audio/audio-models.svelte'
  import type { AudioSequencer } from '$lib/audio/audio-sequencer.svelte'

  interface Props {
    samples: Sample[]
    selected_sample: Sample | undefined
    audio_sequencer: AudioSequencer
  }
  let { samples, selected_sample, audio_sequencer }: Props = $props()

  function handleSeqClick(sample: Sample, step_index: number) {
    sample.sequence[step_index] = !sample.sequence[step_index]
  }
</script>

<div class="sequencer">
  {#each samples as sample}
    {#if sample.id === selected_sample?.id}
      {#each selected_sample.sequence as _, index}
        <button
          class="step border emoji-sequencer"
          class:active={index === audio_sequencer.active_step_index}
          onclick={() => handleSeqClick(sample, index)}
          onkeydown={() => handleSeqClick(sample, index)}
        >
          {#if selected_sample.sequence[index]}
            {selected_sample.emoji}
          {/if}
        </button>
      {/each}
    {/if}
  {/each}
</div>

<style>
  .sequencer {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: var(--spacing);
  }

  .emoji-sequencer {
    font-family: var(--font-emoji);
    font-size: var(--emoji-sequencer);
  }
</style>
