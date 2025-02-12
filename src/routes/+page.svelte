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
  import {
    AudioSequencer,
    type SequencerConfig,
  } from '$lib/audio/audio-sequencer.svelte'

  // === Svelte components
  import FontLoadingMessage from '$lib/components/font-loading-message.svelte'
  import AudioContextPrompt from '$lib/components/audio-context-prompt.svelte'
  import AudioPromptDenied from '$lib/components/audio-prompt-denied.svelte'
  import AudioLoadingMessage from '$lib/components/audio-loading-message.svelte'
  import ColourSelector from '$lib/components/colour-selector.svelte'
  import Display from '$lib/components/display.svelte'
  import Packs from '$lib/components/packs.svelte'
  import SelectedSampleSettings from '$lib/components/selected-sample-settings.svelte'
  import BPMSelector from '$lib/components/bpm-selector.svelte'

  // === BINDABLES ============================

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

  const sequencer_config: SequencerConfig = {
    bpm: 120,
  }

  const pitches = ['C2', 'E2', 'F2', 'C1']

  let audio_engine = new AudioEngine()
  let audio_data_to_code = new AudioDataToCode()
  let audio_chain = new AudioChain(chain_config)
  let audio_sequencer = new AudioSequencer(sequencer_config)

  let SAMPLES: Sample[] = $state([])

  let selected_sample: Sample | undefined = $state(undefined)
  let preview_samples_active: boolean = $state(true)

  // todo: this should be in sequencer class
  let bpm: number = $state(sequencer_config.bpm)

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

  $effect(() => {
    if (app_state['audio-loading']) {
      audioDataToCode()
    }
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

  $effect(() => {
    if (app_state['audio-loading'] && audio_data_to_code.buffersAreLoaded()) {
      app_state['audio-loading'] = false
      app_state['app-ready'] = true
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

  // === Audio

  async function audioDataToCode() {
    SAMPLES = await audio_data_to_code.processPacks(packs)
    audio_chain.setChains(SAMPLES)
    audio_sequencer.makeSequences(SAMPLES)
  }

  function getSampleByID(sample_id: number) {
    return SAMPLES.find((s) => s.id === sample_id)
  }

  function handleSampleClick(sample: Sample | undefined) {
    if (!sample) return
    selectSample(sample.id)

    if (preview_samples_active) {
      triggerSample(sample)
    }

    function selectSample(sample_id: number) {
      selected_sample = getSampleByID(sample_id)
    }

    function triggerSample(sample: Sample | undefined) {
      if (audio_engine.isInitialised() && sample) {
        sample.play(Tone.now())
      }
    }
  }

  function handleSeqClick(sample: Sample, step_index: number) {
    sample.sequence[step_index] = !sample.sequence[step_index]
  }

  async function toggleSeqPlayback() {
    await audio_sequencer.togglePlayback()
  }

  function updateBPM(newBPM: number) {
    bpm = newBPM
    audio_sequencer.setBPM(bpm)
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

  // === css animations
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
      <Display {analysis_values}>
        {#if !selected_sample}
          <p class="sample-select-message text-xsmall">select a sample</p>
        {/if}
      </Display>
      <Packs {packs} {SAMPLES} {handleSampleClick} {selected_sample} />

      {#if selected_sample}
        <SelectedSampleSettings {selected_sample} {pitches} {audio_chain} />

        <div class="sequencer">
          {#each SAMPLES as sample}
            {#if sample.id === selected_sample?.id}
              {#each selected_sample.sequence as _, index}
                <button
                  class="step border emoji-sequencer"
                  class:active={index === audio_sequencer.active_step_index}
                  onclick={() => handleSeqClick(sample, index)}
                  onkeydown={() => handleSeqClick(sample, index)}
                >
                  {#if selected_sample.sequence[index]}
                    {selected_sample.emoji}
                  {/if}
                </button>
              {/each}
            {/if}
          {/each}
        </div>

        <div class="transport-and-main-settings">
          <div class="transport">
            <button class="emoji-large" onclick={() => toggleSeqPlayback()}
              >{audio_sequencer.is_playing ? '⏹' : '▶'}</button
            >
          </div>

          <div class="main-settings">
            <button
              class="emoji-large"
              onclick={() =>
                audio_chain.toggleMainHighPass(!audio_chain.mainIsHighPassed)}
              class:active={audio_chain.mainIsHighPassed}>🫴</button
            >
            <button
              class:active={audio_chain.mainIsDistorted}
              class="emoji-large"
              onclick={() =>
                audio_chain.toggleMainDistortion(!audio_chain.mainIsDistorted)}
              >💥</button
            >

            <div class="bpm-control">
              <BPMSelector bind:bpm {updateBPM} />
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</main>

<style>
  /* === layout === */
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

  .sample-select-message {
    font-size: var(--text-display);
    width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .sample-select-message {
    text-align: center;
    padding: var(--spacing);
  }

  .sequencer {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: var(--spacing);
  }

  .emoji-sequencer {
    font-family: var(--font-emoji);
    font-size: var(--emoji-sequencer);
  }

  .transport-and-main-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    margin-top: 0.4em;
    margin-bottom: 0.4em;
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
</style>
