<script lang="ts">
  import * as Tone from 'tone'
  import { packs } from '$lib/data/audio-packs'
  import type { Note } from 'tone/build/esm/core/type/NoteUnits'
  import { Sample } from '$lib/audio-classes/sample.svelte'
  import { AudioContext } from '$lib/audio-classes/audio-context.svelte'
  import { AudioLoader } from '$lib/audio-classes/audio-loader.svelte'
  import { MainAudioBus, type MainAudioBusConfig } from '$lib/audio-classes/main-audio-bus.svelte'
  import { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte'

  import FontLoadingMessage from '$lib/components/font-loading-message.svelte'
  import IntroAudioContextPrompt from '$lib/components/intro-audio-context-prompt.svelte'
  import AudioPromptDenied from '$lib/components/audio-prompt-denied.svelte'
  import AudioLoadingMessage from '$lib/components/audio-loading-message.svelte'
  import AppSettings from '$lib/components/app-settings.svelte'
  import Display from '$lib/components/display.svelte'
  import Samples from '$lib/components/samples.svelte'
  import SequencerUI from '$lib/components/sequencer-ui.svelte'
  import TransportAndMainSettings from '$lib/components/transport-and-main-settings.svelte'
  import {
    loadColorSettings,
    getDefaultColorSettings,
    applyColorSettingsToDOM
  } from '$lib/utils/colour'
  import { getPatternFromURL, type PatternData } from '$lib/utils/pattern-sharing'
  import { FeedbackState } from '$lib/utils/feedback-state.svelte'

  // create audio context, main bus, and sequencer instances
  const main_audio_bus_config: MainAudioBusConfig = $state({
    highpass_freq: 500,
    distortion_init: 0,
    distortion_wet_amount: 0.8,
    analyser_resolution: 256,
    compressor_threshold: -6,
    compressor_attack: 0.05,
    compressor_release: 0.15,
    bit_crusher_bits: 4
  })

  const pitches = ['C2', 'E2', 'F2', 'C1']

  let audio_context = new AudioContext()
  let audio_loader = new AudioLoader()
  let main_audio_bus = new MainAudioBus(main_audio_bus_config)
  let sequencer = new AudioSequencer()
  let feedback_state = new FeedbackState()

  let samples: Sample[] = $state([])
  let selected_sample: Sample | undefined = $state(undefined)
  let pending_pattern_data: PatternData | null = $state(null)
  let preview_samples_active: boolean = $state(true)

  // track loading and permission states to control UI flow
  interface AppState {
    'fonts-loading': boolean
    'audio-prompt': boolean
    'audio-prompt-denied': boolean
    'audio-loading': boolean
    'app-ready': boolean
  }

  let app_state: AppState = $state({
    'fonts-loading': true,
    'audio-prompt': false,
    'audio-prompt-denied': false,
    'audio-loading': false,
    'app-ready': false
  })

  let selected_pack_index: number = $state(Math.floor(Math.random() * packs.length))

  // keyboard controls
  const key_map: Record<string, number> = {
    q: 0,
    w: 1,
    e: 2,
    r: 3,
    a: 4,
    s: 5,
    d: 6,
    f: 7
  }

  async function handleKeydown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault()
      await sequencer.togglePlayback()
    }

    // 1-4: pack selection
    const pack_number = parseInt(event.key)
    if (pack_number >= 1 && pack_number <= 4) {
      selected_pack_index = pack_number - 1
      return
    }

    // qwer/asdf: sample selection
    const sample_index = key_map[event.key.toLowerCase()]
    if (sample_index !== undefined) {
      const visible_samples = samples.filter((s) => s.pack === packs[selected_pack_index].name)
      const sample = visible_samples[sample_index]
      if (sample) {
        sample.play(Tone.now())
        selected_sample = sample
      }
    }

    // p: preview toggle
    if (event.key.toLowerCase() === 'p') {
      preview_samples_active = !preview_samples_active
      return
    }

    // zxcv: sample effects (mute, pitch, delay, reverb)
    if (selected_sample) {
      switch (event.key.toLowerCase()) {
        case 'z':
          selected_sample.toggleMute(!selected_sample.is_muted)
          break
        case 'x': {
          const current_index = pitches.indexOf(selected_sample.pitch)
          const next_index = (current_index + 1) % pitches.length
          selected_sample.pitch = pitches[next_index] as typeof selected_sample.pitch
          break
        }
        case 'c':
          selected_sample.toggleDelay(!selected_sample.delay_is_active)
          break
        case 'v':
          selected_sample.toggleReverb(!selected_sample.reverb_is_active)
          break
      }
    }

    // bn: global effects (highpass, distortion)
    if (event.key.toLowerCase() === 'b') {
      main_audio_bus.toggleMainHighPass(!main_audio_bus.mainIsHighPassed)
    }
    if (event.key.toLowerCase() === 'n') {
      main_audio_bus.toggleMainDistortion(!main_audio_bus.mainIsDistorted)
    }

    // arrows: BPM
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const new_bpm = Math.min(200, sequencer.getBPM() + 1)
      sequencer.setBPM(new_bpm)
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const new_bpm = Math.max(60, sequencer.getBPM() - 1)
      sequencer.setBPM(new_bpm)
    }
  }

  // state: fonts → colors → audio prompt → load samples → ready
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.fonts.ready.then(() => {
        pending_pattern_data = getPatternFromURL()
        const saved_colors = loadColorSettings() ?? getDefaultColorSettings()
        applyColorSettingsToDOM(saved_colors)

        if (pending_pattern_data) {
          selected_pack_index = pending_pattern_data.selected_pack_index
        }

        app_state['fonts-loading'] = false
        console.log(
          '%cp.l.u.r.\n\n%chttps://github.com/dindles/beatjie\n\nhttps://dindles.net',
          'font-size: 12px; font-weight: bold;',
          'font-size: 12px; color: gray;'
        )
        app_state['audio-prompt'] = true
      })
    }
  })

  async function handleAudioConfirm() {
    await audio_context.initAudioContext()
    app_state['audio-prompt'] = false
    app_state['audio-loading'] = true
  }

  function handleAudioDeny() {
    app_state['audio-prompt'] = false
    app_state['audio-prompt-denied'] = true
  }

  $effect(() => {
    if (app_state['audio-loading']) {
      loadAndConfigureAudio().catch((error) => {
        console.error('Failed to load audio data:', error)
        app_state['audio-loading'] = false
        feedback_state.show('audio failed to load — try refreshing', 10000)
      })
    }
  })

  $effect(() => {
    if (app_state['audio-loading'] && audio_loader.buffersAreLoaded() && samples.length > 0) {
      app_state['audio-loading'] = false
      app_state['app-ready'] = true
    }
  })

  // URL pattern sharing: apply shared pattern once audio is loaded
  $effect(() => {
    if (app_state['app-ready'] && pending_pattern_data) {
      applyPatternToState(pending_pattern_data)
      pending_pattern_data = null
    }
  })

  function applyPatternToState(pattern: PatternData) {
    sequencer.setBPM(pattern.bpm)
    main_audio_bus.toggleMainHighPass(pattern.main_highpass)
    main_audio_bus.toggleMainDistortion(pattern.main_distortion)

    pattern.samples.forEach((sample_data) => {
      const sample = samples.find((s) => s.id === sample_data.id)
      if (!sample) return

      sample.sequence = [...sample_data.sequence]
      sample.pitch = sample_data.pitch as Note
      sample.delay_is_active = sample_data.delay_active
      sample.reverb_is_active = sample_data.reverb_active
      sample.is_muted = sample_data.muted
      sample.toggleDelay(sample_data.delay_active)
      sample.toggleReverb(sample_data.reverb_active)
      sample.toggleMute(sample_data.muted)
    })

    sequencer.makeSequences(samples)
  }

  async function loadAndConfigureAudio() {
    samples = await audio_loader.processPacks(packs)
    await audio_loader.connectSamplesToMainChannel(samples, main_audio_bus.mainChannel)
    await sequencer.makeSequences(samples)
  }

  // cleanup on unmount
  $effect(() => {
    return () => {
      sequencer.dispose()
      samples.forEach((sample) => sample.dispose())
      main_audio_bus.dispose()
      audio_loader.dispose()
      audio_context.dispose()
    }
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<main>
  <div class="app" class:border={app_state['app-ready']}>
    {#if app_state['fonts-loading']}
      <FontLoadingMessage />
    {:else if app_state['audio-prompt']}
      <IntroAudioContextPrompt {handleAudioConfirm} {handleAudioDeny} />
    {:else if app_state['audio-prompt-denied']}
      <AudioPromptDenied />
    {:else if app_state['audio-loading']}
      <AudioLoadingMessage />
    {:else if app_state['app-ready']}
      <AppSettings {main_audio_bus} {sequencer} {samples} {selected_pack_index} {feedback_state} />
      <Display {main_audio_bus} {feedback_state} />
      <Samples
        {pitches}
        {packs}
        {samples}
        {audio_context}
        {feedback_state}
        bind:selected_sample
        bind:selected_pack_index
        bind:preview_samples_active
      />
      <SequencerUI {selected_sample} {sequencer} {feedback_state} />
      <TransportAndMainSettings {sequencer} {main_audio_bus} {feedback_state} />
    {/if}
  </div>
</main>

<style>
  main {
    height: 100%;
    display: grid;
    place-items: center;
  }

  .app {
    position: relative;
    min-width: 360px;
    max-width: 98vw;
    min-height: 600px;
    max-height: 88vh;
    overflow: hidden;
    padding: 0.7%;
  }
</style>
