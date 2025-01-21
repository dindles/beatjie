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

  // === VARIABLES ==============================

  // Tone
  const main_init = {
    volume: -3,
    bpm: 120,
    lowpass_freq: 2000,
    highpass_freq: 200,
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

  // Colour
  let user_hue = $state() //0-360
  let user_saturation = $state() //0-100
  let lightness = 50 //0-100

  let user_colour = $derived(
    `hsl(${user_hue}, ${user_saturation}%, ${lightness}%)`
  )

  $effect(() => {
    document.documentElement.style.setProperty('--user-colour', user_colour)
  })

  // === FUNCTIONS ==============================

  // CALLED IMMEDIATELY
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
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = user_colour
      ctx.lineWidth = dim * 0.02 // set line thickness

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

  function setSampleGain(gain: 'mute' | '-3' | '-12') {
    if (!selected_sample) console.log('No sample selected')
    else if (selected_sample) {
      switch (gain) {
        case 'mute':
          selected_sample.volume = -108
          break
        case '-3':
          selected_sample.volume = -3
          break
        case '-12':
          selected_sample.volume = -12
          break
      }
    }
  }

  function setSamplePitch(pitch: 'tonic' | 'fourth' | 'fifth') {
    if (!selected_sample) console.log('No sample selected')
    else if (selected_sample) {
      switch (pitch) {
        case 'tonic':
          selected_sample.pitch = 'C2'
          break
        case 'fourth':
          selected_sample.pitch = 'F2'
          break
        case 'fifth':
          selected_sample.pitch = 'G2'
          break
      }
    }
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
  <div class="app">
    <div class="color-controls">
      <RangeInput bind:value={user_hue} min={0} max={333} label="🎨" />
      <RangeInput bind:value={user_saturation} min={33} max={100} label="🪩" />
    </div>
    <div class="display">
      <canvas></canvas>
    </div>

    {#if !selected_sample}
      <p class="sample-select-message">select a sample</p>
    {/if}

    <div class="packs">
      <div class="pack-select">
        <button
          class="pack-select-prev emoji-font"
          onclick={() => selectPack('prev')}>👈</button
        >
        <p class="selected-pack">
          {packs[selected_pack_index].name}
        </p>
        <button
          class="pack-select-next emoji-font"
          onclick={() => selectPack('next')}>👉</button
        >
      </div>

      {#key selected_pack_index}
        <div class="pack">
          {#each SAMPLES as sample}
            {#if sample && sample.pack === packs[selected_pack_index].name}
              <button
                class="sample emoji-font"
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
      <div class="selected-sample-and-settings">
        <div class="selected-sample emoji-font">
          {selected_sample?.emoji}
        </div>

        <div class="selected-sample-settings-1">
          <button
            class="emoji-font"
            class:selected={selected_sample.volume === -108 ? 'selected' : ''}
            onclick={() => setSampleGain('mute')}>🔇</button
          >
          <button
            class="emoji-font"
            class:selected={selected_sample.volume === -12 ? 'selected' : ''}
            onclick={() => setSampleGain('-12')}>🔈</button
          >
          <button
            class="emoji-font"
            class:selected={selected_sample.volume === -3 ? 'selected' : ''}
            onclick={() => setSampleGain('-3')}>🔊</button
          >
        </div>
        <div class="selected-sample-settings-2">
          <button
            class="emoji-font"
            class:selected={selected_sample.pitch === 'C2' ? 'selected' : ''}
            onclick={() => setSamplePitch('tonic')}>I</button
          >
          <button
            class="emoji-font"
            class:selected={selected_sample.pitch === 'F2' ? 'selected' : ''}
            onclick={() => setSamplePitch('fourth')}>IV</button
          >
          <button
            class="emoji-font"
            class:selected={selected_sample.pitch === 'G2' ? 'selected' : ''}
            onclick={() => setSamplePitch('fifth')}>V</button
          >
        </div>
        <div class="selected-sample-settings-3"></div>
      </div>

      <div class="sequencer">
        {#each SAMPLES as sample}
          {#if sample.id === selected_sample?.id}
            {#each selected_sample.sequence as _, index}
              <button
                class="step emoji-font"
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
          <button class="emoji-font" onclick={toggleSeqPlayback}
            >{is_playing ? '⏹' : '▶'}</button
          >
        </div>

        <div class="main-settings">
          <button
            class="emoji-font"
            onclick={toggleHighPass}
            class:selected={main_highpassed ? 'selected' : ''}>🫴</button
          >
          <button
            class:selected={main_lowpassed ? 'selected' : ''}
            class="emoji-font"
            onclick={toggleLowPass}>🫳</button
          >
          <button
            class:selected={main_distorted ? 'selected' : ''}
            class="emoji-font"
            onclick={toggleDistortion}>💥</button
          >
          <div class="bpm-control">
            <input
              type="number"
              min="60"
              max="200"
              bind:value={bpm}
              onchange={() => updateBPM(bpm)}
            />
          </div>
        </div>
        <!-- here temporarily, not sure where preview button should go -->
        <button
          class="preview_samples_setting emoji-font"
          onclick={() => {
            preview_samples_active = !preview_samples_active
          }}
        >
          {preview_samples_active ? 'X' : '🎧'}
        </button>
        <!-- TODO -->
        <!-- <button onclick={() => savePreset(SAMPLES)}>save preset</button> -->
        <!-- <button onclick={() => loadPreset()}>load preset</button> -->
      </div>
    {/if}
  </div>
</main>

<style>
  button {
    background: transparent;
    border: var(--border-weight) solid var(--user-colour);
    border-radius: var(--border-radius);
    cursor: pointer;
    padding: 0;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
  }

  /* === LAYOUT === */
  main {
    display: grid;
    place-items: center;
  }

  .emoji-font {
    font-family: 'Noto Emoji';
  }

  .app {
    display: grid;
    gap: var(--spacing);
    grid-template-rows: auto auto 1fr auto auto;
    max-width: 344px;
    width: 100%;
    max-height: 100vh;
  }

  /* === COMPONENTS === */
  .emoji-font {
    font-family: 'Noto Emoji';
  }

  /* Color Controls */
  .color-controls {
    display: flex;
    justify-content: center;
    gap: var(--spacing);
  }

  /* Display */
  canvas {
    width: 100%;
    aspect-ratio: 4 / 1;
  }

  /* Pack Selection */
  .pack-select {
    display: grid;
    grid-template-columns: auto 1fr auto;
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

  /* Sample Selection */
  .selected-sample {
    border: var(--border-weight) solid var(--user-colour);
    border-radius: var(--border-radius);
  }
  .sample-select-message {
    text-align: center;
    padding: var(--spacing);
  }

  .selected-sample-and-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
  }

  .selected-sample-settings-1,
  .selected-sample-settings-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing);
  }

  /* Sequencer */
  .sequencer {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: var(--spacing);
  }

  /* Transport and Settings */
  .transport-and-main-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
  }

  .main-settings {
    grid-column: span 3;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
    gap: var(--spacing);
  }

  /* === STATES === */
  .sample.playing {
    background-color: var(--playing-color);
  }

  .step.active {
    background-color: var(--active-color);
  }

  .selected {
    color: var(--selected-color);
  }

  /* === RESPONSIVE === */
  @media (max-width: 400px) {
    .app {
      max-width: 100%;
    }
  }
</style>
