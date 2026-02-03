<script lang="ts">
  import type { AudioSequencer } from '$lib/audio-classes/audio-sequencer.svelte';

  interface Props {
    sequencer: AudioSequencer;
  }

  let { sequencer }: Props = $props();

  const MIN_BPM = 60;
  const MAX_BPM = 200;
  const DRAG_SENSITIVITY = 0.5;

  let is_dragging = $state(false);
  let drag_start_y = $state(0);
  let start_bpm = $state(0);

  function constrainBPM(value: number): number {
    return Math.min(MAX_BPM, Math.max(MIN_BPM, value));
  }

  function updateBPM(new_bpm: number) {
    const constrained = constrainBPM(new_bpm);
    if (constrained !== sequencer.getBPM()) {
      sequencer.setBPM(constrained);
    }
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    updateBPM(sequencer.getBPM() + Math.sign(e.deltaY) * -1);
  }

  function handlePointerDown(e: PointerEvent) {
    is_dragging = true;
    drag_start_y = e.clientY;
    start_bpm = sequencer.getBPM();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!is_dragging) return;
    const drag_delta = drag_start_y - e.clientY;
    updateBPM(start_bpm + Math.round(drag_delta * DRAG_SENSITIVITY));
  }

  function handlePointerUp(e: PointerEvent) {
    if (!is_dragging) return;
    is_dragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
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

  .bpm-display:focus {
    outline: none;
  }
</style>
