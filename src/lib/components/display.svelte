<!-- Display.svelte -->
<script lang="ts">
  let { analysisValues } = $props<{
    analysisValues: Float32Array | Float32Array[]
  }>()

  let canvas: HTMLCanvasElement
  let animationFrameId: number

  // Utility functions remain the same...

  function resizeCanvas() {
    if (!canvas) return
    // Get the actual rendered size of the canvas from CSS
    const rect = canvas.getBoundingClientRect()
    // Set the canvas internal dimensions to match its CSS display size
    canvas.width = rect.width
    canvas.height = rect.height
  }

  function draw() {
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const dim = Math.min(canvas.width, canvas.height)

    // Clear the canvas
    ctx.fillStyle = 'var(--black-or-white)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = 'var(--user-colour)'
    ctx.lineWidth = dim * 0.04

    // Utility - Vertical waveform scaling factor
    function calculateScalingFactor(analysis_values: Float32Array) {
      const maxAmplitude = Math.max(...analysis_values.map(Math.abs)) // Find the maximum absolute amplitude
      const scalingFactor = 0.2 / maxAmplitude // Calculate scaling factor based on max amplitude (0.9 to leave some padding)
      return scalingFactor
    }

    // Utility - Map one range to another
    function myMap(
      value: number,
      start1: number,
      stop1: number,
      start2: number,
      stop2: number
    ) {
      return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2
    }

    // Draw waveform if we have data
    if (analysisValues && analysisValues.length > 0) {
      const values =
        analysisValues instanceof Float32Array
          ? analysisValues
          : analysisValues[0]

      const scalingFactor = calculateScalingFactor(values)

      ctx.beginPath()
      for (let i = 0; i < values.length; i++) {
        const amplitude = values[i] * scalingFactor
        const x = myMap(i, 0, values.length - 1, 0, canvas.width)
        const y = canvas.height / 2 + amplitude * canvas.height

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }

    animationFrameId = requestAnimationFrame(draw)
  }

  // Set up resize observer to handle canvas resizing
  $effect(() => {
    if (!canvas) return

    // Initial setup
    resizeCanvas()

    // Create a resize observer to handle window/container resizing
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })

    resizeObserver.observe(canvas)

    // Start the animation
    draw()

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      resizeObserver.disconnect()
    }
  })
</script>

<div class="display">
  <canvas bind:this={canvas}></canvas>
  {@render children()}
</div>

<style>
  .display {
    position: relative;
    width: 100%;
  }

  canvas {
    width: 100%;
    aspect-ratio: 4/1;
    display: block; /* Remove any extra space below the canvas */
  }
</style>
