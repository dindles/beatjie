// focus management for full-screen overlays: moves focus in on mount,
// closes on Escape, and restores focus to the opener on destroy
export function dialog(node: HTMLElement, onclose: () => void) {
  const previously_focused =
    document.activeElement instanceof HTMLElement ? document.activeElement : null

  const focus_target = node.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  focus_target?.focus()

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onclose()
    }
  }

  node.addEventListener('keydown', handleKeyDown)

  return {
    update(new_onclose: () => void) {
      onclose = new_onclose
    },
    destroy() {
      node.removeEventListener('keydown', handleKeyDown)
      previously_focused?.focus()
    }
  }
}
