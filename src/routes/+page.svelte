<script lang="ts">
  // === IMPORTS ================================

  // Tone
  import * as Tone from 'tone'

  // Data
  import { packs } from '$lib/assets/audio/packs'

  // Classes and types
  import { Sample, type Packs } from '$lib/models.svelte'

  // Svelte components
  import RangeInput from '$lib/components/range-input.svelte'
  import BPMSelector from '$lib/components/bpm-selector.svelte'

  // === VARIABLES ==============================

  // Tone
  const main_init = {
    volume: -3,
    bpm: 120,
    lowpass_freq: 2000,
    highpass_freq: 400,
    distortion_init: 0.2,
    distortion_amount: 0.8,
    analyser_resolution: 256,
  }
  const main_channel = new Tone.Channel(main_init.volume)
  const main_filter_lp = new Tone.Filter(20000, 'lowpass')
  const main_filter_hp = new Tone.Filter(0, 'highpass')
  const main_distortion = new Tone.Distortion()
  // this is set here because the init distortion parameter is amount, not wet.
  main_distortion.wet.value = main_init.distortion_init
  const main_analyser = new Tone.Analyser(
    'waveform',
    main_init.analyser_resolution
  )

  let SEQUENCES: Tone.Sequence[] = []
  let SAMPLES: Sample[] = $state([])

  // State
  let selected_pack_index: number = $state(0)
  let selected_sample: Sample | undefined = $state(undefined)
  let is_playing = $state(false)
  let active_step_index: number = $state(0)
  let preview_samples_active: boolean = $state(true)
  let main_lowpassed: boolean = $state(false)
  let main_highpassed: boolean = $state(false)
  let main_distorted: boolean = $state(false)
  let bpm: number = $state(main_init.bpm)
  // todo
  let settings_visible: boolean = $state(false)

  // Display
  let animation_frame_id: number
  let canvas: HTMLCanvasElement
  let analysis_values: Float32Array | Float32Array[] = $state([])

  let pitch_emoji_rotation = $state(0)

  // Colour
  let user_hue = $state(60) //0-360
  let user_saturation = $state(33) //0-100
  let lightness = 50 //0-100

  let user_colour = $derived(
    `hsl(${user_hue}, ${user_saturation}%, ${lightness}%)`
  )

  let other_colour = $state('hsl(0, 0%, 0%)')

  // sets css variables (defined in app.css)
  $effect(() => {
    document.documentElement.style.setProperty('--user-colour', user_colour)
    document.documentElement.style.setProperty('--other-colour', other_colour)
  })

  // === FUNCTIONS ==============================

  // CALLED IMMEDIATELY
  // Audio
  // Creates an audio buffer for each sample, pack by pack
  function makeBuffers(packs: Packs): Tone.ToneAudioBuffers {
    const urlsObject: { [key: string]: string } = {}
    packs.forEach((pack) => {
      pack.samples.forEach((sample) => {
        urlsObject[sample.id.toString()] = sample.url
      })
    })
    return new Tone.ToneAudioBuffers(urlsObject, () => {})
  }

  // Creates a new Sample object from each SampleHeader
  // Each Sample also contains a Tone.js sampler and channel strip (see models.svelte.ts)
  function makeSamples(packs: Packs) {
    const samples = packs.flatMap((pack) =>
      pack.samples.map(
        (sample) =>
          new Sample(
            sample.id,
            pack.name,
            sample.name,
            sample.emoji,
            sample.url,
            sample.pitch
          )
      )
    )
    return samples
  }

  // Loads each sampler with its buffer
  function loadBuffers(
    toned_samples: Sample[],
    buffers: Tone.ToneAudioBuffers
  ) {
    for (let i = 0; i < toned_samples.length; i++) {
      const sample = toned_samples[i]
      sample.setSamplerBuffers(sample.pitch, buffers.get(sample.id.toString()))
    }
    return toned_samples
  }

  // Chains each sampler to its channel strip, then
  // to main channel, effects, analyser and Tone.Destination
  function setChains(SAMPLES: Sample[]) {
    SAMPLES.forEach((sample) => {
      sample.sampler.chain(
        sample.channel,
        main_channel,
        main_filter_lp,
        main_filter_hp,
        main_distortion,
        main_analyser,
        Tone.getDestination()
      )
    })
  }

  // Sets sampler, filter parameters per sample
  function setSampleParams(sample: Sample) {
    sample.sampler.attack = sample.attack
    sample.channel.volume.value = sample.volume
  }

  // Creates a Tone.Sequence for each sample, and specifies what happens on each step
  // I tried making a single sequence instead, which looped through all samples each step,
  // but that led to delays and flamming when adjusting filter frequency during playback?
  function makeSequences(SAMPLES: Sample[]) {
    const sequences = SAMPLES.map((sample) => {
      return new Tone.Sequence(
        (time, sequencer_step) => {
          active_step_index = sequencer_step
          if (sample.sequence[sequencer_step]) {
            sample.playing = true
            setSampleParams(sample)
            sample.play(time)
          } else {
            sample.playing = false
          }
        },
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        '16n'
      )
    })

    return sequences
  }

  // CALLED ON EVENT
  // When we click on a sequencer (seq) step,
  // the sequence array of the selected sample is updated
  function handleSeqClick(sample: Sample, step_index: number) {
    sample.sequence[step_index] === false
      ? (sample.sequence[step_index] = true)
      : (sample.sequence[step_index] = false)
  }

  // When we click on a sample in the sample library,
  // that sample is set as the selected_sample, and we trigger sample playback
  function handleSampleClick(sample: Sample | undefined) {
    if (!sample) return

    selectSample(sample.id)

    if (preview_samples_active) {
      triggerSample(sample)
    }

    function selectSample(sample_id: number) {
      selected_sample = getSampleByID(sample_id)
    }

    // Set the sample and effect params then trigger the sampler attack
    function triggerSample(sample: Sample | undefined) {
      // The audio context needs to be launched by a user action
      if (Tone.getContext().state !== 'running') {
        Tone.start()
      }
      if (sample) {
        // go team go
        if (selected_sample) {
          setSampleParams(selected_sample)
        }
        sample.play(Tone.now())
      }
    }
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

  // PLAYBACK START/STOP – makes all sequences and toggles the transport
  async function toggleSeqPlayback() {
    active_step_index = 0
    // The audio context needs to be launched by a user action
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
    }

    if (!is_playing) {
      SEQUENCES = makeSequences(SAMPLES)
      for (const sequence of SEQUENCES) {
        sequence.start()
      }
      Tone.getTransport().start('+0.1') // delay transport start 100ms to help avoid scheduling errors.
      console.log('Tone.Transport started')
    } else {
      Tone.getTransport().stop()
      for (const sequence of SEQUENCES) {
        sequence.stop()
        sequence.dispose()
      }
    }

    is_playing = !is_playing
  }

  // CALLED ON MOUNT
  $effect(() => {
    selectPack('random')

    const canvasElement = document.querySelector('canvas')
    if (canvasElement) {
      canvas = canvasElement
    } else {
      console.error('Canvas element not found')
    }

    startDrawingLoop()

    return () => {
      stopDrawingLoop()
    }
  })

  // CALLED FOR DISPLAY
  function startDrawingLoop() {
    animation_frame_id = requestAnimationFrame(draw)
  }

  // todo: need this?
  function stopDrawingLoop() {
    cancelAnimationFrame(animation_frame_id)
  }

  function draw() {
    const dim = Math.min(canvas.width, canvas.height)
    const ctx = canvas.getContext('2d', { alpha: false })

    if (ctx) {
      // Background and stroke color
      ctx.fillStyle = other_colour
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = user_colour
      ctx.lineWidth = dim * 0.04 // set line thickness

      // Draw waveform
      analysis_values = main_analyser.getValue()
      const scalingFactor = calculateScalingFactor(
        analysis_values instanceof Float32Array
          ? analysis_values
          : analysis_values[0]
      ) // Check analysis_values is of type Float32Array

      ctx.beginPath()
      for (let i = 0; i < analysis_values.length; i++) {
        const amplitude = (analysis_values[i] as number) * scalingFactor // Apply scaling factor to amplitude
        const x = myMap(i, 0, analysis_values.length - 1, 0, canvas.width)
        const y = canvas.height / 2 + amplitude * canvas.height

        // Place vertex
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }

    requestAnimationFrame(draw)
  }

  // changing colours
  function changeHue() {
    user_hue += 35
    if (user_hue >= 360) {
      user_hue = 0
    }
  }

  function changeSaturation() {
    if (user_saturation === 100) {
      user_saturation = 33
    } else {
      user_saturation = 100
    }
  }

  // Utility - Vertical waveform scaling factor
  function calculateScalingFactor(analysis_values: Float32Array) {
    const maxAmplitude = Math.max(...analysis_values.map(Math.abs)) // Find the maximum absolute amplitude
    const scalingFactor = 0.2 / maxAmplitude // Calculate scaling factor based on max amplitude (0.9 to leave some padding)
    return scalingFactor
  }

  // Utility - Map one range to another
  function myMap(
    value: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number
  ) {
    return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2
  }

  // Utility functions
  function getSampleByID(sample_id: number) {
    return SAMPLES.find((s) => s.id === sample_id)
  }

  function switchSampleGain() {
    if (!selected_sample) console.log('No sample selected')
    else if (selected_sample) {
      selected_sample.volume === -108
        ? (selected_sample.volume = 0)
        : (selected_sample.volume = -108)
    }
  }

  const PITCHES = ['C2', 'F2', 'A2', 'C1']

  function loopSamplePitch() {
    if (!selected_sample) {
      console.log('No sample selected')
      return
    }

    const currentIndex = PITCHES.indexOf(selected_sample.pitch)
    const nextIndex = (currentIndex + 1) % PITCHES.length
    // hacky type stuff
    selected_sample.pitch = PITCHES[nextIndex] as typeof selected_sample.pitch
  }

  function updateBPM(newBPM: number) {
    bpm = newBPM
    Tone.getTransport().bpm.value = bpm
  }

  function toggleHighPass() {
    main_highpassed = !main_highpassed
    if (!main_highpassed) {
      main_filter_hp.frequency.value = 0
    } else {
      main_filter_hp.frequency.value = main_init.highpass_freq
    }
  }

  function toggleLowPass() {
    main_lowpassed = !main_lowpassed
    if (!main_lowpassed) {
      main_filter_lp.frequency.value = 20000
    } else {
      main_filter_lp.frequency.value = main_init.lowpass_freq
    }
  }

  function toggleDistortion() {
    main_distorted = !main_distorted
    if (!main_distorted) {
      main_distortion.wet.value = 0.2
    } else {
      main_distortion.wet.value = main_init.distortion_amount
    }
  }

  // === LIFECYCLE ==============================

  async function processSamples(packs: Packs) {
    const buffers: Tone.ToneAudioBuffers = makeBuffers(packs)
    const tone_samples: Sample[] = makeSamples(packs)
    const samples: Sample[] = loadBuffers(tone_samples, buffers)
    setChains(samples)

    return samples
  }

  // Ensuring each setup step resolves properly before we use SAMPLES
  processSamples(packs).then((resolvedSamples) => {
    SAMPLES = resolvedSamples
  })
</script>

<main>
  <div class="app border">
    <div class="color-controls">
      <button class="emoji-small" onclick={() => changeSaturation()}>🪩</button>
      <button class="emoji-small" onclick={() => changeHue()}>🎨</button>
      <button
        class="light-dark emoji-small"
        onclick={() => {
          if (other_colour === 'hsl(0, 0%, 100%)') {
            other_colour = 'hsl(0, 0%, 0%)'
          } else if (other_colour === 'hsl(0, 0%, 0%)') {
            other_colour = 'hsl(0, 0%, 100%)'
          }
        }}
      >
        {other_colour === 'hsl(0, 0%, 100%)' ? '🌞' : '🌛'}
      </button>
    </div>

    <div class="display">
      <div>
        <canvas></canvas>
      </div>
      {#if !selected_sample}
        <p class="sample-select-message text-xsmall">select a sample</p>
      {/if}
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
        <button class="emoji-large" onclick={() => switchSampleGain()}
          >{selected_sample.volume === -108 ? '🔇' : '🔊'}</button
        >
        <button
          class="selected-sample-pitch emoji-large"
          style="transform: rotate({pitch_emoji_rotation}deg)"
          onclick={() => {
            pitch_emoji_rotation += 90
            loopSamplePitch()
          }}>🎵</button
        >
        <!-- *not sure how to make this comprehensible visually -->
        <!-- <button
          class="preview_samples_setting emoji-small"
          class:active={preview_samples_active}
          onclick={() => {
            preview_samples_active = !preview_samples_active
          }}
        >
          🎧
        </button> -->
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
          <button class="emoji-large" onclick={toggleSeqPlayback}
            >{is_playing ? '⏹' : '▶'}</button
          >
        </div>

        <div class="main-settings">
          <button
            class="emoji-large"
            onclick={toggleHighPass}
            class:active={main_highpassed}>🫴</button
          >
          <button
            class:active={main_distorted}
            class="emoji-large"
            onclick={toggleDistortion}>💥</button
          >
          <div class="bpm-control">
            <BPMSelector bind:bpm {updateBPM} />
          </div>
        </div>
      </div>
    {/if}
    <p class="logo text-small">mojibeat</p>
  </div>
</main>

<style>
  /* === utilities === */
  .border {
    border: var(--border-weight) solid var(--user-colour);
    border-radius: var(--border-radius);
  }

  .emoji-large {
    font-family: var(--font-emoji);
    font-size: var(--size-emoji-large);
  }

  .emoji-small {
    font-family: var(--font-emoji);
    font-size: var(--size-emoji-small);
  }

  .emoji-sequencer {
    font-family: var(--font-emoji);
    font-size: var(--size-emoji-sequencer);
  }

  .text-small {
    font-family: var(--font-text);
    font-size: var(--size-text-small);
  }

  .text-xsmall {
    font-family: var(--font-text);
    font-size: var(--size-text-xsmall);
  }

  /* === state === */

  .active {
    color: var(--other-colour);
    background-color: var(--user-colour);
  }

  .playing {
    color: var(--other-colour);
    background-color: var(--user-colour);
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
  }

  /* === layout === */
  main {
    min-height: 100vh;
    display: grid;
    place-items: center;
  }

  .app {
    aspect-ratio: 4/7;
    height: min(95vh, 1080px);
    overflow: hidden;
    padding: 1%;
    gap: var(--spacing);
    grid-template-rows: auto auto 1fr auto auto;
  }

  .color-controls {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing);
  }

  .display {
    position: relative;
  }

  canvas {
    width: 100%;
    aspect-ratio: 4/1;
  }

  .sample-select-message {
    width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* pack selection */
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

  /* sample selection */
  .sample-select-message {
    text-align: center;
    padding: var(--spacing);
  }

  .selected-sample-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
  }

  /* todo: spin this emoji 90 degrees each time it's clicked */
  .selected-sample-pitch {
    display: grid;
    place-items: center;
    transition: transform 0.3s ease;
  }

  /* sequencer */
  .sequencer {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: var(--spacing);
  }

  /* transport and settings */
  .transport-and-main-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
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

  .logo {
    text-align: center;
  }
</style>
