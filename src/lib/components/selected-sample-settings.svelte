<script lang="ts">
  import type { Sample } from '$lib/audio-classes/sample.svelte';
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte';

  type Props = {
    selected_sample: Sample | undefined;
    pitches: string[];
    feedback_state: FeedbackState;
  };

  let { selected_sample, pitches, feedback_state }: Props = $props();

  let pitch_emoji_rotation = $derived.by(() => {
    if (!selected_sample) return 0;
    const pitch_index = pitches.indexOf(selected_sample.pitch);
    return pitch_index * 90;
  });

  function loopSamplePitch() {
    if (!selected_sample) return;

    const current_index = pitches.indexOf(selected_sample.pitch);
    const next_index = (current_index + 1) % pitches.length;
    selected_sample.pitch = pitches[next_index] as typeof selected_sample.pitch;
  }

  function toggleSampleMute() {
    if (!selected_sample) return;
    selected_sample.toggleMute(!selected_sample.is_muted);
  }

  function toggleSampleDelay() {
    if (!selected_sample) return;
    selected_sample.toggleDelay(!selected_sample.delay_is_active);
  }

  function toggleSampleReverb() {
    if (!selected_sample) return;
    selected_sample.toggleReverb(!selected_sample.reverb_is_active);
  }
</script>

<div class="selected-sample-settings">
  <button
    class="emoji-large"
    onmouseenter={() => feedback_state.showTooltip('sample mute')}
    onmouseleave={() => feedback_state.clear()}
    onclick={() => toggleSampleMute()}
  >
    {selected_sample?.is_muted ? '🔇' : '🔊'}
  </button>
  <button
    class="selected-sample-pitch emoji-large"
    style="transform: rotate({pitch_emoji_rotation}deg)"
    onmouseenter={() => feedback_state.showTooltip('sample pitch')}
    onmouseleave={() => feedback_state.clear()}
    onclick={() => {
      loopSamplePitch();
    }}
  >
    🎵
  </button>
  <button
    class="emoji-large delay"
    class:active={selected_sample?.delay_is_active}
    onmouseenter={() => feedback_state.showTooltip('sample echo')}
    onmouseleave={() => feedback_state.clear()}
    onclick={toggleSampleDelay}
  >
    🪞
  </button>
  <button
    class="emoji-large reverb"
    class:active={selected_sample?.reverb_is_active}
    onmouseenter={() => feedback_state.showTooltip('sample reverb')}
    onmouseleave={() => feedback_state.clear()}
    onclick={toggleSampleReverb}
  >
    😶‍🌫️
  </button>
</div>

<style>
  .selected-sample-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    margin-top: 0.2rem;
    margin-bottom: 0.2rem;
  }

  .selected-sample-pitch {
    display: grid;
    place-items: center;
    transition: transform 0.3s ease;
    background-color: transparent;
  }

  .delay {
    border-radius: 4px;
  }

  .reverb {
    border-radius: 4px;
  }
</style>
