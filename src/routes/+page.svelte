<script lang="ts">
  // === IMPORTS ===
  // Svelte

  // Tone
  import * as Tone from 'tone'

  // === DATA ===

  // === VARIABLES ===
  // Tone
  const synth = new Tone.Synth()
  // Sequencer grid
  const seq_length = 16
  const steps = Array(seq_length)
  let active_step_index = 0

  // === FUNCTIONS ===
  // Called to initialise
  synth.toDestination()

  // Called on event
  // temp for testing
  function notePlay() {
    if (Tone.context.state !== 'running') {
      Tone.start()
    }
    synth.triggerAttackRelease('G1', '8n')
  }

  function advanceSelectedStep() {
    active_step_index = (active_step_index + 1) % seq_length
  }
</script>

<div class="header">
  <h1>mojibeat</h1>
  <p class="label">🔊</p>
</div>
<main>
  <div class="spacer" />
  <h2>GRID</h2>
  <div
    class="grid"
    style="grid-template-rows: repeat(4, 80px); grid-template-columns: repeat(4, 80px);"
  >
    {#each steps as step, index}
      <div class="tile" class:active={active_step_index === index}>
        {index}
      </div>
    {/each}
  </div>
  <div class="spacer" />
  <h2>FUNCTIONALITY</h2>
  <button class="tile" onclick={advanceSelectedStep}>next step</button>
  <button class="tile" onclick={notePlay}>play</button>
  <div class="spacer" />

  <h2>SAMPLES</h2>
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

  .grid {
    display: grid;
    place-items: center;
  }

  .tile {
    display: grid;
    place-items: center;
    width: 70px;
    aspect-ratio: 1;
    background-color: white;
    border: solid 3px;
    border-radius: 3px;
  }

  .tile.active {
    background-color: teal;
  }
</style>
