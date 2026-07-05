<script lang="ts">
  import type { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte'
  import { MIN_BPM, MAX_BPM } from '$lib/data/audio-config'

  interface Props {
    sequencer: AudioSequencer
  }

  let { sequencer }: Props = $props()

  const DRAG_SENSITIVITY = 0.5

  let is_dragging = $state(false)
  let drag_start_y = $state(0)
  let start_bpm = $state(0)

  function constrainBPM(value: number): number {
    return Math.min(MAX_BPM, Math.max(MIN_BPM, value))
  }

  function updateBPM(new_bpm: number) {
    const constrained = constrainBPM(new_bpm)
    if (constrained !== sequencer.getBPM()) {
      sequencer.setBPM(constrained)
    }
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault()
    updateBPM(sequencer.getBPM() + Math.sign(e.deltaY) * -1)
  }

  function handlePointerDown(e: PointerEvent) {
    is_dragging = true
    drag_start_y = e.clientY
    start_bpm = sequencer.getBPM()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: PointerEvent) {
    if (!is_dragging) return
    const drag_delta = drag_start_y - e.clientY
    updateBPM(start_bpm + Math.round(drag_delta * DRAG_SENSITIVITY))
  }

  function handlePointerUp(e: PointerEvent) {
    if (!is_dragging) return
    is_dragging = false
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  const KEY_STEPS: Record<string, number> = {
    ArrowUp: 1,
    ArrowRight: 1,
    ArrowDown: -1,
    ArrowLeft: -1,
    PageUp: 10,
    PageDown: -10
  }

  function handleKeyDown(e: KeyboardEvent) {
    let new_bpm: number | undefined
    if (e.key in KEY_STEPS) new_bpm = sequencer.getBPM() + KEY_STEPS[e.key]
    if (e.key === 'Home') new_bpm = MIN_BPM
    if (e.key === 'End') new_bpm = MAX_BPM
    if (new_bpm === undefined) return

    // keep the global arrow-key BPM shortcut from also firing
    e.preventDefault()
    e.stopPropagation()
    updateBPM(new_bpm)
  }
</script>

<button
  class="bpm-display"
  role="slider"
  aria-label="BPM"
  aria-valuemin={MIN_BPM}
  aria-valuemax={MAX_BPM}
  aria-valuenow={sequencer.getBPM()}
  aria-valuetext="{sequencer.getBPM()} BPM"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
  onwheel={handleWheel}
  onkeydown={handleKeyDown}
>
  {sequencer.getBPM()}
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
</style>
