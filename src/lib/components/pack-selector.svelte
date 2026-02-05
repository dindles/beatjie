<script lang="ts">
  import type { Packs } from '$lib/types/audio-types'
  import type { Sample } from '$lib/audio-classes/sample.svelte'
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte'

  let {
    packs,
    samples,
    selected_pack_index = $bindable(),
    feedback_state
  }: {
    packs: Packs
    samples: Sample[]
    selected_pack_index: number
    feedback_state: FeedbackState
  } = $props()

  function selectPack(index: number) {
    selected_pack_index = index
  }
</script>

<div class="pack-select">
  <div
    class="pack-indicators"
    role="group"
    onmouseenter={() => feedback_state.showTooltip('pack select')}
    onmouseleave={() => feedback_state.clear()}
  >
    {#each packs as pack, index (pack.name)}
      <button
        class="pack-indicator border"
        class:active={index === selected_pack_index}
        class:playing={samples.some((sample) => sample.pack === pack.name && sample.is_playing)}
        onclick={() => selectPack(index)}
        aria-label={pack.name}
      ></button>
    {/each}
  </div>
</div>

<style>
  .pack-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .pack-indicators {
    display: flex;
    gap: var(--spacing);
    justify-content: flex-start;
  }

  .pack-indicator {
    aspect-ratio: 1;
    height: 2.2em;
    transition: all 0.1s ease;
    border-radius: 6px;
  }

  .pack-indicator.playing {
    transform: scale(1.1);
  }
</style>
