import * as Tone from 'tone'
import type { MidiNote, Note } from 'tone/build/esm/core/type/NoteUnits'

export type SampleHeader = {
  id: number
  name: string
  emoji: string
  pitch: Note
  url: string
}
export type PackHeader = {
  name: string
  samples: SampleHeader[]
}

export type Pack = SampleHeader[]
export type Packs = PackHeader[]

// todo - add analyser
export class Sample<SampleHeader> {
  id: number
  name: string
  emoji: string
  pitch: Note
  url: string
  sampler: Tone.Sampler
  filter: Tone.Filter
  panner: Tone.Panner
  sequence: Sequence

  constructor(
    id: number,
    name: string,
    emoji: string,
    pitch: Note,
    url: string
  ) {
    this.id = id
    this.name = name
    this.emoji = emoji
    this.pitch = pitch
    this.url = url
    this.sampler = new Tone.Sampler()
    this.filter = new Tone.Filter()
    this.panner = new Tone.Panner()
    // todo - this sequence length should refer to a global store
    this.sequence = { sample_id: this.id, steps: new Array(16).fill(false) }
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
}

export type Sequence = { sample_id: number; steps: boolean[] }
export type Sequences = [Sequence[]]
