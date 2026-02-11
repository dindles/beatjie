export function press(node: HTMLElement, handler: () => void) {
  function handlePointerDown() {
    handler()
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handler()
    }
  }

  node.addEventListener('pointerdown', handlePointerDown)
  node.addEventListener('keydown', handleKeyDown)

  return {
    update(new_handler: () => void) {
      handler = new_handler
    },
    destroy() {
      node.removeEventListener('pointerdown', handlePointerDown)
      node.removeEventListener('keydown', handleKeyDown)
    }
  }
}
