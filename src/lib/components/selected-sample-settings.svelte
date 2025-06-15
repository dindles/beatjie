<script lang="ts">
  import type { Sample } from '$lib/classes/audio-models.svelte'
  import type { AudioChain } from '$lib/classes/audio-chain.svelte'

  type Props = {
    selected_sample: Sample | undefined
    pitches: string[]
    audio_chain: AudioChain
  }

  let { selected_sample, pitches, audio_chain }: Props = $props()

  let pitch_emoji_rotation = $derived.by(() => {
    if (!selected_sample) return 0
    const pitchIndex = pitches.indexOf(selected_sample.pitch)
    return pitchIndex * 90
  })

  function loopSamplePitch() {
    if (!selected_sample) {
      console.log('No sample selected')
      return
    }

    const currentIndex = pitches.indexOf(selected_sample.pitch)
    const nextIndex = (currentIndex + 1) % pitches.length
    // hacky typescript business?
    selected_sample.pitch = pitches[nextIndex] as typeof selected_sample.pitch
  }

  function toggleSampleMute() {
    if (!selected_sample) return
    audio_chain.toggleSampleMute(selected_sample, !selected_sample.is_muted)
    selected_sample.is_muted = !selected_sample.is_muted
  }

  function toggleSampleDelay() {
    if (!selected_sample) return
    audio_chain.toggleSampleDelay(
      selected_sample,
      !selected_sample.delay_is_active
    )
    selected_sample.delay_is_active = !selected_sample.delay_is_active
  }

  function toggleSampleReverb() {
    if (!selected_sample) return
    audio_chain.toggleSampleReverb(
      selected_sample,
      !selected_sample.reverb_is_active
    )
    selected_sample.reverb_is_active = !selected_sample.reverb_is_active
  }
</script>

<div class="selected-sample-settings">
  <button class="emoji-large" onclick={() => toggleSampleMute()}
    >{selected_sample?.is_muted ? '🔇' : '🔊'}</button
  >
  <button
    class="selected-sample-pitch emoji-large"
    style="transform: rotate({pitch_emoji_rotation}deg)"
    onclick={() => {
      loopSamplePitch()
    }}
  >
    🎵
  </button>
  <button
    class="emoji-large delay"
    class:active={selected_sample?.delay_is_active}
    onclick={toggleSampleDelay}
  >
    🪞
  </button>
  <button
    class="emoji-large reverb"
    class:active={selected_sample?.reverb_is_active}
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
