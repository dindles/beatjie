<!-- transport-and-main-settings.svelte -->
<script lang="ts">
  import BPMSelector from '$lib/components/bpm-selector.svelte'
  import type { AudioSequencer } from '$lib/audio/audio-sequencer.svelte'
  import type { AudioChain } from '$lib/audio/audio-chain.svelte'

  interface Props {
    audio_sequencer: AudioSequencer
    audio_chain: AudioChain
  }

  let { audio_sequencer, audio_chain }: Props = $props()

  async function toggleSeqPlayback() {
    await audio_sequencer.togglePlayback()
  }
</script>

<div class="transport-and-main-settings">
  <div class="transport">
    <button class="emoji-large border" onclick={() => toggleSeqPlayback()}
      >{audio_sequencer.is_playing ? '⏹' : '▶'}</button
    >
  </div>

  <div class="main-settings">
    <button
      class="emoji-large border"
      onclick={() =>
        audio_chain.toggleMainHighPass(!audio_chain.mainIsHighPassed)}
      class:active={audio_chain.mainIsHighPassed}>🫴</button
    >
    <button
      class:active={audio_chain.mainIsDistorted}
      class="emoji-large border"
      onclick={() =>
        audio_chain.toggleMainDistortion(!audio_chain.mainIsDistorted)}
      >💥</button
    >

    <div class="bpm-control border">
      <BPMSelector {audio_sequencer} />
    </div>
  </div>
</div>

<style>
  .transport-and-main-settings {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing);
    margin-top: 0.4em;
    margin-bottom: 0.4em;
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
</style>
