import * as Tone from 'tone'

export type SampleHeader = {
  id: number
  name: string
  emoji: string
  url: string
}
export type PackHeader = {
  name: string
  samples: SampleHeader[]
}

export type Pack = Sample[]
export type Samples = Pack[]

export type Sample = SampleHeader & {
  sampler: Tone.Sampler
  envelope: Tone.AmplitudeEnvelope
  filter: Tone.Filter
  panner: Tone.Panner
}

export type Sequence = boolean[]

export type Sequences = [boolean[][]]
