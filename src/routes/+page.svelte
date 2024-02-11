<script lang="ts">
  // === IMPORTS ================================

  // Tone
  import * as Tone from 'tone'

  // Data
  import { packs } from '$lib/assets/audio/packs'
  import { Sample, type SampleHeader, type Packs } from '$lib/models'

  // === VARIABLES ==============================

  // Sequencer grid
  const sequencer_grid = Array(16)
  let active_step_index = $state(0)

  // Data
  let buffers: Tone.ToneAudioBuffers
  let toned_samples: Sample<SampleHeader>[]
  let initialised_samples: Sample<SampleHeader>[]
  let SAMPLES: Sample<SampleHeader>[] | undefined
  let selected_pack_index = $state(0)
  let selected_sample: Sample<SampleHeader> | undefined = $state(undefined)

  // === FUNCTIONS ==============================

  // CALLED IMMEDIATELY
  // This creates buffers for each sample in each pack
  function createBuffers(packs: Packs): Tone.ToneAudioBuffers {
    const urlsObject = packs.reduce(
      (result, pack) => {
        pack.samples.forEach((sample) => {
          // I think the buffers are being wrongly assigned to the samples here, because
          // they're using indices rather than ids
          result[sample.id.toString() as string] = sample.url
        })
        return result
      },
      {} as { [key: string]: string }
    )
    return new Tone.ToneAudioBuffers(urlsObject, () => {})
  }

  // This adds the sampler, filter and other Tone components to each SampleHeader, making a Sample
  function addToneToSamples(packs: Packs) {
    let toned_samples = []
    for (let i = 0; i < packs.length; i++) {
      for (let j = 0; j < packs[i].samples.length; j++) {
        toned_samples.push(
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
    return toned_samples
  }

  // This loads each Sampler with its buffer, sets the starting parameters of
  // Tone elements, and connects them in a chain to Tone.Destination, which is the audio out
  function initSamples(
    toned_samples: Sample<SampleHeader>[],
    buffers: Tone.ToneAudioBuffers
  ) {
    for (let i = 0; i < toned_samples.length; i++) {
      const sample = toned_samples[i]
      sample.setSamplerBuffers(sample.pitch, buffers.get(sample.id.toString()))
      sample.sampler.chain(sample.filter, sample.panner, Tone.Destination)
    }
    return toned_samples
  }

  // CALLED ON EVENT
  function advanceActiveStep() {
    active_step_index = (active_step_index + 1) % 16
  }

  function selectSample(sample: Sample<SampleHeader> | undefined) {
    selected_sample = sample
    console.log(selected_sample)
  }

  function selectPack() {
    selected_pack_index = (selected_pack_index + 1) % packs.length
  }

  function triggerSample(sample: Sample<SampleHeader> | undefined) {
    // The audio context needs to be launched by a user action
    if (Tone.context.state !== 'running') {
      Tone.start()
    }
    // set the sample and effect params if determining them per step
    // then trigger the sampler attack
    if (sample) {
      sample.sampler.attack = 0.01
      sample.sampler.release = 0.1
      sample.filter.type = 'highpass'
      sample.filter.frequency.value = 1600
      // go team go
      sample.sampler.triggerAttack('C2', Tone.now())
    }
  }

  // === LIFECYCLE ==============================

  async function processSamples(packs: Packs) {
    console.log('packs:', packs)
    buffers = await createBuffers(packs)
    console.log('buffers:', buffers)
    toned_samples = addToneToSamples(packs)
    initialised_samples = await initSamples(toned_samples, buffers)
    SAMPLES = await initialised_samples
    console.log('SAMPLES:', SAMPLES)
  }

  processSamples(packs)

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
    <button class="tile" onclick={() => triggerSample(selected_sample)}
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
          <button
            class="moji tile"
            onclick={() =>
              selectSample(SAMPLES?.find((s) => s.id === sample.id))}
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
