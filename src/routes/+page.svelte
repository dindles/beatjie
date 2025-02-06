<!-- +page.svelte -->

<script lang="ts">
  // === IMPORTS ================================

  // Tone
  import * as Tone from 'tone'

  // Data
  import { packs } from '$lib/assets/audio/packs'

  // Audio types & classes
  import { Sample } from '$lib/audio/audio-models.svelte'
  import { AudioEngine } from '$lib/audio/audio-engine.svelte'
  import { AudioDataToCode } from '$lib/audio/audio-data-to-code.svelte'
  import { AudioChain, type ChainConfig } from '$lib/audio/audio-chain.svelte'
  import {
    AudioSequencer,
    type SequencerConfig,
  } from '$lib/audio/audio-sequencer.svelte'

  // Svelte components
  import BPMSelector from '$lib/components/bpm-selector.svelte'
  import Display from '$lib/components/display.svelte'

  // === AUDIO ================================

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

  const pitches = ['C2', 'G2', 'C3', 'C1']

  let audio_engine = new AudioEngine()
  let audio_data_to_code = new AudioDataToCode()
  let audio_chain = new AudioChain(chain_config)
  let audio_sequencer = new AudioSequencer(sequencer_config)

  let SAMPLES: Sample[] = $state([])
  let selected_pack_index: number = $state(0)
  let selected_sample: Sample | undefined = $state(undefined)
  let preview_samples_active: boolean = $state(true)

  // todo: this should be in sequencer class
  let active_step_index: number = $state(0)
  let bpm: number = $state(sequencer_config.bpm)

  // === STATE ================================
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

  // State

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

  // Audio

  async function handleAudioConfirm() {
    await audio_engine.initAudioContext()
    app_state['audio-prompt'] = false
    app_state['audio-loading'] = true
  }

  function handleAudioDeny() {
    app_state['audio-prompt'] = false
    app_state['audio-prompt-denied'] = true
  }

  async function audioDataToCode() {
    SAMPLES = await audio_data_to_code.processPacks(packs)
    audio_chain.setChains(SAMPLES)
  }

  function selectPack(direction: 'prev' | 'next' | 'random') {
    switch (direction) {
      case 'prev':
        selected_pack_index =
          (selected_pack_index - 1 + packs.length) % packs.length
        break
      case 'next':
        selected_pack_index = (selected_pack_index + 1) % packs.length
        break
      case 'random':
        selected_pack_index = Math.floor(Math.random() * packs.length)
        break
      default:
        console.error('Invalid direction for selectPack')
    }
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
    active_step_index = 0

    if (!audio_sequencer.is_playing) {
      audio_sequencer.makeSequences(SAMPLES, (step) => {
        active_step_index = step
      })
      await audio_sequencer.togglePlayback()
    } else {
      await audio_sequencer.togglePlayback()
    }

    audio_sequencer.is_playing = !audio_sequencer.is_playing
  }

  function loopSamplePitch() {
    if (!selected_sample) {
      console.log('No sample selected')
      return
    }

    const currentIndex = pitches.indexOf(selected_sample.pitch)
    const nextIndex = (currentIndex + 1) % pitches.length
    // hacky typescript business
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

  function updateBPM(newBPM: number) {
    bpm = newBPM
    audio_sequencer.setBPM(bpm)
  }

  $effect(() => {
    if (app_state['audio-loading']) {
      audioDataToCode()
    }
  })

  $effect(() => {
    return () => {
      audio_sequencer.dispose()
      audio_chain.dispose()
      audio_engine.dispose()
    }
  })

  // VISUALS ================================
  // Display
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

  // Colour
  let user_lightness = $state(0.8) //0-100%
  const chroma = 0.2 //0-0.4
  let user_hue = $state(250) //0-360

  let user_colour = $derived(`oklch(${user_lightness} ${chroma} ${user_hue})`)

  let black_or_white = $state('oklch(0 0 0)') // black

  function changeHue() {
    user_hue = user_hue + 50
    if (user_hue > 300) {
      user_hue = 50
    }
  }

  function changeLightness() {
    user_lightness = user_lightness === 0.8 ? 0.4 : 0.8
  }

  function switchLightDark() {
    black_or_white =
      black_or_white === 'oklch(1 0 0)' ? 'oklch(0 0 0)' : 'oklch(1 0 0)'
  }

  // sets css variables (defined in app.css)
  $effect(() => {
    document.documentElement.style.setProperty('--user-colour', user_colour)
    document.documentElement.style.setProperty(
      '--black-or-white',
      black_or_white
    )
  })

  // css animations
  let hue_emoji_rotation = $state(0)

  let pitch_emoji_rotation = $derived.by(() => {
    if (!selected_sample) return 0
    const pitchIndex = pitches.indexOf(selected_sample.pitch)
    return pitchIndex * 90 // 90 degrees per pitch
  })
</script>

<main>
  <div class="app border">
    {#if app_state['fonts-loading']}
      <div class="font-loading">
        <p class="text-small fonts-loading-message">loading fonts...</p>
      </div>
    {:else if app_state['audio-prompt']}
      <div class="audio-context-prompt">
        <p class="text-small">
          this page <br />uses audio. <br />is that ok?
        </p>
        <div>
          <button class="emoji-small" onclick={handleAudioConfirm}>👍</button>
          <button class="emoji-small" onclick={handleAudioDeny}>👎</button>
        </div>
      </div>
    {:else if app_state['audio-prompt-denied']}
      <div class="audio-prompt-denied">
        <p class="emoji-small audio-denied-message">
          <a href="https://wikipedia.org">👋</a>
        </p>
      </div>
    {:else if app_state['audio-loading']}
      <div class="audio-loading">
        <p class="text-small audio-loading-message">loading audio...</p>
      </div>
    {:else if app_state['app-ready']}
      <div class="color-controls">
        <button
          class="hue-control emoji-small"
          style="transform: rotate({hue_emoji_rotation}deg)"
          onclick={() => {
            hue_emoji_rotation += 90
            changeHue()
          }}>🎨</button
        >
        <button
          class="light-dark emoji-small"
          onclick={() => switchLightDark()}
        >
          {black_or_white === 'oklch(1 0 0)' ? '🌞' : '🌛'}
        </button>
        <button class="emoji-small" onclick={() => changeLightness()}
          >{user_lightness === 0.8 ? '🤩' : '😎'}</button
        >
      </div>

      <div class="display">
        <Display {analysis_values}>
          {#if !selected_sample}
            <p class="sample-select-message text-xsmall">select a sample</p>
          {/if}
        </Display>
      </div>

      <div class="packs">
        <div class="pack-select">
          <button
            class="pack-select-prev emoji-small"
            onclick={() => selectPack('prev')}>👈</button
          >
          <p class="selected-pack text-small">
            {packs[selected_pack_index].name}
          </p>
          <button
            class="pack-select-next emoji-small"
            onclick={() => selectPack('next')}>👉</button
          >
        </div>

        {#key selected_pack_index}
          <div class="pack">
            {#each SAMPLES as sample}
              {#if sample && sample.pack === packs[selected_pack_index].name}
                <button
                  class="sample border emoji-large"
                  class:active={sample.id === selected_sample?.id}
                  class:playing={sample.playing}
                  onclick={() => handleSampleClick(getSampleByID(sample.id))}
                  >{sample.emoji}</button
                >
              {/if}
            {/each}
          </div>
        {/key}
      </div>

      {#if selected_sample}
        <div class="selected-sample-settings">
          <button class="emoji-large" onclick={() => toggleSampleMute()}
            >{selected_sample.is_muted ? '🔇' : '🔊'}</button
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
            class="emoji-large"
            class:active={selected_sample.delay_is_active}
            onclick={toggleSampleDelay}
          >
            🪞
          </button>
        </div>

        <div class="sequencer">
          {#each SAMPLES as sample}
            {#if sample.id === selected_sample?.id}
              {#each selected_sample.sequence as _, index}
                <button
                  class="step border emoji-sequencer"
                  class:active={index === active_step_index}
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
  /* === utilities === */
  .border {
    border: var(--border-weight) solid var(--user-colour);
    border-radius: var(--border-radius);
    color: var(--user-colour);
    background-color: var(--black-or-white);
  }

  .emoji-large {
    font-family: var(--font-emoji);
    font-size: var(--emoji-large);
  }

  .emoji-small {
    font-family: var(--font-emoji);
    font-size: var(--emoji-small);
    font-weight: 900;
  }

  .emoji-sequencer {
    font-family: var(--font-emoji);
    font-size: var(--emoji-sequencer);
  }

  .text-small {
    font-family: var(--font-text);
    font-size: var(--text-small);
  }

  .text-xsmall {
    font-family: var(--font-text);
    font-size: var(--text-xsmall);
  }

  /* === state === */
  .active,
  .playing {
    color: var(--black-or-white);
    background-color: var(--user-colour);
  }

  .font-loading,
  .audio-context-prompt,
  .audio-prompt-denied,
  .audio-loading {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    text-align: center;
  }

  .audio-context-prompt button {
    display: inline-block;
  }

  .audio-context-prompt {
    display: grid;
    gap: 1em;
  }

  .audio-context-prompt div {
    display: flex;
    gap: 1em;
    justify-content: center;
  }

  /* === html elements === */
  button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    color: var(--user-colour);
    background-color: var(--black-or-white);
  }

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

  .color-controls {
    display: flex;
    justify-content: center;
    gap: 10vmin;
  }

  .hue-control {
    transition: transform 0.3s ease;
  }

  .display {
    position: relative;
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

  .pack-select {
    display: grid;
    grid-template-columns: auto 1fr auto;
    place-items: center;
  }

  .selected-pack {
    display: grid;
    place-items: center;
  }

  .pack {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
  }

  .sample-select-message {
    text-align: center;
    padding: var(--spacing);
  }

  .selected-sample-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    margin-top: 0.4em;
    margin-bottom: 0.4em;
  }

  .selected-sample-pitch {
    display: grid;
    place-items: center;
    transition: transform 0.3s ease;
  }

  .sequencer {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: var(--spacing);
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
