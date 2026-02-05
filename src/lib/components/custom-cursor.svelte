<script lang="ts">
  let cursor_x = $state(0);
  let cursor_y = $state(0);
  let visible = $state(false);
  let is_clicked = $state(false);
  let use_difference = $state(true);

  function updateCursor(e: MouseEvent) {
    if (!visible) {
      visible = true;
    }
    cursor_x = e.clientX;
    cursor_y = e.clientY;
  }

  function handleMouseDown() {
    is_clicked = true;
  }

  function handleMouseUp() {
    is_clicked = false;
  }

  $effect(() => {
    document.documentElement.style.cursor = 'none';
    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // checks the current theme and adjusts the cursor mix-blend-mode to preserve visibility
    const check_theme = () => {
      const black_or_white = getComputedStyle(document.documentElement)
        .getPropertyValue('--black-or-white')
        .trim();
      use_difference = black_or_white.includes('0 0 0');
    };

    const observer = new MutationObserver(check_theme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    check_theme();

    cursor_x = window.innerWidth / 2;
    cursor_y = window.innerHeight / 2;
    visible = true;

    return () => {
      document.documentElement.style.cursor = '';
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
    };
  });
</script>

<div
  class="custom-cursor"
  style="
    left: {cursor_x}px;
    top: {cursor_y}px;
    opacity: {visible ? 1 : 0};
    transform: translate(-30%, -10%) scale({is_clicked ? 0.97 : 1});
    mix-blend-mode: {use_difference ? 'difference' : 'multiply'};
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
  }
</style>
