<script lang="ts">
  let cursorX = $state(0)
  let cursorY = $state(0)
  let visible = $state(false)

  function updateCursor(e: MouseEvent) {
    if (!visible) {
      visible = true
    }

    cursorX = e.clientX
    cursorY = e.clientY
  }

  $effect(() => {
    document.documentElement.style.cursor = 'none'

    document.addEventListener('mousemove', updateCursor)

    cursorX = window.innerWidth / 2
    cursorY = window.innerHeight / 2

    visible = true

    return () => {
      document.documentElement.style.cursor = ''
      document.removeEventListener('mousemove', updateCursor)
    }
  })
</script>

<div
  class="custom-cursor"
  style="left: {cursorX}px; top: {cursorY}px; opacity: {visible ? 1 : 0};;"
>
  👆
</div>

<style>
  .custom-cursor {
    font-family: var(--font-emoji);
    font-size: 4rem;
    font-weight: 900;
    color: var(--user-colour);
    position: fixed;
    transform: translate(-30%, -10%);
    rotate: -15deg;
    z-index: 9999;
    pointer-events: none;
    user-select: none;
    transition:
      left 0.04s linear,
      top 0.04s linear;
    background-color: transparent;
    mix-blend-mode: difference;
  }
</style>
