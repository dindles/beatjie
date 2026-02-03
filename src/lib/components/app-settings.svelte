<script lang="ts">
  import * as Tone from 'tone';
  import type { Sample } from '$lib/audio-classes/sample.svelte';
  import type { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte';
  import type { MainAudioBus } from '$lib/audio-classes/main-audio-bus.svelte';
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte';
  import { saveColorSettings, loadColorSettings, AVAILABLE_HUES } from '$lib/utils/color-storage';
  import { serializePattern, createShareURL } from '$lib/utils/pattern-sharing';

  interface Props {
    sequencer: AudioSequencer;
    main_audio_bus: MainAudioBus;
    samples: Sample[];
    selected_pack_index: number;
    feedback_state: FeedbackState;
  }

  let { sequencer, main_audio_bus, samples, selected_pack_index, feedback_state }: Props = $props();

  function calculateChroma(lightness: number): number {
    return 0.15 + 0.1 * (1 - Math.abs(lightness - 0.5) * 2);
  }

  let hue_emoji_rotation = $state(0);
  let user_lightness = $state(0.9); // 0 - 1
  let user_hue = $state(AVAILABLE_HUES[Math.floor(Math.random() * AVAILABLE_HUES.length)]);
  let chroma = $derived(calculateChroma(user_lightness));
  let user_colour = $derived(`oklch(${user_lightness} ${chroma} ${user_hue})`);
  let black_or_white = $state('oklch(0 0 0)');
  let theme: 'light' | 'dark' = $state('light');
  let disco_toggle = $state(false);

  // Load saved color settings on mount
  let initialized = false;
  $effect(() => {
    if (!initialized) {
      initialized = true;
      const saved = loadColorSettings();
      if (saved) {
        user_hue = saved.hue;
        user_lightness = saved.lightness;
        theme = saved.theme;
        black_or_white = theme === 'light' ? 'oklch(0 0 0)' : 'oklch(1 0 0)';
      }
    }
  });

  async function deleteSequences() {
    await sequencer.stopPlayback();

    samples.forEach((sample: Sample) => {
      sample.sequence = new Array(sample.sequence.length).fill(false);
      sample.pitch = 'C2';
      sample.toggleDelay(false);
      sample.toggleReverb(false);
    });

    await sequencer.makeSequences(samples);
  }

  function changeHue() {
    const current_index = AVAILABLE_HUES.indexOf(user_hue);
    const next_index = (current_index + 1) % AVAILABLE_HUES.length;
    user_hue = AVAILABLE_HUES[next_index];
    saveColorSettings({ hue: user_hue, lightness: user_lightness, theme });
  }

  function changeTheme() {
    user_lightness = user_lightness === 0.9 ? 0.5 : 0.9;
    theme = theme === 'light' ? 'dark' : 'light';
    black_or_white = theme === 'light' ? 'oklch(0 0 0)' : 'oklch(1 0 0)';
    saveColorSettings({ hue: user_hue, lightness: user_lightness, theme });
  }

  function toggleDisco() {
    disco_toggle = !disco_toggle;
    // Save colour state when turning disco mode off
    if (!disco_toggle) {
      saveColorSettings({ hue: user_hue, lightness: user_lightness, theme });
    }
  }

  async function handleSharePattern() {
    try {
      const current_bpm = sequencer.getBPM();
      const pattern_data = serializePattern(
        current_bpm,
        selected_pack_index,
        main_audio_bus,
        samples
      );
      const share_url = createShareURL(pattern_data);

      // Copy to clipboard
      await navigator.clipboard.writeText(share_url);

      // Show confirmation via global feedback
      feedback_state.showConfirmation('URL copied');
    } catch (error) {
      console.error('Failed to share pattern:', error);
      feedback_state.showConfirmation('Failed to copy');
    }
  }

  $effect(() => {
    if (disco_toggle) {
      const interval = Tone.getTransport().scheduleRepeat(() => {
        changeHue();
      }, '4n');
      return () => Tone.getTransport().clear(interval);
    }
  });

  // this is the piping that lets us apply reactive state to the app.css styles
  $effect(() => {
    document.documentElement.style.setProperty('--user-colour', user_colour);
    document.documentElement.style.setProperty('--black-or-white', black_or_white);
  });
</script>

<div class="controls-container">
  <button
    class="delete emoji-small"
    onmouseenter={() => feedback_state.showTooltip('pattern delete')}
    onmouseleave={() => feedback_state.clear()}
    onclick={deleteSequences}
  >
    🗑
  </button>

  <div class="color-controls">
    <button
      class="hue-control emoji-small"
      style="transform: rotate({hue_emoji_rotation}deg)"
      onmouseenter={() => feedback_state.showTooltip('colour')}
      onmouseleave={() => feedback_state.clear()}
      onclick={() => {
        hue_emoji_rotation += 90;
        changeHue();
      }}
    >
      🎨
    </button>
    <button
      class="light-dark emoji-small"
      onmouseenter={() => feedback_state.showTooltip('theme')}
      onmouseleave={() => feedback_state.clear()}
      onclick={changeTheme}
    >
      {theme === 'light' ? '🤩' : '😎'}
    </button>
    <button
      class="emoji-small disco-ball {disco_toggle ? 'active' : ''}"
      onmouseenter={() => feedback_state.showTooltip('disco mode')}
      onmouseleave={() => feedback_state.clear()}
      onclick={toggleDisco}
    >
      🪩
    </button>
  </div>

  <div class="right-controls">
    <button
      class="share emoji-small"
      onmouseenter={() => feedback_state.showTooltip('share pattern via URL')}
      onmouseleave={() => feedback_state.clear()}
      onclick={handleSharePattern}
    >
      🔗
    </button>
  </div>
</div>

<style>
  .controls-container {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.5rem;
  }

  .delete {
    margin-right: auto;
  }

  .color-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .hue-control {
    transition: transform 0.3s ease;
  }

  .right-controls {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .disco-ball {
    transition: transform 0.3s ease;
    border-radius: var(--border-radius);
  }
</style>
