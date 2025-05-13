<script lang="ts">
  let cursorX = $state(0)
  let cursorY = $state(0)
  let visible = $state(false)
  let is_clicked = $state(false)

  function updateCursor(e: MouseEvent) {
    if (!visible) {
      visible = true
    }
    cursorX = e.clientX
    cursorY = e.clientY
  }

  function handleMouseDown() {
    is_clicked = true
  }

  function handleMouseUp() {
    is_clicked = false
  }

  $effect(() => {
    document.documentElement.style.cursor = 'none'
    document.addEventListener('mousemove', updateCursor)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    cursorX = window.innerWidth / 2
    cursorY = window.innerHeight / 2
    visible = true

    return () => {
      document.documentElement.style.cursor = ''
      document.removeEventListener('mousemove', updateCursor)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  })
</script>

<div
  class="custom-cursor"
  style="
    left: {cursorX}px; 
    top: {cursorY}px; 
    opacity: {visible ? 1 : 0};
    transform: translate(-30%, -10%) scale({is_clicked ? 0.97 : 1});
  "
>
  👆
</div>

<style>
  .custom-cursor {
    font-family: var(--font-emoji);
    font-size: 3rem;
    font-weight: 900;
    color: var(--user-colour);
    position: fixed;
    rotate: -15deg;
    z-index: 9999;
    pointer-events: none;
    user-select: none;
    transition:
      left 0.04s linear,
      top 0.04s linear,
      transform 0.1s ease;
    background-color: transparent;
    mix-blend-mode: difference;
  }
</style>
