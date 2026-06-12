import * as Tone from 'tone'
import type { Sample } from '$lib/audio-classes/sample.svelte'
import { MIN_BPM, MAX_BPM } from '$lib/data/audio-config'

export class AudioSequencer {
  #sequences: Tone.Sequence[] = []
  #stepLoop: Tone.Sequence | null = null
  #transport
  #stepArray: number[]
  is_playing: boolean = $state(false)
  active_step_index: number = $state(0)
  bpm: number = $state(120)

  constructor() {
    this.#transport = Tone.getTransport()
    this.#stepArray = [...Array(16).keys()]
    this.#stepLoop = new Tone.Sequence(
      (_time, step) => {
        this.active_step_index = step
      },
      this.#stepArray,
      '16n'
    )
  }

  makeSequences(samples: Sample[]) {
    this.disposeSequences()

    this.#sequences = samples.map((sample) => {
      const seq = new Tone.Sequence(
        (time, step) => {
          if (sample.sequence[step]) {
            sample.play(time)
          }
        },
        this.#stepArray,
        '16n'
      )

      if (this.is_playing) {
        seq.start(0)
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
  }

  private async startPlayback() {
    const context = Tone.getContext()
    if (context.state !== 'running') {
      await Tone.start()
    }

    this.#stepLoop?.start(0)
    this.#sequences.forEach((seq) => seq.start(0))
    this.#transport.start('+0.1')
    this.is_playing = true
  }

  stopPlayback() {
    this.is_playing = false
    this.active_step_index = 0
    this.#transport.stop()
    this.#transport.position = 0
    this.#stepLoop?.cancel()
    this.#sequences.forEach((seq) => seq.cancel())
  }

  getBPM(): number {
    return this.bpm
  }

  setBPM(new_bpm: number) {
    const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, new_bpm))
    this.bpm = clamped
    this.#transport.bpm.value = clamped
  }

  private disposeSequences() {
    this.#sequences.forEach((seq) => seq.dispose())
    this.#sequences = []
  }

  dispose() {
    this.disposeSequences()
    this.#stepLoop?.dispose()
    this.#stepLoop = null
  }
}
