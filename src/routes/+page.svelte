<script lang="ts">
  // === IMPORTS ==============================

  import * as Tone from 'tone';

  // === Data
  import { packs } from '$lib/data/audio-packs';

  // === Audio types & classes
  import { Sample } from '$lib/classes/audio-models.svelte';
  import { AudioEngine } from '$lib/classes/audio-engine.svelte';
  import { AudioDataToCode } from '$lib/classes/audio-data-to-code.svelte';
  import { AudioChain, type ChainConfig } from '$lib/classes/audio-chain.svelte';
  import { AudioSequencer } from '$lib/classes/audio-sequencer.svelte';

  // === Svelte components
  import Meta from '$lib/components/meta.svelte';
  import Cursor from '$lib/components/cursor.svelte';
  import FontLoadingMessage from '$lib/components/font-loading-message.svelte';
  import AudioContextPrompt from '$lib/components/audio-context-prompt.svelte';
  import AudioPromptDenied from '$lib/components/audio-prompt-denied.svelte';
  import AudioLoadingMessage from '$lib/components/audio-loading-message.svelte';
  import HelpOverlay from '$lib/components/help-overlay.svelte';
  import AppSettings from '$lib/components/app-settings.svelte';
  import Display from '$lib/components/display.svelte';
  import Samples from '$lib/components/samples.svelte';
  import Sequencer from '$lib/components/sequencer.svelte';
  import TransportAndMainSettings from '$lib/components/transport-and-main-settings.svelte';

  // === Utils
  import {
    loadColorSettings,
    getDefaultColorSettings,
    applyColorSettingsToDOM
  } from '$lib/utils/color-storage';
  import { getPatternFromURL, type PatternData } from '$lib/utils/pattern-sharing';
  import { FeedbackState } from '$lib/utils/feedback-state.svelte';

  // === VARIABLES ============================

  // === Audio
  const chain_config: ChainConfig = $state({
    highpass_freq: 500,
    distortion_init: 0.2,
    distortion_amount: 1,
    analyser_resolution: 256,
    compressor_threshold: -6,
    compressor_attack: 0.05,
    compressor_release: 0.15,
    bit_crusher_bits: 4
  });

  const pitches = ['C2', 'E2', 'F2', 'C1'];

  let audio_engine = new AudioEngine();
  let audio_data_to_code = new AudioDataToCode();
  let audio_chain = new AudioChain(chain_config);
  let audio_sequencer = new AudioSequencer();
  let feedback_state = new FeedbackState();

  let samples: Sample[] = $state([]);
  let selected_sample: Sample | undefined = $state(undefined);
  let pending_pattern_data: PatternData | null = $state(null);

  // === State
  interface AppState {
    'fonts-loading': boolean;
    'audio-prompt': boolean;
    'audio-prompt-denied': boolean;
    'audio-loading': boolean;
    'app-ready': boolean;
  }

  let app_state: AppState = $state({
    'fonts-loading': true,
    'audio-prompt': false,
    'audio-prompt-denied': false,
    'audio-loading': false,
    'app-ready': false
  });

  let help_overlay_active = $state(false);
  let selected_pack_index: number = $state(Math.floor(Math.random() * packs.length));

  // === KEYBOARD EVENTS ========================

  const key_map: Record<string, number> = {
    q: 0,
    w: 1,
    e: 2,
    r: 3,
    a: 4,
    s: 5,
    d: 6,
    f: 7
  };

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      help_overlay_active = false;
    }
    if (event.key === ' ') {
      event.preventDefault();
      audio_sequencer.togglePlayback();
    }

    // Pack selection with numbers 1-4
    const pack_number = parseInt(event.key);
    if (pack_number >= 1 && pack_number <= 4) {
      selected_pack_index = pack_number - 1;
      return;
    }

    const sample_index = key_map[event.key.toLowerCase()];
    if (sample_index !== undefined) {
      const visible_samples = samples.filter((s) => s.pack === packs[selected_pack_index].name);
      const sample = visible_samples[sample_index];
      if (sample) {
        sample.play(Tone.now());
        selected_sample = sample;
      }
    }
  }

  // === LIFECYCLE ==============================

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.fonts.ready.then(() => {
        // Try to load pattern from URL first
        pending_pattern_data = getPatternFromURL();

        // Load and apply saved color settings before showing audio prompt
        const saved_colors = loadColorSettings() ?? getDefaultColorSettings();
        applyColorSettingsToDOM(saved_colors);

        // Override random pack selection if pattern exists
        if (pending_pattern_data) {
          selected_pack_index = pending_pattern_data.selected_pack_index;
        }

        app_state['fonts-loading'] = false;
        console.log('fonts loaded');
        app_state['audio-prompt'] = true;
      });
    }
  });

  async function handleAudioConfirm() {
    await audio_engine.initAudioContext();
    app_state['audio-prompt'] = false;
    app_state['audio-loading'] = true;
  }

  function handleAudioDeny() {
    app_state['audio-prompt'] = false;
    app_state['audio-prompt-denied'] = true;
  }

  $effect(() => {
    if (app_state['audio-loading']) {
      audioDataToCode();
    }
  });

  $effect(() => {
    if (app_state['audio-loading'] && audio_data_to_code.buffersAreLoaded() && samples.length > 0) {
      app_state['audio-loading'] = false;
      app_state['app-ready'] = true;
    }
  });

  // Apply pattern from URL after app is ready
  $effect(() => {
    if (app_state['app-ready'] && pending_pattern_data) {
      applyPatternToState(pending_pattern_data);
      pending_pattern_data = null; // Clear to prevent re-application
    }
  });

  function applyPatternToState(pattern: PatternData) {
    console.log('=== APPLY PATTERN DEBUG ===');
    console.log('Pattern samples:', pattern.samples.length);
    console.log(
      'Samples with active steps:',
      pattern.samples.filter((s) => s.sequence.some(Boolean)).length
    );

    // Check what we're trying to apply
    pattern.samples.forEach((sample_data) => {
      const activeSteps = sample_data.sequence.filter(Boolean).length;
      if (activeSteps > 0) {
        console.log(
          `Pattern has sample ${sample_data.id}: ${activeSteps} steps, pitch=${sample_data.pitch}`
        );
      }
    });

    console.log('Available samples in app:', samples.length);

    // Set BPM
    audio_sequencer.setBPM(pattern.bpm);

    // Set main effects
    audio_chain.toggleMainHighPass(pattern.main_highpass);
    audio_chain.toggleMainDistortion(pattern.main_distortion);

    // Apply sample states
    pattern.samples.forEach((sample_data) => {
      const sample = samples.find((s) => s.id === sample_data.id);
      if (!sample) return;

      sample.sequence = [...sample_data.sequence];
      sample.pitch = sample_data.pitch as any;
      sample.delay_is_active = sample_data.delay_active;
      sample.reverb_is_active = sample_data.reverb_active;
      sample.is_muted = sample_data.muted;

      // Apply effects through audio chain
      audio_chain.toggleSampleDelay(sample, sample_data.delay_active);
      audio_chain.toggleSampleReverb(sample, sample_data.reverb_active);
      audio_chain.toggleSampleMute(sample, sample_data.muted);
    });

    // Rebuild sequences with new pattern
    audio_sequencer.makeSequences(samples);

    console.log('Pattern loaded from URL');
  }

  // === Load data
  async function audioDataToCode() {
    samples = await audio_data_to_code.processPacks(packs);
    audio_chain.setChains(samples);
    audio_sequencer.makeSequences(samples);
  }

  // === Cleanup
  $effect(() => {
    return () => {
      audio_sequencer.dispose();
      audio_chain.dispose(samples);
      audio_engine.dispose();
    };
  });
</script>

<Meta />

<Cursor />

<svelte:window onkeydown={handleKeydown} />

<main>
  <div class="app" class:border={app_state['app-ready']}>
    {#if app_state['fonts-loading']}
      <FontLoadingMessage />
    {:else if app_state['audio-prompt']}
      <AudioContextPrompt {handleAudioConfirm} {handleAudioDeny} />
    {:else if app_state['audio-prompt-denied']}
      <AudioPromptDenied />
    {:else if app_state['audio-loading']}
      <AudioLoadingMessage />
    {:else if app_state['app-ready']}
      {#if help_overlay_active}
        <HelpOverlay bind:help_overlay_active />
      {/if}
      <AppSettings
        bind:help_overlay_active
        {audio_chain}
        {audio_sequencer}
        {samples}
        {selected_pack_index}
        {feedback_state}
      />
      <Display {audio_chain} {selected_sample} {feedback_state} />
      <Samples
        {pitches}
        {packs}
        {samples}
        {audio_engine}
        {audio_chain}
        {feedback_state}
        bind:selected_sample
        bind:selected_pack_index
      />
      <Sequencer {samples} {selected_sample} {audio_sequencer} {feedback_state} />
      <TransportAndMainSettings {audio_sequencer} {audio_chain} {feedback_state} />
    {/if}
  </div>
</main>

<style>
  main {
    height: 100%;
    display: grid;
    place-items: center;
  }

  .app {
    cursor: none;
    position: relative;
    min-width: 360px;
    max-width: 98vw;
    min-height: 600px;
    max-height: 88vh;
    overflow: hidden;
    padding: 0.7%;
  }
</style>
