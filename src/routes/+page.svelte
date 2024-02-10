<script lang="ts">
  // === IMPORTS ================================
  // Svelte

  // Tone
  import * as Tone from 'tone'

  // Data
  import { packs } from '$lib/assets/audio/packs'
  import { Sample, type SampleHeader, type Packs } from '$lib/models'

  // === VARIABLES ==============================
  // Tone
  const synth = new Tone.Synth()

  // Sequencer grid
  const sequencer_grid = Array(16)
  let active_step_index = $state(0)

  // Data
  let buffers: Tone.ToneAudioBuffers
  let loaded_samples: Sample<SampleHeader>[]
  let SAMPLES: Sample<SampleHeader>[] | undefined = $state([])
  let selected_pack_index = $state(0)

  // === FUNCTIONS ==============================
  // Called immediately
  function createBuffers(packs: Packs): Tone.ToneAudioBuffers {
    // Use the reduce function to transform the packs array into the desired object format
    const urlsObject = packs.reduce((result, pack) => {
      pack.samples.forEach((sample) => {
        result[sample.id] = sample.url
      })
      return result
    }, {} as Tone.ToneAudioBuffers)
    return urlsObject
  }

  function makeSamples(packs: Packs) {
    let loaded_samples = []
    for (let i = 0; i < packs.length; i++) {
      for (let j = 0; j < packs[i].samples.length; j++) {
        loaded_samples.push(
          new Sample(
            packs[i].samples[j].id,
            packs[i].samples[j].name,
            packs[i].samples[j].emoji,
            packs[i].samples[j].url
          )
        )
      }
    }
    return loaded_samples
  }

  // Called on effect
  function chainSamples(loaded_samples: Sample<SampleHeader>[]) {
    for (let i = 0; i < loaded_samples.length; i++) {
      const sample = loaded_samples[i]
      sample.sampler.connect(sample.envelope)
      sample.envelope.connect(sample.filter)
      sample.filter.connect(sample.panner)
      sample.panner.connect(Tone.getDestination())
      console.log('sample ' + i + ' chained')
    }
    console.log('all samples chained')
    return loaded_samples
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
    console.log('SAMPLES:', SAMPLES)

    if (Tone.context.state !== 'running') {
      Tone.start()
    }
    // temp for testing
    if (SAMPLES) {
      SAMPLES[8].sampler.triggerAttack('C2', Tone.now())
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
  loaded_samples = makeSamples(packs)
  console.log('loaded_samples:', loaded_samples)

  $effect(() => {
    if (loaded_samples) {
      SAMPLES = chainSamples(loaded_samples)
    }
    console.log('samples:', SAMPLES)
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
