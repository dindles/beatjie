<script lang="ts">
  // === IMPORTS ==============================

  import * as Tone from 'tone';

  // === Data
  import { packs } from '$lib/data/audio-packs';

  // === Audio types & classes
  import { Sample } from '$lib/audio-classes/sample.svelte';
  import { AudioContext } from '$lib/audio-classes/audio-context.svelte';
  import { AudioLoader } from '$lib/audio-classes/audio-loader.svelte';
  import { MainAudioBus, type MainAudioBusConfig } from '$lib/audio-classes/main-audio-bus.svelte';
  import { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte';

  // === Svelte components
  import Meta from '$lib/components/meta.svelte';
  import FontLoadingMessage from '$lib/components/font-loading-message.svelte';
  import IntroAudioContextPrompt from '$lib/components/intro-audio-context-prompt.svelte';
  import AudioPromptDenied from '$lib/components/audio-prompt-denied.svelte';
  import AudioLoadingMessage from '$lib/components/audio-loading-message.svelte';
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
  const main_audio_bus_config: MainAudioBusConfig = $state({
    highpass_freq: 500,
    distortion_init: 0,
    distortion_wet_amount: 0.8,
    analyser_resolution: 256,
    compressor_threshold: -6,
    compressor_attack: 0.05,
    compressor_release: 0.15,
    bit_crusher_bits: 4
  });

  const pitches = ['C2', 'E2', 'F2', 'C1'];

  let audio_context = new AudioContext();
  let audio_loader = new AudioLoader();
  let main_audio_bus = new MainAudioBus(main_audio_bus_config);
  let sequencer = new AudioSequencer();
  let feedback_state = new FeedbackState();

  let samples: Sample[] = $state([]);
  let selected_sample: Sample | undefined = $state(undefined);
  let pending_pattern_data: PatternData | null = $state(null);
  let preview_samples_active: boolean = $state(true);

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

  async function handleKeydown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
      await sequencer.togglePlayback();
    }

    // Pack selection with numbers 1-4
    const pack_number = parseInt(event.key);
    if (pack_number >= 1 && pack_number <= 4) {
      selected_pack_index = pack_number - 1;
      return;
    }

    // Sample selection with QWER/ASDF
    const sample_index = key_map[event.key.toLowerCase()];
    if (sample_index !== undefined) {
      const visible_samples = samples.filter((s) => s.pack === packs[selected_pack_index].name);
      const sample = visible_samples[sample_index];
      if (sample) {
        sample.play(Tone.now());
        selected_sample = sample;
      }
    }

    // Preview toggle
    if (event.key.toLowerCase() === 'p') {
      preview_samples_active = !preview_samples_active;
      return;
    }

    // Sample effects (z, x, c, v) - require selected_sample
    if (selected_sample) {
      switch (event.key.toLowerCase()) {
        case 'z': // mute
          main_audio_bus.toggleSampleMute(selected_sample, !selected_sample.is_muted);
          selected_sample.is_muted = !selected_sample.is_muted;
          break;
        case 'x': // pitch cycle
          const current_index = pitches.indexOf(selected_sample.pitch);
          const next_index = (current_index + 1) % pitches.length;
          selected_sample.pitch = pitches[next_index] as typeof selected_sample.pitch;
          break;
        case 'c': // delay
          main_audio_bus.toggleSampleDelay(selected_sample, !selected_sample.delay_is_active);
          selected_sample.delay_is_active = !selected_sample.delay_is_active;
          break;
        case 'v': // reverb
          main_audio_bus.toggleSampleReverb(selected_sample, !selected_sample.reverb_is_active);
          selected_sample.reverb_is_active = !selected_sample.reverb_is_active;
          break;
      }
    }

    // Global effects (b, n)
    if (event.key.toLowerCase() === 'b') {
      main_audio_bus.toggleMainHighPass(!main_audio_bus.mainIsHighPassed);
    }
    if (event.key.toLowerCase() === 'n') {
      main_audio_bus.toggleMainDistortion(!main_audio_bus.mainIsDistorted);
    }

    // BPM (arrow keys)
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const new_bpm = Math.min(200, sequencer.getBPM() + 1);
      sequencer.setBPM(new_bpm);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const new_bpm = Math.max(60, sequencer.getBPM() - 1);
      sequencer.setBPM(new_bpm);
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
        console.log(
          '%cbeatjie\n\n%chave fun, make beats!\n\nhttps://github.com/dindles/beatjie\n\nhttps://dindles.net',
          'font-size: 20px; font-weight: bold;',
          'font-size: 12px; color: gray;'
        );
        app_state['audio-prompt'] = true;
      });
    }
  });

  async function handleAudioConfirm() {
    await audio_context.initAudioContext();
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
    if (app_state['audio-loading'] && audio_loader.buffersAreLoaded() && samples.length > 0) {
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
    // Set BPM
    sequencer.setBPM(pattern.bpm);

    // Set main effects
    main_audio_bus.toggleMainHighPass(pattern.main_highpass);
    main_audio_bus.toggleMainDistortion(pattern.main_distortion);

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
      main_audio_bus.toggleSampleDelay(sample, sample_data.delay_active);
      main_audio_bus.toggleSampleReverb(sample, sample_data.reverb_active);
      main_audio_bus.toggleSampleMute(sample, sample_data.muted);
    });

    // Rebuild sequences with new pattern
    sequencer.makeSequences(samples);
  }

  // === Load data
  async function audioDataToCode() {
    samples = await audio_loader.processPacks(packs);
    main_audio_bus.setChains(samples);
    await sequencer.makeSequences(samples);
  }

  // === Cleanup
  $effect(() => {
    return () => {
      sequencer.dispose();
      main_audio_bus.dispose(samples);
      audio_loader.dispose();
      audio_context.dispose();
    };
  });
</script>

<Meta />

<svelte:window onkeydown={handleKeydown} />

<main>
  <div class="app" class:border={app_state['app-ready']}>
    {#if app_state['fonts-loading']}
      <FontLoadingMessage />
    {:else if app_state['audio-prompt']}
      <IntroAudioContextPrompt {handleAudioConfirm} {handleAudioDeny} />
    {:else if app_state['audio-prompt-denied']}
      <AudioPromptDenied />
    {:else if app_state['audio-loading']}
      <AudioLoadingMessage />
    {:else if app_state['app-ready']}
      <AppSettings {main_audio_bus} {sequencer} {samples} {selected_pack_index} {feedback_state} />
      <Display {main_audio_bus} {selected_sample} {feedback_state} />
      <Samples
        {pitches}
        {packs}
        {samples}
        {audio_context}
        {main_audio_bus}
        {feedback_state}
        bind:selected_sample
        bind:selected_pack_index
        bind:preview_samples_active
      />
      <Sequencer {samples} {selected_sample} {sequencer} {feedback_state} />
      <TransportAndMainSettings {sequencer} {main_audio_bus} {feedback_state} />
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
    position: relative;
    min-width: 360px;
    max-width: 98vw;
    min-height: 600px;
    max-height: 88vh;
    overflow: hidden;
    padding: 0.7%;
  }
</style>
