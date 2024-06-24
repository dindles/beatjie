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
  url: string
  sampler: Tone.Sampler
  volume: number = $state(-3)
  pitch: Note = $state('C2')
  attack: number = $state(0.01)
  channel: Tone.Channel
  filter: Tone.Filter
  sequence: Sequence = $state([])
  playing: boolean = $state(false)

  constructor(
    id: number,
    pack: string,
    name: string,
    emoji: string,
    url: string,
    pitch: Note
  ) {
    this.id = id
    this.pack = pack
    this.name = name
    this.emoji = emoji
    this.pitch = pitch
    this.url = url
    this.sampler = new Tone.Sampler()
    this.filter = new Tone.Filter()
    this.channel = new Tone.Channel()
    this.channel.volume.value = this.volume
    // creates an empty sample-specific sequence accessed by the sequencer
    this.sequence = new Array(16).fill(false)
  }

  setSamplerBuffers(pitch: Note, buffer: Tone.ToneAudioBuffer) {
    this.sampler.add(pitch, buffer)
  }

  play(time: Time) {
    this.sampler.triggerAttack(this.pitch, time)
  }
}

export type Sequence = boolean[]
export type Sequences = [Sequence[]]
