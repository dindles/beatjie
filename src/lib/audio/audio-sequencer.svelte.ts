// audio-sequencer.svelte.ts
import * as Tone from 'tone'
import type { Sample } from '$lib/audio/audio-models.svelte'

export class AudioSequencer {
  private sequences: Tone.Sequence[] = []
  private transport
  private stepArray: number[] // Cache the step array
  is_playing: boolean = $state(false)
  active_step_index: number = $state(0)
  bpm: number = $state(120)

  constructor() {
    this.transport = Tone.getTransport()
    // Pre-compute the step array
    this.stepArray = [...Array(16).keys()]
  }

  makeSequences(samples: Sample[]) {
    // Clean up existing sequences
    this.dispose()

    // Create all sequences at once
    this.sequences = samples.map((sample) => {
      const seq = new Tone.Sequence(
        (time, step) => {
          // Only update active_step_index for one sequence to avoid redundant updates
          if (this.sequences[0] === seq) {
            this.active_step_index = step
          }

          // Check sequence state before playing
          if (sample.sequence[step]) {
            sample.play(time)
          }
        },
        this.stepArray,
        '16n'
      )

      if (this.is_playing) {
        seq.start()
      }
      return seq
    })
  }

  async togglePlayback() {
    if (!this.is_playing) {
      this.active_step_index = 0
      await this.startPlayback()
    } else {
      this.stopPlayback()
    }
    this.is_playing = !this.is_playing
  }

  private async startPlayback() {
    const context = Tone.getContext()
    if (context.state !== 'running') {
      await Tone.start()
    }

    // Batch sequence starts
    Promise.all(this.sequences.map((seq) => seq.start()))
    this.transport.start('+0.1')
  }

  private stopPlayback() {
    this.transport.stop()
    // Batch sequence stops
    Promise.all(this.sequences.map((seq) => seq.stop()))
  }

  getBPM(): number {
    return this.bpm
  }

  setBPM(new_bpm: number) {
    this.bpm = new_bpm
    this.transport.bpm.value = new_bpm
  }

  dispose() {
    Promise.all(this.sequences.map((seq) => seq.dispose()))
    this.sequences = []
  }
}
