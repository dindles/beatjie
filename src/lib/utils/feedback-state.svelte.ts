export type FeedbackKind = 'tooltip' | 'confirmation'

export class FeedbackState {
  message: string = $state('')
  kind: FeedbackKind = $state('tooltip')
  is_visible: boolean = $state(false)
  #timeout_id: ReturnType<typeof setTimeout> | null = null

  show(message: string, duration: number = 2000, kind: FeedbackKind = 'confirmation') {
    // a hover tooltip must not overwrite a confirmation that is still showing
    if (kind === 'tooltip' && this.is_visible && this.kind === 'confirmation') return

    this.#clearTimeout()
    this.message = message
    this.kind = kind
    this.is_visible = true

    this.#timeout_id = setTimeout(() => {
      this.#hide()
    }, duration)
  }

  showTooltip(message: string) {
    this.show(message, 1000, 'tooltip')
  }

  showConfirmation(message: string) {
    this.show(message, 2000, 'confirmation')
  }

  // called on mouseleave/focusout: only dismisses tooltips, confirmations run their course
  clear() {
    if (this.kind !== 'tooltip') return
    this.#hide()
  }

  #hide() {
    this.message = ''
    this.is_visible = false
    this.#clearTimeout()
  }

  #clearTimeout() {
    if (this.#timeout_id !== null) {
      clearTimeout(this.#timeout_id)
      this.#timeout_id = null
    }
  }
}
