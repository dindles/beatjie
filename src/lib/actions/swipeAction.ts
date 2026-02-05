interface SwipeActionOptions {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  threshold?: number
}

export function swipe(node: HTMLElement, options: SwipeActionOptions) {
  let touch_start_x = 0
  let touch_end_x = 0
  let is_swiping = false

  const swipe_threshold = options.threshold || 50

  function handleTouchStart(event: TouchEvent) {
    touch_start_x = event.touches[0].clientX
    touch_end_x = touch_start_x
    is_swiping = true
  }

  function handleTouchMove(event: TouchEvent) {
    if (!is_swiping || event.touches.length === 0) return
    touch_end_x = event.touches[0].clientX
  }

  function handleTouchEnd() {
    if (!is_swiping) return

    const swipe_distance = touch_end_x - touch_start_x

    if (Math.abs(swipe_distance) > swipe_threshold) {
      if (swipe_distance < 0) {
        options.onSwipeLeft()
      } else {
        options.onSwipeRight()
      }
    }
    is_swiping = false
  }

  node.addEventListener('touchstart', handleTouchStart, { passive: true })
  node.addEventListener('touchmove', handleTouchMove, { passive: true })
  node.addEventListener('touchend', handleTouchEnd, { passive: true })
  node.addEventListener('touchcancel', handleTouchEnd, { passive: true })

  return {
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchmove', handleTouchMove)
      node.removeEventListener('touchend', handleTouchEnd)
      node.removeEventListener('touchcancel', handleTouchEnd)
    },
    update(new_options: SwipeActionOptions) {
      options = new_options
    }
  }
}
