<script lang="ts">
  // === IMPORTS ================================

  // Tone
  import * as Tone from 'tone'

  // Data
  import { packs } from '$lib/assets/audio/packs'

  // Classes and types
  import { Sample, type Packs } from '$lib/models.svelte'

  // === VARIABLES ==============================

  // Tone
  const main_init = {
    volume: -3,
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
  // todo
  let settings_visible: boolean = $state(false)

  // Display
  let animation_frame_id: number
  let canvas: HTMLCanvasElement
  let analysis_values: Float32Array | Float32Array[] = $state([])

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

      ctx.strokeStyle = 'cyan'
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
    const buffers: Tone.ToneAudioBuffers = await makeBuffers(packs)
    const tone_samples: Sample[] = makeSamples(packs)
    const samples: Sample[] = await loadBuffers(tone_samples, buffers)
    setChains(samples)

    return samples
  }

  // Ensuring each setup step resolves properly before we use SAMPLES
  processSamples(packs).then((resolvedSamples) => {
    SAMPLES = resolvedSamples
  })
</script>

<main>
  <div class="app noto">
    <div class="display">
      <canvas></canvas>
    </div>

    <div class="packs">
      <div class="pack-select">
        <button
          class="pack-select-prev square"
          onclick={() => selectPack('prev')}>👈</button
        >
        <p class="selected-pack">
          {packs[selected_pack_index].name}
        </p>
        <button
          class="pack-select-next square"
          onclick={() => selectPack('next')}>👉</button
        >
      </div>

      {#key selected_pack_index}
        <div class="pack">
          {#each SAMPLES as sample}
            {#if sample && sample.pack === packs[selected_pack_index].name}
              <button
                class="sample square"
                class:playing={sample.playing}
                onclick={() => handleSampleClick(getSampleByID(sample.id))}
                >{sample.emoji}</button
              >
            {/if}
          {/each}
        </div>
      {/key}
    </div>

    {#if !selected_sample}
      <p class="sample-select-message">select a sample</p>
    {:else}
      <div class="selected-sample-and-settings">
        <p class="selected-sample square">
          {selected_sample?.emoji}
        </p>

        <div class="selected-sample-settings-1">
          <button
            class="square"
            class:selected={selected_sample.volume === -108 ? 'selected' : ''}
            onclick={() => setSampleGain('mute')}>🔇</button
          >
          <button
            class="square"
            class:selected={selected_sample.volume === -12 ? 'selected' : ''}
            onclick={() => setSampleGain('-12')}>🔈</button
          >
          <button
            class="square"
            class:selected={selected_sample.volume === -3 ? 'selected' : ''}
            onclick={() => setSampleGain('-3')}>🔊</button
          >
        </div>
        <div class="selected-sample-settings-2">
          <button
            class="square"
            class:selected={selected_sample.pitch === 'C2' ? 'selected' : ''}
            onclick={() => setSamplePitch('tonic')}>I</button
          >
          <button
            class="square"
            class:selected={selected_sample.pitch === 'F2' ? 'selected' : ''}
            onclick={() => setSamplePitch('fourth')}>IV</button
          >
          <button
            class="square"
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
                class="step"
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

      <div class="main-settings">
        <button class="square" onclick={toggleSeqPlayback}
          >{is_playing ? '⏹' : '▶'}</button
        >

        <button
          class="square"
          onclick={toggleHighPass}
          class:selected={main_highpassed ? 'selected' : ''}>🫴</button
        >
        <button
          class="square"
          class:selected={main_lowpassed ? 'selected' : ''}
          onclick={toggleLowPass}>🫳</button
        >
        <button
          class="square"
          class:selected={main_distorted ? 'selected' : ''}
          onclick={toggleDistortion}>💥</button
        >
        <!-- here temporarily, not sure where preview button should go -->
        <button
          class="square"
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
      <div class="egg">egg</div>
    {/if}
  </div>
</main>

<style>
  .app {
    max-width: 444px;
    margin: 0 auto;
    display: grid;
    border: 4px solid magenta;
  }

  .display {
    border: dotted 3px;
  }

  canvas {
    width: 100%;
    aspect-ratio: 4 / 1;
  }

  .packs {
    border: solid 3px teal;
  }

  .pack-select {
    display: grid;
    grid-template-columns: 1fr 6fr 1fr;
    border: solid 3px;
  }

  .selected-pack {
    display: grid;
    place-items: center;
  }

  .pack {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: solid 3px;
  }

  .selected-sample-and-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: solid 3px;
  }

  .selected-sample {
    border: solid 3px;
  }

  .selected-sample-settings-1 {
    grid-row: span 2 / span 2;
    grid-column-start: 2;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    border: solid 3px;
  }

  .selected-sample-settings-2 {
    grid-row: span 2 / span 2;
    grid-column-start: 3;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    border: solid 3px;
  }

  .selected-sample-settings-3 {
    grid-row: span 2 / span 2;
    grid-column-start: 4;
    border: solid 3px;
  }

  .sample.playing {
    background-color: rgb(178, 26, 178);
  }

  .sample-select-message {
    border: solid 3px;
  }

  .sequencer {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border: solid 3px burlywood;
  }

  .step,
  .sample {
    border: solid 3px;
  }

  .step {
    aspect-ratio: 2 / 1;
  }

  .step.active {
    background-color: teal;
  }

  .main-settings {
    border: solid 3px;
  }

  .noto {
    font-family: 'Noto Emoji Variable';
  }

  .square {
    aspect-ratio: 1;
  }

  button:active {
    background-color: var(--bg-color);
    color: black;
  }

  .selected {
    color: rgb(0, 238, 255);
  }
</style>
