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

export type Pack = SampleHeader[]
export type Packs = PackHeader[]

// export type Sample = SampleHeader & {
//   sampler: Tone.Sampler
//   envelope: Tone.AmplitudeEnvelope
//   filter: Tone.Filter
//   panner: Tone.Panner
//   sequence: Sequence
// }

export class Sample<Sample extends SampleHeader> {
  id: number
  name: string
  emoji: string
  url: string
  sampler: Tone.Sampler
  envelope: Tone.AmplitudeEnvelope
  filter: Tone.Filter
  panner: Tone.Panner
  sequence: Sequence
  constructor(id: number, name: string, emoji: string, url: string) {
    this.id = id
    this.name = name
    this.emoji = emoji
    this.url = url
    this.sampler = new Tone.Sampler({
      urls: {
        C2: `${this.url}`,
      },
      baseUrl: 'src/lib/assets/audio/',
      onload: () => {
        console.log('loaded:' + this.url)
      },
    })
    this.envelope = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.5,
    })
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 2000,
    })
    this.panner = new Tone.Panner()
    // todo - this sequence length should refer to a global store
    this.sequence = { sample_id: this.id, steps: new Array(16).fill(false) }
  }
}

export type Sequence = { sample_id: number; steps: boolean[] }
export type Sequences = [Sequence[]]
