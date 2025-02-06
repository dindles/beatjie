// audio-sequencer.svelte.ts
import * as Tone from 'tone'
import type { Sample } from '$lib/audio/audio-models.svelte'

export interface SequencerConfig {
  readonly bpm: number
}

export class AudioSequencer {
  sequences: Tone.Sequence[] = []
  is_playing: boolean = $state(false)
  active_step_index: number = $state(0)

  constructor(private config: SequencerConfig) {
    Tone.getTransport().bpm.value = config.bpm
  }

  makeSequences(samples: Sample[]) {
    this.sequences.forEach((seq) => seq.dispose())

    this.sequences = samples.map((sample) => {
      const seq = new Tone.Sequence(
        (time, step) => {
          this.active_step_index = step
          if (sample.sequence[step]) {
            sample.playing = true
            sample.play(time)
          } else {
            sample.playing = false
          }
        },
        //this syntax creates an empty array and spreads the index values
        // across a new array. basically an easy way to assign
        // sequential numbers to the positions of an array.
        [...Array(16).keys()],
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
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
    }
    this.sequences.forEach((seq) => seq.start())
    Tone.getTransport().start('+0.1')
  }

  private stopPlayback() {
    Tone.getTransport().stop()
    this.sequences.forEach((seq) => {
      seq.stop()
    })
  }

  setBPM(bpm: number) {
    Tone.getTransport().bpm.value = bpm
  }

  dispose() {
    this.sequences.forEach((seq) => seq.dispose())
    this.sequences = []
  }
}
