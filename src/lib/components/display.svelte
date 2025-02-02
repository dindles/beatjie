<script lang="ts">
  let { analysisValues, children } = $props<{
    analysisValues: Float32Array | Float32Array[]
    children: any
  }>()

  let canvas: HTMLCanvasElement

  const AMPLITUDE_THRESHOLD = 0.001 // Adjust this value to set sensitivity

  function resizeCanvas() {
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }

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
    ctx.lineWidth = dim * 0.04

    if (!analysisValues || analysisValues.length === 0) return

    const values =
      analysisValues instanceof Float32Array
        ? analysisValues
        : analysisValues[0]

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
  <canvas bind:this={canvas}></canvas>
  {@render children()}
</div>

<style>
  .display {
    position: relative;
    width: 100%;
    height: auto;
    background: transparent;
  }

  canvas {
    width: 100%;
    aspect-ratio: 4/1;
    display: block;
  }
</style>
