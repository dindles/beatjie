<script lang="ts">
  import type { Sample } from '$lib/audio-classes/sample.svelte'
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte'
  import { press } from '$lib/actions/pressAction'

  type Props = {
    selected_sample: Sample | undefined
    pitches: string[]
    feedback_state: FeedbackState
  }

  let { selected_sample, pitches, feedback_state }: Props = $props()

  let pitch_emoji_rotation = $derived.by(() => {
    if (!selected_sample) return 0
    const pitch_index = pitches.indexOf(selected_sample.pitch)
    return pitch_index * 90
  })

  function loopSamplePitch() {
    if (!selected_sample) return

    const current_index = pitches.indexOf(selected_sample.pitch)
    const next_index = (current_index + 1) % pitches.length
    selected_sample.pitch = pitches[next_index] as typeof selected_sample.pitch
  }

  function toggleSampleMute() {
    if (!selected_sample) return
    selected_sample.toggleMute(!selected_sample.is_muted)
  }

  function toggleSampleDelay() {
    if (!selected_sample) return
    selected_sample.toggleDelay(!selected_sample.delay_is_active)
  }

  function toggleSampleReverb() {
    if (!selected_sample) return
    selected_sample.toggleReverb(!selected_sample.reverb_is_active)
  }
</script>

<div class="selected-sample-settings">
  <button
    class="setting emoji-large"
    aria-label="mute sample"
    aria-pressed={selected_sample?.is_muted ?? false}
    onmouseenter={() => feedback_state.showTooltip('sample mute')}
    onmouseleave={() => feedback_state.clear()}
    onfocusin={() => feedback_state.showTooltip('sample mute')}
    onfocusout={() => feedback_state.clear()}
    use:press={() => toggleSampleMute()}
  >
    {selected_sample?.is_muted ? '🔇' : '🔊'}
  </button>
  <button
    class="setting emoji-large"
    aria-label="sample pitch{selected_sample ? `: ${selected_sample.pitch}` : ''}"
    onmouseenter={() => feedback_state.showTooltip('sample pitch')}
    onmouseleave={() => feedback_state.clear()}
    onfocusin={() => feedback_state.showTooltip('sample pitch')}
    onfocusout={() => feedback_state.clear()}
    use:press={() => loopSamplePitch()}
  >
    <span class="pitch-icon" style="transform: rotate({pitch_emoji_rotation}deg)">🎵</span>
  </button>
  <button
    class="setting emoji-large"
    class:active={selected_sample?.delay_is_active}
    aria-label="sample echo"
    aria-pressed={selected_sample?.delay_is_active ?? false}
    onmouseenter={() => feedback_state.showTooltip('sample echo')}
    onmouseleave={() => feedback_state.clear()}
    onfocusin={() => feedback_state.showTooltip('sample echo')}
    onfocusout={() => feedback_state.clear()}
    use:press={toggleSampleDelay}
  >
    🪞
  </button>
  <button
    class="setting emoji-large"
    class:active={selected_sample?.reverb_is_active}
    aria-label="sample reverb"
    aria-pressed={selected_sample?.reverb_is_active ?? false}
    onmouseenter={() => feedback_state.showTooltip('sample reverb')}
    onmouseleave={() => feedback_state.clear()}
    onfocusin={() => feedback_state.showTooltip('sample reverb')}
    onfocusout={() => feedback_state.clear()}
    use:press={toggleSampleReverb}
  >
    😶‍🌫️
  </button>
</div>

<style>
  .selected-sample-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    margin-top: 0.3rem;
    margin-bottom: 0.3rem;
  }

  /* per-sample controls: smaller hairline pads, a clear step down from the sample pads */
  .setting {
    width: 74%;
    justify-self: center;
    border: var(--stroke-hair) solid var(--user-colour);
    border-radius: var(--radius-step);
    font-size: calc(var(--emoji-large) * 0.78);
  }

  .pitch-icon {
    display: block;
    transition: transform 0.3s ease;
  }
</style>
