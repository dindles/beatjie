<!-- transport-and-main-settings.svelte -->
<script lang="ts">
  import BPMSelector from '$lib/components/bpm-selector.svelte';
  import type { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte';
  import type { AudioChain } from '$lib/audio-classes/audio-chain.svelte';
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte';

  interface Props {
    audio_sequencer: AudioSequencer;
    audio_chain: AudioChain;
    feedback_state: FeedbackState;
  }

  let { audio_sequencer, audio_chain, feedback_state }: Props = $props();

  async function toggleSeqPlayback() {
    await audio_sequencer.togglePlayback();
  }
</script>

<div class="transport-and-main-settings">
  <div class="transport">
    <button
      class="emoji-large border"
      onmouseenter={() =>
        feedback_state.showTooltip(audio_sequencer.is_playing ? 'pattern stop' : 'pattern play')}
      onmouseleave={() => feedback_state.clear()}
      onclick={() => toggleSeqPlayback()}
    >
      {audio_sequencer.is_playing ? '⏹' : '▶'}
    </button>
  </div>

  <div class="main-settings">
    <button
      class="emoji-large border"
      class:active={audio_chain.mainIsHighPassed}
      onmouseenter={() => feedback_state.showTooltip('pattern high-pass')}
      onmouseleave={() => feedback_state.clear()}
      onclick={() => audio_chain.toggleMainHighPass(!audio_chain.mainIsHighPassed)}
    >
      🫴
    </button>
    <button
      class="emoji-large border"
      class:active={audio_chain.mainIsDistorted}
      onmouseenter={() => feedback_state.showTooltip('pattern distort')}
      onmouseleave={() => feedback_state.clear()}
      onclick={() => audio_chain.toggleMainDistortion(!audio_chain.mainIsDistorted)}
    >
      💥
    </button>

    <div
      class="bpm-control border"
      role="group"
      aria-label="BPM control"
      onmouseenter={() => feedback_state.showTooltip('pattern BPM')}
      onmouseleave={() => feedback_state.clear()}
    >
      <BPMSelector {audio_sequencer} />
    </div>
  </div>
</div>

<style>
  .transport-and-main-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    margin-top: 0.4em;
    margin-bottom: 0.2em;
  }

  .transport {
    display: grid;
    grid-template-columns: 1fr;
  }

  .main-settings {
    grid-column: span 3;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing);
  }

  .bpm-control {
    aspect-ratio: 1;
    height: 100%;
  }
</style>
