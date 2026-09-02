<script lang="ts">
  import { packs } from '$lib/data/audio-packs'
  import { AVAILABLE_PITCHES } from '$lib/data/audio-config'

  import { Sample } from '$lib/audio-classes/sample.svelte'
  import { AudioContext } from '$lib/audio-classes/audio-context.svelte'
  import { AudioLoader } from '$lib/audio-classes/audio-loader.svelte'
  import { MainAudioBus, type MainAudioBusConfig } from '$lib/audio-classes/main-audio-bus.svelte'
  import { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte'

  import type { Note } from 'tone/build/esm/core/type/NoteUnits'

  import FontLoadingMessage from '$lib/components/font-loading-message.svelte'
  import IntroAudioContextPrompt from '$lib/components/intro-audio-context-prompt.svelte'
  import AudioPromptDenied from '$lib/components/audio-prompt-denied.svelte'
  import AppSettings from '$lib/components/app-settings.svelte'
  import Display from '$lib/components/display.svelte'
  import Samples from '$lib/components/samples.svelte'
  import SequencerUI from '$lib/components/sequencer-ui.svelte'
  import TransportAndMainSettings from '$lib/components/transport-and-main-settings.svelte'
  import KeyboardHandler from '$lib/components/keyboard-handler.svelte'
  import KeyboardControlsHelp from '$lib/components/keyboard-controls-help.svelte'

  import {
    loadColorSettings,
    getDefaultColorSettings,
    applyColorSettingsToDOM
  } from '$lib/utils/colour'
  import { loadShortcutsEnabled, saveShortcutsEnabled } from '$lib/utils/shortcuts'
  import { getPatternFromURL, type PatternData } from '$lib/utils/pattern-sharing'
  import { FeedbackState } from '$lib/utils/feedback-state.svelte'

  // create audio context, main bus, and sequencer instances
  const main_audio_bus_config: MainAudioBusConfig = {
    highpass_freq: 500,
    distortion_init: 0,
    distortion_wet_amount: 0.8,
    analyser_resolution: 256,
    compressor_threshold: -6,
    compressor_attack: 0.05,
    compressor_release: 0.15,
    bit_crusher_bits: 4
  }

  const pitches = AVAILABLE_PITCHES

  const audio_context = new AudioContext()
  const audio_loader = new AudioLoader()
  const main_audio_bus = new MainAudioBus(main_audio_bus_config)
  const sequencer = new AudioSequencer()
  const feedback_state = new FeedbackState()

  let samples: Sample[] = $state([])
  let selected_sample: Sample | undefined = $state(undefined)
  let pending_pattern_data: PatternData | null = $state(null)
  let preview_samples_active: boolean = $state(true)
  let show_keyboard_help: boolean = $state(false)
  let shortcuts_enabled: boolean = $state(loadShortcutsEnabled())

  // track loading and permission states to control UI
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

  // colour settings are owned here at startup, then handed to AppSettings via prop
  const color_settings = loadColorSettings() ?? getDefaultColorSettings()
  applyColorSettingsToDOM(color_settings)

  // lifecycle: fonts → audio prompt → load samples → ready
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.fonts.ready.then(() => {
        pending_pattern_data = getPatternFromURL()

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
      // announced via the global-feedback live region
      feedback_state.showConfirmation('beatjie ready')
    }
  })

  // URL pattern sharing. apply shared pattern after samples are loaded
  $effect(() => {
    if (app_state['app-ready'] && pending_pattern_data) {
      applyPatternToState(pending_pattern_data)
      pending_pattern_data = null
    }
  })

  // persist the single-key shortcut preference
  $effect(() => {
    saveShortcutsEnabled(shortcuts_enabled)
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
      sample.toggleDelay(sample_data.delay_active)
      sample.toggleReverb(sample_data.reverb_active)
      sample.toggleMute(sample_data.muted)
    })

    sequencer.makeSequences(samples)
  }

  async function loadAndConfigureAudio() {
    samples = await audio_loader.processPacks(packs)
    await audio_loader.connectSamplesToMainChannel(samples, main_audio_bus.mainChannel)
    sequencer.makeSequences(samples)
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

<main>
  <div class="app" class:border={!app_state['fonts-loading']}>
    {#if app_state['fonts-loading']}
      <FontLoadingMessage />
    {:else if app_state['audio-prompt'] || app_state['audio-loading']}
      <IntroAudioContextPrompt
        {handleAudioConfirm}
        {handleAudioDeny}
        loading={app_state['audio-loading']}
      />
    {:else if app_state['audio-prompt-denied']}
      <AudioPromptDenied />
    {:else if app_state['app-ready']}
      <h1 class="sr-only">beatjie</h1>
      <KeyboardHandler
        {sequencer}
        {main_audio_bus}
        {samples}
        {packs}
        {pitches}
        bind:selected_sample
        bind:selected_pack_index
        bind:preview_samples_active
        enabled={shortcuts_enabled}
        paused={show_keyboard_help}
        onToggleHelp={() => (show_keyboard_help = !show_keyboard_help)}
      />
      <AppSettings
        {main_audio_bus}
        {sequencer}
        {samples}
        {selected_pack_index}
        {feedback_state}
        {color_settings}
        onShowHelp={() => (show_keyboard_help = true)}
      />
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

      {#if show_keyboard_help}
        <KeyboardControlsHelp
          onclose={() => (show_keyboard_help = false)}
          bind:shortcuts_enabled
          can_toggle_shortcuts
        />
      {/if}
    {/if}
  </div>
</main>

<style>
  main {
    min-height: 100%;
    display: grid;
    place-items: center;
  }

  /* the panel sizes itself from vmin-based content; on short viewports or at high zoom the
     page scrolls rather than clipping (WCAG 1.4.10). the min-height only matters for the
     intro/loading states, whose content is absolutely positioned */
  .app {
    position: relative;
    min-width: 360px;
    max-width: 98vw;
    min-height: min(600px, 96vh);
    padding: 0.7%;
  }
</style>
