// focus management for full-screen overlays: makes the rest of the panel inert
// (traps focus and hides it from assistive tech), moves focus to the dialog,
// closes on Escape, and restores focus to the opener on destroy
export function dialog(node: HTMLElement, onclose: () => void) {
  const previously_focused =
    document.activeElement instanceof HTMLElement ? document.activeElement : null

  const siblings = Array.from(node.parentElement?.children ?? []).filter(
    (el): el is HTMLElement => el !== node && el instanceof HTMLElement
  )
  siblings.forEach((el) => (el.inert = true))

  // focus the dialog itself so its accessible name is read before its controls
  if (!node.hasAttribute('tabindex')) node.tabIndex = -1
  node.focus()

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
      siblings.forEach((el) => (el.inert = false))
      previously_focused?.focus()
    }
  }
}
