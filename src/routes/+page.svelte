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
  const main_filter = new Tone.Filter()
  const main_distortion = new Tone.Distortion()
  const main_analyser = new Tone.Analyser()
  let SEQUENCES: Tone.Sequence[] = []

  // Settings
  let main_filter_freq: Tone.Unit.Frequency = $state(18000)
  let main_distortion_amount: number = $state(0.5)

  // State
  let SAMPLES: Sample[] = $state([])
  let selected_pack_index = $state(0)
  let selected_sample: Sample | undefined = $state(undefined)
  let is_playing = $state(false)
  let active_step_index = $state(0)

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
  // Each Sample also contains a Tone.js sampler, filter and channel (see models.svelte.ts)
  function makeSamples(packs: Packs) {
    const samples = packs.flatMap((pack) =>
      pack.samples.map(
        (sample) =>
          new Sample(
            sample.id,
            sample.name,
            sample.emoji,
            sample.pitch,
            sample.url
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

  // Chains each sampler to its filter and channel
  // Then all sampler channels to main filter, effects, analyser and Tone.Destination
  function setChains(SAMPLES: Sample[]) {
    SAMPLES.forEach((sample) => {
      sample.sampler.chain(
        sample.filter,
        sample.channel,
        main_filter,
        main_distortion,
        main_analyser,
        Tone.Destination
      )
    })
  }

  // Sets sampler, filter parameters per sample
  function setSampleParams(sample: Sample) {
    sample.sampler.attack = 0.01
    sample.filter.type = 'lowpass'
    sample.filter.frequency.value = 18000
  }

  // Sets effect, filter parameters on the main channel
  function setMainParams() {
    main_distortion.wet.value = main_distortion_amount
    main_filter.type = 'lowpass'
    main_filter.frequency.value = main_filter_freq
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
    triggerSample(sample)
  }

  // todo: use util function here instead
  function selectSample(sample_id: number) {
    selected_sample = SAMPLES?.find((s) => s.id === sample_id)
  }

  // Set the sample and effect params if determining them per step
  // then trigger the sampler attack
  function triggerSample(sample: Sample | undefined) {
    // The audio context needs to be launched by a user action
    if (Tone.context.state !== 'running') {
      Tone.start()
    }
    if (sample) {
      // go team go
      // todo: take sample.pitch into account
      setSampleParams(sample)
      setMainParams()
      sample.sampler.triggerAttack('C2', Tone.now())
    }
  }

  // todo – fix reverse oddness, and trigger this from Tone.Draw?
  function advanceActiveStep() {
    active_step_index = (active_step_index + 1) % 16
  }

  function selectPack() {
    selected_pack_index = (selected_pack_index + 1) % packs.length
  }

  async function toggleSeq() {
    // The audio context needs to be launched by a user action
    if (Tone.context.state !== 'running') {
      await Tone.start()
    }

    if (!is_playing) {
      SEQUENCES = makeSequences(SAMPLES)
      for (const sequence of SEQUENCES) {
        sequence.start()
      }
      Tone.Transport.start('+0.1') // delay transport start 100ms to help avoid scheduling errors.
      console.log('Tone.Transport started')
    } else {
      Tone.Transport.stop()
      for (const sequence of SEQUENCES) {
        sequence.stop()
        sequence.dispose()
      }
    }

    is_playing = !is_playing
  }

  // todo: figure out why this works to change samples on the fly,
  // but 'if (step)', passing sample.sequence, doesn't
  function makeSequences(SAMPLES: Sample[]) {
    const sequences = SAMPLES.map((sample) => {
      return new Tone.Sequence(
        (time, step) => {
          if (sample.sequence[step]) {
            setSampleParams(sample)
            setMainParams()
            sample.play(time)
          }
        },
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        '16n'
      )
    })

    return sequences
  }

  // not working
  // function savePreset(samples: Sample[]) {
  //   localStorage.setItem('samples', JSON.stringify(samples))
  // }

  // not working
  // function loadPreset() {
  //   SAMPLES = JSON.parse(localStorage.getItem('samples') || '[]')
  // }

  // Utility functions
  // todo: use this in the other instances
  function getSampleByID(sample_id: number) {
    return SAMPLES.find((s) => s.id === sample_id)
  }

  // === LIFECYCLE ==============================

  async function processSamples(packs: Packs) {
    const buffers: Tone.ToneAudioBuffers = await makeBuffers(packs)
    const tone_samples: Sample[] = makeSamples(packs)
    const samples: Sample[] = await loadBuffers(tone_samples, buffers)
    setChains(samples)

    return samples
  }

  // Ensuring we have properly set up samples before using them
  processSamples(packs).then((resolvedSamples) => {
    SAMPLES = resolvedSamples
  })

  $effect(() => {
    console.log('mounted')
  })
</script>

<div class="header">
  <h1>mojibeat</h1>
  <p class="label">🔊</p>
</div>
<div class="spacer" />
<main>
  <h2>DISPLAY</h2>
  <div class="display"></div>
  <p>{selected_sample?.name}</p>
  <p>{active_step_index}</p>
  <!-- <h2>GRID</h2> -->
  {#if !selected_sample}
    <p>select a sample</p>
  {/if}
  {#each SAMPLES as sample}
    {#if sample.id === selected_sample?.id}
      <div class="sequencer grid">
        {#each selected_sample.sequence as step, index}
          <!-- if the active sample sequence is true for this step, the active class should be set -->
          <div
            class="moji tile"
            class:active={index === active_step_index}
            onclick={() => handleSeqClick(sample, index)}
            onkeydown={() => handleSeqClick(sample, index)}
            role="button"
            tabindex="0"
          >
            {#if selected_sample.sequence[index]}
              {selected_sample.emoji}
            {/if}
          </div>
        {/each}
      </div>
    {:else}{/if}
  {/each}
  <h2>FUNCTIONALITY</h2>
  <div class="functionality">
    <button onclick={toggleSeq}>{is_playing ? 'stop' : 'play'}</button>
    <input type="range" min="100" max="18000" bind:value={main_filter_freq} />
    <p>{main_filter_freq}</p>
    <input
      type="range"
      min="0"
      max="1"
      step="0.2"
      bind:value={main_distortion_amount}
    />
    <p>{main_distortion_amount}</p>
    <button onclick={advanceActiveStep}>next step</button>
    <button onclick={() => triggerSample(selected_sample)}>play sample</button>
    <button onclick={selectPack}
      >selected pack: {packs[selected_pack_index].name}</button
    >
    <p>selected sample: {(selected_sample?.name, selected_sample?.id)}</p>
    <!-- <button onclick={() => savePreset(SAMPLES)}>save preset</button> -->
    <!-- <button onclick={() => loadPreset()}>load preset</button> -->
  </div>
  <h2>SAMPLES</h2>
  <div class="samples">
    {#key selected_pack_index}
      <div class="pack grid">
        {#each packs[selected_pack_index].samples as sample}
          {#if sample}
            <button
              class="moji tile"
              onclick={() => handleSampleClick(getSampleByID(sample.id))}
              >{(sample.emoji, sample.name)}</button
            >
          {/if}
        {/each}
      </div>
    {/key}
  </div>
</main>

<style>
  main {
    display: grid;
    place-items: center;
  }

  .spacer {
    height: 1.5rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 800;
  }

  .display {
    width: 288px;
    height: 144px;
    border: solid 3px;
  }

  .grid {
    display: grid;
    place-items: center;
    grid-template-rows: repeat(4, 72px);
    grid-template-columns: repeat(4, 72px);
  }

  .functionality {
    width: 288px;
  }

  .tile {
    display: grid;
    place-items: center;
    width: 69px;
    aspect-ratio: 1;
    background-color: white;
    border: solid 3px;
    border-radius: 6px;
  }

  .moji {
    font-family: 'Noto Emoji Variable';
    font-size: 2rem;
  }

  .tile.active {
    background-color: teal;
  }
</style>
