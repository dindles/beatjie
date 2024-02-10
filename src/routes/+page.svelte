<script lang="ts">
  // === IMPORTS ================================
  // Svelte

  // Tone
  import * as Tone from 'tone'

  // Data
  import { packs } from '$lib/assets/audio/packs'
  import { Sample, type SampleHeader, type Packs } from '$lib/models'
  import type { MidiNote } from 'tone/build/esm/core/type/NoteUnits'

  // === VARIABLES ==============================
  // Tone
  const synth = new Tone.Synth()

  // Sequencer grid
  const sequencer_grid = Array(16)
  let active_step_index = $state(0)

  // Data
  let buffers: Tone.ToneAudioBuffers
  let Toned_samples: Sample<SampleHeader>[]
  let initialised_samples: Sample<SampleHeader>[]
  let SAMPLES: Sample<SampleHeader>[] | undefined
  let selected_pack_index = $state(0)

  // === FUNCTIONS ==============================
  // Called immediately
  function createBuffers(packs: Packs): Tone.ToneAudioBuffers {
    const urlsObject = packs.reduce(
      (result, pack) => {
        pack.samples.forEach((sample) => {
          result[sample.id.toString() as string] = sample.url
        })
        return result
      },
      {} as { [key: string]: string }
    )
    return new Tone.ToneAudioBuffers(urlsObject, () => {
      console.log('buffers loaded', buffers)
    })
  }

  function makeSamples(packs: Packs) {
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
    return Toned_samples
  }

  function setSampleParams(samples: Sample<SampleHeader>[]) {
    samples.forEach((sample) => {
      sample.setSamplerParams(sample.pitch, buffers.get(sample.id.toString()))
      sample.setEnvParams(0.5, 0.5, 0.5, 0.5)
      sample.setFilterParams('lowpass', 2000)
    })
    return samples
  }

  // Called on effect
  function chainSamples(Toned_samples: Sample<SampleHeader>[]) {
    for (let i = 0; i < Toned_samples.length; i++) {
      const sample = Toned_samples[i]
      sample.sampler.toDestination()
      // sample.sampler.chain(
      //   sample.envelope,
      //   sample.filter,
      //   sample.panner,
      //   // sample.analyser
      //   // sample.meter
      //   Tone.Destination
      // )
      console.log('sample ' + i + ' chained')
    }
    console.log('all samples chained')
    return Toned_samples
  }

  // Called on event
  function triggerHelloTone() {
    if (Tone.context.state !== 'running') {
      Tone.start()
    }
    // temp for testing
    synth.triggerAttackRelease('A#3', '8n')
  }

  function triggerSample() {
    console.log('trigger sample function called')

    if (Tone.context.state !== 'running') {
      Tone.start()
      console.log('Tone.started', Tone.context.state)
    }
    // temp for testing
    if (SAMPLES?.length) {
      console.log('SAMPLES exists, and we should be able to trigger')
      console.log(SAMPLES[10])
      SAMPLES[10].sampler.triggerAttackRelease('C3', Tone.now())
    }
  }

  function advanceActiveStep() {
    active_step_index = (active_step_index + 1) % 16
  }

  function selectPack() {
    selected_pack_index = (selected_pack_index + 1) % packs.length
  }

  // === LIFECYCLE ==============================
  synth.toDestination()
  buffers = createBuffers(packs)
  console.log('buffers:', buffers)
  Toned_samples = makeSamples(packs)
  console.log('Toned_samples:', Toned_samples)
  initialised_samples = setSampleParams(Toned_samples)
  console.log('initialised_samples:', initialised_samples)
  SAMPLES = chainSamples(Toned_samples)
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
    <button class="tile" onclick={triggerHelloTone}>play helloTone</button>
    <button class="tile" onclick={triggerSample}>play sample</button>
    <button class="tile" onclick={selectPack}
      >selected pack: {packs[selected_pack_index].name}</button
    >
  </div>
  <h2>SAMPLES</h2>
  <div class="samples">
    {#key selected_pack_index}
      <div class="pack grid">
        {#each packs[selected_pack_index].samples as sample}
          <button class="moji tile">{sample.emoji}</button>
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
