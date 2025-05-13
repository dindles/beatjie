<!--display.svelte -->
<script lang="ts">
  import type { AudioChain } from '$lib/audio/audio-chain.svelte'
  import type { Sample } from '$lib/audio/audio-models.svelte'

  interface Props {
    audio_chain: AudioChain
    selected_sample: Sample | undefined
  }

  let { audio_chain, selected_sample }: Props = $props()
  let canvas: HTMLCanvasElement
  let analysis_values: Float32Array | Float32Array[] = $state([])

  const AMPLITUDE_THRESHOLD = 0.001

  function resizeCanvas() {
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }

  $effect(() => {
    function updateAnalysis() {
      analysis_values = audio_chain.getAnalyserValues()
      requestAnimationFrame(updateAnalysis)
    }

    updateAnalysis()

    return () => {
      analysis_values = []
    }
  })

  function draw() {
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const dim = Math.min(canvas.width, canvas.height)

    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--black-or-white')
      .trim()
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--user-colour')
      .trim()
    ctx.lineWidth = dim * 0.08

    if (!analysis_values || analysis_values.length === 0) return

    const values =
      analysis_values instanceof Float32Array
        ? analysis_values
        : analysis_values[0]

    const maxAmplitude = Math.max(
      ...Array.from(values).map((value) => Math.abs(value as number))
    )
    const scalingFactor = maxAmplitude > 0 ? 0.2 / maxAmplitude : 1

    if (maxAmplitude < AMPLITUDE_THRESHOLD) {
      return
    }

    ctx.beginPath()
    for (let i = 0; i < values.length; i++) {
      const x = (i / values.length) * canvas.width
      const y =
        canvas.height / 2 + values[i] * scalingFactor * canvas.height * 1.8

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
  }

  $effect(() => {
    if (!canvas) return

    resizeCanvas()
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)

    let animationFrameId: number

    function animate() {
      draw()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      resizeObserver.disconnect()
    }
  })
</script>

<div class="display">
  {#if !selected_sample}
    <div class="messages">
      <div class="select-sample-message text-small">
        <div class="select-sample-message-emoji emoji-small">👇</div>
        <i>pick a sound</i>
        <div class="select-sample-message-emoji emoji-small">👇</div>
      </div>
    </div>
  {/if}
  <canvas bind:this={canvas} class:hidden={!selected_sample}></canvas>
</div>

<style>
  .display {
    position: relative;
    width: 100%;
    height: auto;
  }

  .messages {
    display: grid;
    place-items: center;
  }

  .select-sample-message {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    z-index: 1;
  }

  .select-sample-message-emoji {
    font-size: 2rem;
  }

  .hidden {
    display: none;
  }

  canvas {
    width: 100%;
    aspect-ratio: 4/0.5;
    display: block;
  }
</style>
