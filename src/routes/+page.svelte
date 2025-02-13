<!-- +page.svelte -->
<script lang="ts">
  // === IMPORTS ==============================

  // === Tone
  import * as Tone from 'tone'

  // === Data
  import { packs } from '$lib/audio/audio-packs'

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
  import ColourSelector from '$lib/components/colour-selector.svelte'
  import Display from '$lib/components/display.svelte'
  import Packs from '$lib/components/packs.svelte'
  import SelectedSampleSettings from '$lib/components/selected-sample-settings.svelte'
  import Sequencer from '$lib/components/sequencer.svelte'
  import TransportAndMainSettings from '$lib/components/transport-and-main-settings.svelte'

  // === BINDINGS ============================

  // === Audio
  const chain_config: ChainConfig = $state({
    highpass_freq: 500,
    distortion_init: 0.2,
    distortion_amount: 0.9,
    analyser_resolution: 256,
    compressor_threshold: -12,
    compressor_attack: 0.05,
    compressor_release: 0.15,
    bit_crusher_bits: 4,
  })

  const pitches = ['C2', 'E2', 'F2', 'C1']

  let audio_engine = new AudioEngine()
  let audio_data_to_code = new AudioDataToCode()
  let audio_chain = new AudioChain(chain_config)
  let audio_sequencer = new AudioSequencer()

  let SAMPLES: Sample[] = $state([])

  let selected_sample: Sample | undefined = $state(undefined)

  // todo: decide on this
  let preview_samples_active: boolean = $state(true)

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

  // === FUNCTIONS ================================

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

  // === Audio

  async function audioDataToCode() {
    SAMPLES = await audio_data_to_code.processPacks(packs)
    audio_chain.setChains(SAMPLES)
    audio_sequencer.makeSequences(SAMPLES)
  }

  function handleSampleClick(sample: Sample | undefined) {
    if (!sample) return

    function selectSample(sample_id: number) {
      selected_sample = SAMPLES.find((s) => s.id === sample_id)
    }

    function triggerSample(sample: Sample | undefined) {
      if (audio_engine.isInitialised() && sample) {
        sample.play(Tone.now())
      }
    }

    selectSample(sample.id)

    if (preview_samples_active) {
      triggerSample(sample)
    }
  }

  function handleSeqClick(sample: Sample, step_index: number) {
    sample.sequence[step_index] = !sample.sequence[step_index]
  }

  $effect(() => {
    return () => {
      audio_sequencer.dispose()
      audio_chain.dispose()
      audio_engine.dispose()
    }
  })

  // === VISUALS ================================
  // === Display
  let analysis_values: Float32Array | Float32Array[] = $state([])

  $effect(() => {
    function updateAnalysis() {
      analysis_values = audio_chain.getAnalyserValues()
      requestAnimationFrame(updateAnalysis)
    }

    updateAnalysis()

    return () => {
      analysis_values = []
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
      <ColourSelector />
      <Display {analysis_values} {selected_sample} />
      <Packs {packs} {SAMPLES} {handleSampleClick} {selected_sample} />
      {#if selected_sample}
        <SelectedSampleSettings {selected_sample} {pitches} {audio_chain} />
        <Sequencer
          {SAMPLES}
          {selected_sample}
          {audio_sequencer}
          {handleSeqClick}
        />
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
    aspect-ratio: 4/6.9;
    overflow: hidden;
    padding: 0.4%;
    grid-template-rows: auto auto 1fr auto auto;
  }
</style>
