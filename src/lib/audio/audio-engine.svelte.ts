// audio-engine.svelte.ts
import * as Tone from 'tone'

export interface AudioEngineConfig {
  volume: number // Main output volume
}

export class AudioEngine {
  private initialized: boolean = $state(false)

  constructor(private config: AudioEngineConfig) {}

  // Initialize audio context - must be called from a user interaction
  async initAudioContext() {
    if (this.initialized) return

    try {
      await Tone.start()
      // Set initial master volume
      Tone.getDestination().volume.value = this.config.volume
      this.initialized = true
      console.log('Audio context initialized')
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
    }
  }

  // Clean shutdown of Tone.js
  dispose() {
    if (!this.initialized) return

    try {
      // Close the audio context
      Tone.getContext().dispose()
      this.initialized = false
      console.log('Audio context disposed')
    } catch (error) {
      console.error('Error disposing audio context:', error)
    }
  }

  // Check if audio context is running
  isInitialized(): boolean {
    return this.initialized && Tone.getContext().state === 'running'
  }
}
