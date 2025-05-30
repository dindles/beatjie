<script lang="ts">
  import * as Tone from 'tone'
  import type { Sample } from '$lib/classes/audio-models.svelte'
  import type { AudioSequencer } from '$lib/classes/audio-sequencer.svelte'
  import type { AudioChain } from '$lib/classes/audio-chain.svelte'

  interface Props {
    help_overlay_active: boolean
    audio_sequencer: AudioSequencer
    audio_chain: AudioChain
    samples: Sample[]
  }

  let {
    help_overlay_active = $bindable(),
    audio_sequencer,
    audio_chain,
    samples,
  }: Props = $props()

  const available_hues = [50, 100, 150, 200, 250, 300]
  let hue_emoji_rotation = $state(0)
  let user_lightness = $state(0.9) // 0 - 1
  const CHROMA = 0.2 // 0 - 0.4
  let user_hue = $state(
    available_hues[Math.floor(Math.random() * available_hues.length)]
  )
  let user_colour = $derived(`oklch(${user_lightness} ${CHROMA} ${user_hue})`)
  let black_or_white = $state('oklch(0 0 0)')
  let theme: 'light' | 'dark' = $state('light')
  let disco_toggle = $state(false)

  function deleteSequences() {
    audio_sequencer.stopPlayback()
    audio_sequencer.is_playing = false

    samples.forEach((sample: Sample) => {
      sample.sequence = new Array(sample.sequence.length).fill(false)
      sample.pitch = 'C2'
      audio_chain.toggleSampleDelay(sample, false)
      audio_chain.toggleSampleReverb(sample, false)
      sample.delay_is_active = false
      sample.reverb_is_active = false
    })

    audio_sequencer.makeSequences(samples)
  }

  function changeHue() {
    user_hue = user_hue + 50
    if (user_hue > 300) user_hue = 50
  }

  function changeTheme() {
    user_lightness = user_lightness === 0.9 ? 0.5 : 0.9
    theme = theme === 'light' ? 'dark' : 'light'
    black_or_white = theme === 'light' ? 'oklch(0 0 0)' : 'oklch(1 0 0)'
  }

  function toggleDisco() {
    disco_toggle = !disco_toggle
  }

  $effect(() => {
    if (disco_toggle) {
      const interval = Tone.getTransport().scheduleRepeat(() => {
        changeHue()
      }, '4n')
      return () => Tone.getTransport().clear(interval)
    }
  })

  // this is the piping that lets us apply reactive state to the app.css styles
  $effect(() => {
    document.documentElement.style.setProperty('--user-colour', user_colour)
    document.documentElement.style.setProperty(
      '--black-or-white',
      black_or_white
    )
  })
</script>

<div class="controls-container">
  <button class="delete emoji-small" onclick={deleteSequences}>🗑</button>

  <div class="color-controls">
    <button
      class="hue-control emoji-small"
      style="transform: rotate({hue_emoji_rotation}deg)"
      onclick={() => {
        hue_emoji_rotation += 90
        changeHue()
      }}>🎨</button
    >
    <button class="light-dark emoji-small" onclick={changeTheme}>
      {theme === 'light' ? '🤩' : '😎'}
    </button>
    <button
      class="emoji-small disco-ball {disco_toggle ? 'active' : ''}"
      onclick={toggleDisco}>🪩</button
    >
  </div>

  <div class="help-toggle">
    <button
      class="emoji-small"
      onclick={() => {
        help_overlay_active = !help_overlay_active
      }}>❓</button
    >
  </div>
</div>

<style>
  .controls-container {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.5rem;
  }

  .delete {
    margin-right: auto;
  }

  .color-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .hue-control {
    transition: transform 0.3s ease;
  }

  .help-toggle {
    margin-left: auto;
  }

  .disco-ball {
    transition: transform 0.3s ease;
    border-radius: var(--border-radius);
  }
</style>
