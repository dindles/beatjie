<script lang="ts">
  import type { MainAudioBus } from '$lib/audio-classes/main-audio-bus.svelte';
  import type { Sample } from '$lib/audio-classes/sample.svelte';
  import type { FeedbackState } from '$lib/utils/feedback-state.svelte';
  import GlobalFeedback from '$lib/components/global-feedback.svelte';

  interface Props {
    main_audio_bus: MainAudioBus;
    selected_sample: Sample | undefined;
    feedback_state: FeedbackState;
  }

  let { main_audio_bus, selected_sample: _selected_sample, feedback_state }: Props = $props();
  let canvas: HTMLCanvasElement;
  let analysis_values: Float32Array | Float32Array[] = $state([]);

  const AMPLITUDE_THRESHOLD = 0.001;

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  $effect(() => {
    function updateAnalysis() {
      analysis_values = main_audio_bus.getAnalyserValues();
      requestAnimationFrame(updateAnalysis);
    }

    updateAnalysis();

    return () => {
      analysis_values = [];
    };
  });

  function draw() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dim = Math.min(canvas.width, canvas.height);

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--black-or-white')
      .trim();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--user-colour')
      .trim();
    ctx.lineWidth = dim * 0.08;

    if (!analysis_values || analysis_values.length === 0) return;

    const values = analysis_values instanceof Float32Array ? analysis_values : analysis_values[0];

    const max_amplitude = Math.max(...Array.from(values).map((value) => Math.abs(value as number)));
    const scaling_factor = max_amplitude > 0 ? 0.2 / max_amplitude : 1;

    if (max_amplitude < AMPLITUDE_THRESHOLD) {
      return;
    }

    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
      const x = (i / values.length) * canvas.width;
      const y = canvas.height / 2 + values[i] * scaling_factor * canvas.height * 1.8;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  $effect(() => {
    if (!canvas) return;

    resizeCanvas();
    const resize_observer = new ResizeObserver(resizeCanvas);
    resize_observer.observe(canvas);

    let animation_frame_id: number;

    function animate() {
      draw();
      animation_frame_id = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animation_frame_id) {
        cancelAnimationFrame(animation_frame_id);
      }
      resize_observer.disconnect();
    };
  });
</script>

<div class="display">
  <canvas bind:this={canvas}></canvas>
  <GlobalFeedback {feedback_state} />
</div>

<style>
  .display {
    position: relative;
  }

  canvas {
    aspect-ratio: 8/1.2;
    width: 100%;
    display: block;
  }
</style>
