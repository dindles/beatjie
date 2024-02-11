<script lang="ts">
  // === IMPORTS ================================

  // Tone
  import * as Tone from 'tone'

  // Data
  import { packs } from '$lib/assets/audio/packs'
  import { Sample, type SampleHeader, type Packs } from '$lib/models'

  // === VARIABLES ==============================

  // Debugging
  let buffer_start = false
  let buffer_end = false
  let toning_start = false
  let toning_end = false
  let init_start = false
  let init_end = false
  if (buffer_start) console.log('buffer start')
  if (buffer_end) console.log('buffer end')
  if (toning_start) console.log('toning start')
  if (toning_end) console.log('toning end')
  if (init_start) console.log('init start')
  if (init_end) console.log('init end')

  // Sequencer grid
  const sequencer_grid = Array(16)
  let active_step_index = $state(0)

  // Data
  let buffers: Tone.ToneAudioBuffers
  let Toned_samples: Sample<SampleHeader>[]
  let initialised_samples: Sample<SampleHeader>[]
  let SAMPLES: Sample<SampleHeader>[] | undefined
  let selected_pack_index = $state(0)
  let selected_sample: Sample<SampleHeader> | undefined = $state(undefined)

  // === FUNCTIONS ==============================

  // CALLED IMMEDIATELY
  // This creates buffers for each sample in each pack
  function createBuffers(packs: Packs): Tone.ToneAudioBuffers {
    console.log('creating buffers')
    buffer_start = true
    const urlsObject = packs.reduce(
      (result, pack) => {
        pack.samples.forEach((sample) => {
          result[sample.id.toString() as string] = sample.url
        })
        return result
      },
      {} as { [key: string]: string }
    )
    console.log('buffers loaded', buffers)
    buffer_end = true
    return new Tone.ToneAudioBuffers(urlsObject, () => {})
  }

  // This adds the sampler, filter and other Tone components to each SampleHeader, making a Sample
  function addToneToSamples(packs: Packs) {
    console.log('adding tone to samples')
    toning_start = true
    let Toned_samples = []
    for (let i = 0; i < packs.length; i++) {
      for (let j = 0; j < packs[i].samples.length; j++) {
        Toned_samples.push(
          new Sample(
            packs[i].samples[j].id,
            packs[i].samples[j].name,
            packs[i].samples[j].emoji,
            packs[i].samples[j].pitch,
            packs[i].samples[j].url
          )
        )
      }
    }
    console.log('added Tone to samples')
    toning_end = true
    return Toned_samples
  }

  // This loads each Sampler with its buffer, sets the starting parameters of
  // Tone elements, and connects them in a chain to Tone.Destination, which is the audio out
  function initSamples(Toned_samples: Sample<SampleHeader>[]) {
    console.log('initialising samples')
    init_start = true
    for (let i = 0; i < Toned_samples.length; i++) {
      const sample = Toned_samples[i]
      sample.setSamplerBuffers(sample.pitch, buffers.get(sample.id.toString()))

      sample.sampler.chain(sample.filter, sample.panner, Tone.Destination)
      console.log('sample ' + i + ' chained')
    }
    console.log('all samples initialised')
    init_end = true
    return Toned_samples
  }

  // CALLED ON EVENT
  function advanceActiveStep() {
    active_step_index = (active_step_index + 1) % 16
  }

  function selectSample(sample: Sample<SampleHeader>) {
    selected_sample = sample
  }

  function selectPack() {
    selected_pack_index = (selected_pack_index + 1) % packs.length
  }

  function triggerSample(sample_id: number | undefined) {
    if (!sample_id) {
      console.log('sample is undefined')
    } else {
      // The audio context needs to be launched by a user action
      if (Tone.context.state !== 'running') {
        Tone.start()
        console.log('Tone.started', Tone.context.state)
      }

      // If SAMPLES has been assigned (todo: sort this out with await)
      // then set the sample and effect params if determining them per step
      // then trigger the sampler attack
      if (SAMPLES) {
        SAMPLES[sample_id].sampler.attack = 0.01
        SAMPLES[sample_id].sampler.release = 0.1
        SAMPLES[sample_id].filter.type = 'highpass'
        SAMPLES[sample_id].filter.frequency.value = 1600
        // go team go
        SAMPLES[sample_id].sampler.triggerAttack('C2', Tone.now())
      }
    }
  }

  // === LIFECYCLE ==============================

  async function processSamples(packs: Packs) {
    buffers = await createBuffers(packs)
    Toned_samples = addToneToSamples(packs)
    SAMPLES = await initSamples(Toned_samples)
    // ... do something with the results
  }

  processSamples(packs)

  // buffers = createBuffers(packs)
  // Toned_samples = addToneToSamples(packs)
  // SAMPLES = initSamples(Toned_samples)
  console.log('SAMPLES:', SAMPLES)

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
  <!-- <h2>GRID</h2> -->
  <div class="sequencer grid">
    {#each sequencer_grid as step, index}
      <div class="moji tile" class:active={active_step_index === index} />
    {/each}
  </div>
  <h2>FUNCTIONALITY</h2>
  <div class="functionality">
    <button class="tile" onclick={advanceActiveStep}>next step</button>
    <button
      class="tile"
      onclick={() => triggerSample(selected_sample ? selected_sample?.id : 0)}
      >play sample</button
    >
    <button class="tile" onclick={selectPack}
      >selected pack: {packs[selected_pack_index].name}</button
    >
    <p>selected sample: {(selected_sample?.name, selected_sample?.id)}</p>
  </div>
  <h2>SAMPLES</h2>
  <div class="samples">
    {#key selected_pack_index}
      <div class="pack grid">
        {#each packs[selected_pack_index].samples as sample}
          <!-- todo: when clicking sample tile, selected_sample should become relevant Sample -->
          <button
            class="moji tile"
            onclick={() => (SAMPLES ? selectSample(SAMPLES[sample.id]) : null)}
            >{(sample.emoji, sample.name)}</button
          >
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
