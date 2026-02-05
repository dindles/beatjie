import * as Tone from 'tone'
import type { Sample } from '$lib/audio-classes/sample.svelte'

export class AudioSequencer {
  #sequences: Tone.Sequence[] = []
  #stepLoop: Tone.Sequence | null = null
  #transport
  #stepArray: number[] // Cache the step array
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

  async makeSequences(samples: Sample[]) {
    await this.disposeSequences()

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
      await this.stopPlayback()
    }
  }

  private async startPlayback() {
    const context = Tone.getContext()
    if (context.state !== 'running') {
      await Tone.start()
    }

    this.#stepLoop?.start(0)
    await Promise.all(this.#sequences.map((seq) => seq.start(0)))
    this.#transport.start('+0.1')
    this.is_playing = true
  }

  async stopPlayback() {
    this.is_playing = false
    this.active_step_index = 0
    this.#transport.stop()
    this.#transport.position = 0
    this.#stepLoop?.cancel()
    await Promise.all(this.#sequences.map((seq) => seq.cancel()))
  }

  getBPM(): number {
    return this.bpm
  }

  setBPM(new_bpm: number) {
    this.bpm = new_bpm
    this.#transport.bpm.value = new_bpm
  }

  private async disposeSequences() {
    await Promise.all(this.#sequences.map((seq) => seq.dispose()))
    this.#sequences = []
  }

  async dispose() {
    await this.disposeSequences()
    this.#stepLoop?.dispose()
    this.#stepLoop = null
  }
}
