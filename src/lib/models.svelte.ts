import * as Tone from 'tone'
import type { Note } from 'tone/build/esm/core/type/NoteUnits'
import type { Time } from 'tone/build/esm/core/type/Units'

export type SampleHeader = {
  id: number
  name: string
  emoji: string
  pitch: Note
  url: string
}

export type Pack = {
  name: string
  samples: SampleHeader[]
}

export type Packs = Pack[]

export class Sample {
  id: number
  pack: string
  name: string
  emoji: string
  pitch: Note
  url: string
  sampler: Tone.Sampler
  filter: Tone.Filter
  channel: Tone.Channel
  sequence: Sequence = $state([])
  playing = $state(false)

  constructor(
    id: number,
    pack: string,
    name: string,
    emoji: string,
    pitch: Note,
    url: string
  ) {
    // asssign random id
    this.id = id
    this.pack = pack
    this.name = name
    this.emoji = emoji
    this.pitch = pitch
    this.url = url
    this.sampler = new Tone.Sampler()
    this.filter = new Tone.Filter()
    this.channel = new Tone.Channel()
    this.sequence = new Array(16).fill(false)
  }

  setSamplerBuffers(pitch: Note, buffer: Tone.ToneAudioBuffer) {
    this.sampler.add(pitch, buffer)
  }

  setFilterParams(
    type: 'lowpass' | 'highpass' | 'bandpass',
    frequency: number
  ) {
    this.filter.type = type
    this.filter.frequency.value = frequency
  }

  play(time: Time) {
    this.sampler.triggerAttack(this.pitch, time)
  }
}

export type Sequence = boolean[]
export type Sequences = [Sequence[]]
