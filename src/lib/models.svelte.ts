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
  volume = $state(-3)

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

  play(time: Time) {
    this.sampler.triggerAttack(this.pitch, time)
  }
}

export class MainSettings {
  volume: Tone.Unit.Decibels = $state(-3)
  filter_freq: Tone.Unit.Frequency = $state(18000)
  highpassed: boolean = $state(false)
  distortion_amount: number = $state(0.1)
  analyser_resolution: number = $state(256)

  constructor(
    volume: Tone.Unit.Decibels,
    filter_freq: Tone.Unit.Frequency,
    highpassed: boolean,
    distortion_amount: number,
    analyser_resolution: number
  ) {
    this.volume = volume
    this.filter_freq = filter_freq
    this.highpassed = highpassed
    this.distortion_amount = distortion_amount
    this.analyser_resolution = analyser_resolution
  }
}

export type Sequence = boolean[]
export type Sequences = [Sequence[]]
