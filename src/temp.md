- in audio-engine.svelte.ts:
  AudioEngine should allow us to properly init the Tone.js Audio Context and properly dispose of Tone.js objects
  Should include initAudioContext() and dispose() methods
  let audio_engine = $state(new AudioEngine(config))
- in audio-engine.svelte.ts:
  AudioDataToCode should take our packs data,
  properly load buffers and flip a buffers_are_loaded variable,
  create Sample objects for each sample, and
  return a SAMPLES array.
  Should include makeBuffers(), makeSamples(), loadBuffers() methods
  let audio_data_to_code = $state(new AudioDataToCode)
- in audio-engine.svelte.ts:
  RoutingAndFX should set up our
  Should include setChains(), toggleHighPass(), toggleDistortion(), toggleDistortion() methods
  let audio_routing_and_effects = $state(new RoutingAndFX)
- in audio-sequencer.svelte.ts:
  AudioSequencer should init and control the sequencer
  Should include makeSequences(), togglePlayback(), setBPM() methods
  let audio_sequencer = $state(new AudioSequencer(config))

The Svelte app component should define the SAMPLES variable, and call on the various audio objects we've instantiated.
