<!-- app-settings.svelte -->
<script lang="ts">
  import * as Tone from 'tone'
  import type { Sample } from '$lib/audio/audio-models.svelte'
  import type { AudioSequencer } from '$lib/audio/audio-sequencer.svelte'

  interface Props {
    help_overlay_active: boolean
    audio_sequencer: AudioSequencer
    samples: Sample[]
  }

  let {
    help_overlay_active = $bindable(),
    audio_sequencer,
    samples,
  }: Props = $props()

  let hue_emoji_rotation = $state(0)
  let user_lightness = $state(0.8) // 0 - 1
  const CHROMA = 0.2 // 0 - 0.4
  let user_hue = $state(250) // 0 - 360
  let user_colour = $derived(`oklch(${user_lightness} ${CHROMA} ${user_hue})`)
  let black_or_white = $state('oklch(0 0 0)')
  let theme = $state('light')
  let disco_toggle = $state(false)

  function deleteSequences() {
    audio_sequencer.stopPlayback()
    audio_sequencer.is_playing = false

    samples.forEach((sample: Sample) => {
      sample.sequence = new Array(sample.sequence.length).fill(false)
    })

    audio_sequencer.makeSequences(samples)
  }

  function changeHue() {
    user_hue = user_hue + 50
    if (user_hue > 300) user_hue = 50
  }

  function changeLightness() {
    user_lightness = user_lightness === 0.8 ? 0.5 : 0.8
  }

  function cycleTheme() {
    theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'disco' : 'light'
    black_or_white = theme === 'light' ? 'oklch(0 0 0)' : 'oklch(1 0 0)'
  }

  $effect(() => {
    if (theme === 'disco') {
      const interval = Tone.getTransport().scheduleRepeat(() => {
        black_or_white =
          black_or_white === 'oklch(0 0 0)' ? 'oklch(1 0 0)' : 'oklch(0 0 0)'
      }, '4n')
      return () => Tone.getTransport().clear(interval)
    }
  })

  $effect(() => {
    document.documentElement.style.setProperty('--user-colour', user_colour)
    document.documentElement.style.setProperty(
      '--black-or-white',
      theme === 'disco'
        ? disco_toggle
          ? user_colour
          : black_or_white
        : black_or_white
    )
  })
</script>

<div class="controls-container">
  <div class="help-toggle">
    <button
      class="emoji-small"
      onclick={() => {
        help_overlay_active = !help_overlay_active
      }}>❓</button
    >
  </div>

  <div class="color-controls">
    <button
      class="hue-control emoji-small"
      style="transform: rotate({hue_emoji_rotation}deg)"
      onclick={() => {
        hue_emoji_rotation += 90
        changeHue()
      }}>🎨</button
    >
    <button class="light-dark emoji-small" onclick={cycleTheme}>
      {theme === 'light' ? '🌞' : theme === 'dark' ? '🌛' : '🪩'}
    </button>
    <button class="emoji-small" onclick={changeLightness}
      >{user_lightness === 0.8 ? '🤩' : '😎'}</button
    >
  </div>

  <button class="delete emoji-small" onclick={deleteSequences}>🗑</button>
</div>

<style>
  .controls-container {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 1rem;
  }

  .delete {
    margin-left: auto;
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
    margin-right: auto;
  }
</style>
