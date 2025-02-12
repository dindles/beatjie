<!-- bpm-selector.svelte -->
<script lang="ts">
  import type { AudioSequencer } from '$lib/audio/audio-sequencer.svelte'

  interface Props {
    audio_sequencer: AudioSequencer
  }

  let { audio_sequencer }: Props = $props()

  function updateBPM(newBPM: number) {
    audio_sequencer.setBPM(newBPM)
  }

  let bpm: number = $state(120)

  // config
  const MIN_BPM = 60
  const MAX_BPM = 200
  const DRAG_SENSITIVITY = 0.5

  let isDragging = $state(false)
  let dragStartY = $state(0)
  let startBPM = $state(0)

  function constrainBPM(value: number): number {
    return Math.min(MAX_BPM, Math.max(MIN_BPM, value))
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault()
    const delta = Math.sign(e.deltaY) * -1
    const newBPM = constrainBPM(bpm + delta)
    if (bpm !== newBPM) {
      updateBPM(newBPM)
    }
  }

  function startBPMDrag(e: PointerEvent) {
    isDragging = true
    dragStartY = e.clientY
    startBPM = bpm
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handleBPMDrag(e: PointerEvent) {
    if (!isDragging) return

    const dragDelta = dragStartY - e.clientY
    const newBPM = constrainBPM(
      startBPM + Math.round(dragDelta * DRAG_SENSITIVITY)
    )

    if (bpm !== newBPM) {
      updateBPM(newBPM)
    }
  }

  function endBPMDrag(e: PointerEvent) {
    if (!isDragging) return
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    isDragging = false
  }
</script>

<button
  class="bpm-display"
  onpointerdown={startBPMDrag}
  onpointermove={handleBPMDrag}
  onpointerup={endBPMDrag}
  onpointercancel={endBPMDrag}
  onwheel={handleWheel}
  aria-label="BPM control"
>
  {bpm}
</button>

<style>
  .bpm-display {
    font-family: var(--font-text);
    font-size: var(--text-small);
    border: none;
    background: none;
    padding: 0;
    width: 100%;
    aspect-ratio: 1;
    cursor: ns-resize;
    touch-action: none;
    user-select: none;
  }

  .bpm-display:focus {
    outline: none;
  }
</style>
