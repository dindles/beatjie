import * as Tone from 'tone'
import { Sample } from '$lib/models.svelte'
import type { Packs } from '$lib/models.svelte'

export interface AudioConfig {
  volume: number
  bpm: number
  highpassFreq: number
  distortionInit: number
  distortionAmount: number
  analyserResolution: number
  sampleDelayAmount: number
}

export class AudioController {
  private mainChannel: Tone.Channel
  private mainFilterHP: Tone.Filter
  private mainDistortion: Tone.Distortion
  private mainAnalyser: Tone.Analyser
  private sequences: Tone.Sequence[] = []
  private config: AudioConfig

  constructor(config: AudioConfig) {
    this.config = config
    this.mainChannel = new Tone.Channel(config.volume)
    this.mainFilterHP = new Tone.Filter(0, 'highpass')
    this.mainDistortion = new Tone.Distortion()
    this.mainDistortion.wet.value = config.distortionInit
    this.mainAnalyser = new Tone.Analyser('waveform', config.analyserResolution)
  }

  async initialiseAudio(packs: Packs) {
    const buffers = await this.makeBuffers(packs)
    const samples = this.makeSamples(packs)
    const loadedSamples = this.loadBuffers(samples, buffers)
    this.setChains(loadedSamples)
    return loadedSamples
  }

  private makeBuffers(packs: Packs): Promise<Tone.ToneAudioBuffers> {
    const urls: { [key: string]: string } = {}
    packs.forEach((pack) => {
      pack.samples.forEach((sample) => {
        urls[sample.id.toString()] = sample.url
      })
    })
    return Promise.resolve(new Tone.ToneAudioBuffers(urls))
  }

  private makeSamples(packs: Packs): Sample[] {
    return packs.flatMap((pack) =>
      pack.samples.map(
        (sample) =>
          new Sample(
            sample.id,
            pack.name,
            sample.name,
            sample.emoji,
            sample.url,
            sample.pitch
          )
      )
    )
  }

  private loadBuffers(
    samples: Sample[],
    buffers: Tone.ToneAudioBuffers
  ): Sample[] {
    samples.forEach((sample) => {
      sample.setSamplerBuffers(sample.pitch, buffers.get(sample.id.toString()))
    })
    return samples
  }

  private setChains(samples: Sample[]) {
    samples.forEach((sample) => {
      sample.sampler.chain(
        sample.channel,
        sample.delay,
        this.mainChannel,
        this.mainFilterHP,
        this.mainDistortion,
        this.mainAnalyser,
        Tone.getDestination()
      )
    })
  }

  makeSequences(samples: Sample[], onStep: (index: number) => void) {
    this.sequences = samples.map((sample) => {
      return new Tone.Sequence(
        (time, step) => {
          onStep(step)
          if (sample.sequence[step]) {
            sample.playing = true
            sample.play(time)
          } else {
            sample.playing = false
          }
        },
        [...Array(16).keys()],
        '16n'
      )
    })
  }

  async startPlayback() {
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
    }
    this.sequences.forEach((seq) => seq.start())
    Tone.getTransport().start('+0.1')
  }

  stopPlayback() {
    Tone.getTransport().stop()
    this.sequences.forEach((seq) => {
      seq.stop()
      seq.dispose()
    })
  }

  toggleHighPass(enabled: boolean) {
    this.mainFilterHP.frequency.value = enabled ? this.config.highpassFreq : 0
  }

  toggleDistortion(enabled: boolean) {
    this.mainDistortion.wet.value = enabled ? this.config.distortionAmount : 0.2
    this.mainChannel.volume.value = enabled ? -6 : 0
  }

  getAnalyserValues() {
    return this.mainAnalyser.getValue()
  }

  setBPM(bpm: number) {
    Tone.getTransport().bpm.value = bpm
  }

  dispose() {
    this.sequences.forEach((seq) => seq.dispose())
    this.mainChannel.dispose()
    this.mainFilterHP.dispose()
    this.mainDistortion.dispose()
    this.mainAnalyser.dispose()
  }
}
