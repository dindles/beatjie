// audio-models.svelte.ts

import * as Tone from 'tone'
import type { Note } from 'tone/build/esm/core/type/NoteUnits'
import type { Time } from 'tone/build/esm/core/type/Units'

interface SampleHeader {
  readonly id: number
  readonly emoji: string
  readonly pitch: Note
  readonly url: string
}

interface Pack {
  readonly name: string
  readonly samples: readonly SampleHeader[]
}

export type Packs = readonly Pack[]

const DEFAULT_SEQUENCE_LENGTH = 16
const DEFAULT_VOLUME = -3
const DEFAULT_PITCH: Note = 'C2'
const DEFAULT_ATTACK = 0.01

interface DelayConfig {
  readonly delayTime: string
  readonly feedback: number
  readonly wet: number
}

const DEFAULT_DELAY_CONFIG: DelayConfig = {
  delayTime: '16n',
  feedback: 0.4,
  wet: 0,
} as const

export class Sample {
  readonly #sampler: Tone.Sampler
  readonly #channel: Tone.Channel
  readonly #delay: Tone.FeedbackDelay

  readonly id: number
  readonly pack: string
  readonly emoji: string
  readonly url: string

  volume: number = $state(DEFAULT_VOLUME)
  pitch: Note = $state(DEFAULT_PITCH)
  attack: number = $state(DEFAULT_ATTACK)
  delay_is_active: boolean = $state(false)
  is_muted: boolean = $state(false)
  sequence: Sequence = $state(new Array(DEFAULT_SEQUENCE_LENGTH).fill(false))
  playing: boolean = $state(false)

  constructor(
    id: number,
    pack: string,
    emoji: string,
    url: string,
    pitch: Note
  ) {
    this.id = id
    this.pack = pack
    this.emoji = emoji
    this.url = url
    this.pitch = pitch

    this.#sampler = new Tone.Sampler()
    this.#channel = new Tone.Channel().set({ volume: this.volume })
    this.#delay = new Tone.FeedbackDelay(DEFAULT_DELAY_CONFIG)
  }

  get sampler(): Tone.Sampler {
    return this.#sampler
  }

  get channel(): Tone.Channel {
    return this.#channel
  }

  get delay(): Tone.FeedbackDelay {
    return this.#delay
  }

  setSamplerBuffers(pitch: Note, buffer: Tone.ToneAudioBuffer): void {
    if (!buffer) {
      throw new Error('Invalid buffer provided to setSamplerBuffers')
    }
    this.#sampler.add(pitch, buffer)
  }

  play(time: Time): void {
    if (!this.#sampler.loaded) {
      console.warn('Attempted to play sample before sampler was loaded')
      return
    }
    this.#sampler.triggerAttack(this.pitch, time)
  }
}

export type Sequence = boolean[]
export type Sequences = [Sequence[]]
