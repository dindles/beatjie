<!-- +page.svelte -->
<script lang="ts">
  // === IMPORTS ==============================

  // === Data
  import { packs } from '$lib/data/audio-packs'

  // === Audio types & classes
  import { Sample } from '$lib/audio/audio-models.svelte'
  import { AudioEngine } from '$lib/audio/audio-engine.svelte'
  import { AudioDataToCode } from '$lib/audio/audio-data-to-code.svelte'
  import { AudioChain, type ChainConfig } from '$lib/audio/audio-chain.svelte'
  import { AudioSequencer } from '$lib/audio/audio-sequencer.svelte'

  // === Svelte components
  import FontLoadingMessage from '$lib/components/font-loading-message.svelte'
  import AudioContextPrompt from '$lib/components/audio-context-prompt.svelte'
  import AudioPromptDenied from '$lib/components/audio-prompt-denied.svelte'
  import AudioLoadingMessage from '$lib/components/audio-loading-message.svelte'
  import HelpOverlay from '$lib/components/help-overlay.svelte'
  import AppSettings from '$lib/components/app-settings.svelte'
  import UserActivityPrompt from '$lib/components/user-activity-prompt.svelte'
  import Display from '$lib/components/display.svelte'
  import Samples from '$lib/components/samples.svelte'
  import SelectedSampleSettings from '$lib/components/selected-sample-settings.svelte'
  import Sequencer from '$lib/components/sequencer.svelte'
  import TransportAndMainSettings from '$lib/components/transport-and-main-settings.svelte'

  // === BINDINGS ============================

  // === Audio
  const chain_config: ChainConfig = $state({
    highpass_freq: 500,
    distortion_init: 0.2,
    distortion_amount: 1,
    analyser_resolution: 256,
    compressor_threshold: -6,
    compressor_attack: 0.05,
    compressor_release: 0.15,
    bit_crusher_bits: 4,
  })

  const pitches = ['C2', 'E2', 'F2', 'C1']

  let audio_engine = new AudioEngine()
  let audio_data_to_code = new AudioDataToCode()
  let audio_chain = new AudioChain(chain_config)
  let audio_sequencer = new AudioSequencer()

  let samples: Sample[] = $state([])
  let selected_sample: Sample | undefined = $state(undefined)

  // === State
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
    'app-ready': false,
  })

  let help_overlay_active = $state(false)

  // === LIFECYCLE ================================

  // === State
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.fonts.ready.then(() => {
        app_state['fonts-loading'] = false
        console.log('fonts loaded')
        app_state['audio-prompt'] = true
      })
    }
  })

  async function handleAudioConfirm() {
    await audio_engine.initAudioContext()
    app_state['audio-prompt'] = false
    app_state['audio-loading'] = true
  }

  function handleAudioDeny() {
    app_state['audio-prompt'] = false
    app_state['audio-prompt-denied'] = true
  }

  $effect(() => {
    if (app_state['audio-loading']) {
      audioDataToCode()
    }
  })

  $effect(() => {
    if (app_state['audio-loading'] && audio_data_to_code.buffersAreLoaded()) {
      app_state['audio-loading'] = false
      app_state['app-ready'] = true
    }
  })

  // === Load data
  async function audioDataToCode() {
    samples = await audio_data_to_code.processPacks(packs)
    audio_chain.setChains(samples)
    audio_sequencer.makeSequences(samples)
  }

  // === Cleanup
  $effect(() => {
    return () => {
      audio_sequencer.dispose()
      audio_chain.dispose(samples)
      audio_engine.dispose()
    }
  })
</script>

<main>
  <div class="app border">
    {#if app_state['fonts-loading']}
      <FontLoadingMessage />
    {:else if app_state['audio-prompt']}
      <AudioContextPrompt {handleAudioConfirm} {handleAudioDeny} />
    {:else if app_state['audio-prompt-denied']}
      <AudioPromptDenied />
    {:else if app_state['audio-loading']}
      <AudioLoadingMessage />
    {:else if app_state['app-ready']}
      {#if help_overlay_active}
        <HelpOverlay bind:help_overlay_active />
      {/if}
      <AppSettings bind:help_overlay_active {audio_sequencer} {samples} />
      <Display {audio_chain}>
        {#if !selected_sample}
          <UserActivityPrompt />
        {/if}
      </Display>
      <Samples {packs} {samples} {audio_engine} bind:selected_sample />
      {#if selected_sample}
        <SelectedSampleSettings {selected_sample} {pitches} {audio_chain} />
        <Sequencer {samples} {selected_sample} {audio_sequencer} />
        <TransportAndMainSettings {audio_sequencer} {audio_chain} />
      {/if}
    {/if}
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    display: grid;
    place-items: center;
  }

  .app {
    aspect-ratio: 4/6.6;
    overflow: hidden;
    padding: 0.4%;
    grid-template-rows: auto auto 1fr auto auto;
  }
</style>
