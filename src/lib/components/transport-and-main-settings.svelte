<!-- transport-and-main-settings.svelte -->
<script lang="ts">
  import BPMSelector from '$lib/components/bpm-selector.svelte';
  import type { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte';
  import type { MainAudioBus } from '$lib/audio-classes/main-audio-bus.svelte';
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte';

  interface Props {
    sequencer: AudioSequencer;
    main_audio_bus: MainAudioBus;
    feedback_state: FeedbackState;
  }

  let { sequencer, main_audio_bus, feedback_state }: Props = $props();

  async function toggleSeqPlayback() {
    await sequencer.togglePlayback();
  }
</script>

<div class="transport-and-main-settings">
  <div class="transport">
    <button
      class="emoji-large border"
      onmouseenter={() =>
        feedback_state.showTooltip(sequencer.is_playing ? 'pattern stop' : 'pattern play')}
      onmouseleave={() => feedback_state.clear()}
      onclick={() => toggleSeqPlayback()}
    >
      {sequencer.is_playing ? '⏹' : '▶'}
    </button>
  </div>

  <div class="main-settings">
    <button
      class="emoji-large border"
      class:active={main_audio_bus.mainIsHighPassed}
      onmouseenter={() => feedback_state.showTooltip('pattern high-pass')}
      onmouseleave={() => feedback_state.clear()}
      onclick={() => main_audio_bus.toggleMainHighPass(!main_audio_bus.mainIsHighPassed)}
    >
      🫴
    </button>
    <button
      class="emoji-large border"
      class:active={main_audio_bus.mainIsDistorted}
      onmouseenter={() => feedback_state.showTooltip('pattern distort')}
      onmouseleave={() => feedback_state.clear()}
      onclick={() => main_audio_bus.toggleMainDistortion(!main_audio_bus.mainIsDistorted)}
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
      <BPMSelector {sequencer} />
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
