// audio-engine.svelte.ts
import * as Tone from 'tone'

export class AudioEngine {
  private initialised: boolean = $state(false)

  // Initialise audio context - must be called from a user interaction
  async initAudioContext() {
    if (this.initialised) return

    try {
      await Tone.start()
      this.initialised = true
      console.log('Audio context initialised')
    } catch (error) {
      console.error('Failed to initialise audio context:', error)
    }
  }

  // Clean shutdown of Tone.js
  dispose() {
    if (!this.initialised) return

    try {
      Tone.getContext().dispose()
      this.initialised = false
      console.log('Audio context disposed')
    } catch (error) {
      console.error('Error disposing audio context:', error)
    }
  }

  // Check if audio context is running
  isInitialised(): boolean {
    return this.initialised && Tone.getContext().state === 'running'
  }
}
