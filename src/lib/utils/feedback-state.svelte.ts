export class FeedbackState {
  message: string = $state('')
  is_visible: boolean = $state(false)
  #timeout_id: ReturnType<typeof setTimeout> | null = null

  show(message: string, duration: number = 2000) {
    if (this.#timeout_id !== null) {
      clearTimeout(this.#timeout_id)
      this.#timeout_id = null
    }

    this.message = message
    this.is_visible = true

    this.#timeout_id = setTimeout(() => {
      this.clear()
    }, duration)
  }

  showTooltip(message: string) {
    this.show(message, 1000)
  }

  showConfirmation(message: string) {
    this.show(message, 2000)
  }

  clear() {
    this.message = ''
    this.is_visible = false

    if (this.#timeout_id !== null) {
      clearTimeout(this.#timeout_id)
      this.#timeout_id = null
    }
  }
}
