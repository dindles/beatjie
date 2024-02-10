<script lang="ts">
  // === IMPORTS ===
  // Svelte

  // Tone
  import * as Tone from 'tone'

  // Data
  import { packs } from '$lib/assets/audio/packs'
  import { Sample, type SampleHeader, type Packs } from '$lib/models'

  // === VARIABLES ===
  // Tone
  const synth = new Tone.Synth()

  // Sequencer grid
  const sequencer_grid = Array(16)
  let active_step_index = $state(0)
  let selected_pack_index = $state(0)
  // let loaded_samples: Sample<SampleHeader>[]

  // === FUNCTIONS ===
  // Called immediately
  synth.toDestination()

  const loaded_samples = makeSamples(packs)
  const avail_samples = chainSamples(loaded_samples)
  console.log(avail_samples)

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
  function triggerNotes() {
    if (Tone.context.state !== 'running') {
      Tone.start()
    }
    // temp for testing
    synth.triggerAttackRelease('G1', '8n')
  }

  function advanceActiveStep() {
    active_step_index = (active_step_index + 1) % 16
  }

  function selectPack() {
    selected_pack_index = (selected_pack_index + 1) % packs.length
  }
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
    <button class="tile" onclick={triggerNotes}>play</button>
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
