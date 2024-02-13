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

// todo - add analyser, channel?
export class Sample {
  id: number
  name: string
  emoji: string
  pitch: Note
  url: string
  sampler: Tone.Sampler
  filter: Tone.Filter
  panner: Tone.Panner
  sequence: Sequence = $state([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ])

  constructor(
    id: number,
    name: string,
    emoji: string,
    pitch: Note,
    url: string
  ) {
    // asssign random id
    this.id = id
    this.name = name
    this.emoji = emoji
    this.pitch = pitch
    this.url = url
    this.sampler = new Tone.Sampler()
    this.filter = new Tone.Filter()
    this.panner = new Tone.Panner()
    // todo - chain here?
    this.sampler.chain(this.filter, this.panner, Tone.Destination)
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
