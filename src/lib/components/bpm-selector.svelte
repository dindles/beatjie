<script lang="ts">
  import type { AudioSequencer } from '$lib/audio/audio-sequencer.svelte'

  interface Props {
    audio_sequencer: AudioSequencer
  }

  let { audio_sequencer }: Props = $props()

  const MIN_BPM = 60
  const MAX_BPM = 200
  const DRAG_SENSITIVITY = 0.5

  let isDragging = $state(false)
  let dragStartY = $state(0)
  let startBPM = $state(0)

  function constrainBPM(value: number): number {
    return Math.min(MAX_BPM, Math.max(MIN_BPM, value))
  }

  function updateBPM(newBPM: number) {
    const constrained = constrainBPM(newBPM)
    if (constrained !== audio_sequencer.getBPM()) {
      audio_sequencer.setBPM(constrained)
    }
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault()
    updateBPM(audio_sequencer.getBPM() + Math.sign(e.deltaY) * -1)
  }

  function handlePointerDown(e: PointerEvent) {
    isDragging = true
    dragStartY = e.clientY
    startBPM = audio_sequencer.getBPM()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return
    const dragDelta = dragStartY - e.clientY
    updateBPM(startBPM + Math.round(dragDelta * DRAG_SENSITIVITY))
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return
    isDragging = false
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }
</script>

<button
  class="bpm-display"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
  onwheel={handleWheel}
  aria-label="BPM control"
>
  {audio_sequencer.getBPM()}
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
