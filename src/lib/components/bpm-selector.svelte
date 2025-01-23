<script lang="ts">
  let { bpm } = $props()
  let isDragging = $state(false)
  let dragStartY = $state(0)
  let startBPM = $state(0)

  function startBPMDrag(e: PointerEvent) {
    isDragging = true
    dragStartY = e.clientY
    startBPM = bpm(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handleBPMDrag(e: PointerEvent) {
    if (!isDragging) return

    const dragDelta = dragStartY - e.clientY
    const newBPM = Math.min(
      200,
      Math.max(60, startBPM + Math.round(dragDelta * 0.5))
    )

    if (bpm !== newBPM) {
      bpm = newBPM
    }
  }

  function endBPMDrag(e: PointerEvent) {
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    isDragging = false
  }
</script>

<button
  class="emoji-font emoji-large bpm-display"
  onpointerdown={startBPMDrag}
  onpointermove={handleBPMDrag}
  onpointerup={endBPMDrag}
  onpointerout={endBPMDrag}
>
  {bpm}
</button>

<style>
  .bpm-display {
    border: none;
    background: none;
    padding: 0;
    width: 100%;
    aspect-ratio: 1;
  }
</style>
