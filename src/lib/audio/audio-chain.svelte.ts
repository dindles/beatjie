// audio-chain.svelte.ts
import * as Tone from 'tone'
import type { Sample } from '$lib/audio/audio-models.svelte'

export interface ChainConfig {
  highpassFreq: number
  distortionInit: number
  distortionAmount: number
  compressorThreshold: number
  compressorAttack: number
  compressorRelease: number
  analyserResolution: number
}

export class AudioChain {
  private mainChannel: Tone.Channel
  private mainFilterHP: Tone.Filter
  mainHighPassed: boolean = $state(false)
  private mainDistortion: Tone.Distortion
  mainDistorted: boolean = $state(false)
  private mainCompressor: Tone.Compressor
  mainCompressed: boolean = $state(false)
  private mainAnalyser: Tone.Analyser

  constructor(private config: ChainConfig) {
    this.mainChannel = new Tone.Channel(0)
    this.mainFilterHP = new Tone.Filter(0, 'highpass')
    this.mainDistortion = new Tone.Distortion()
    this.mainDistortion.wet.value = config.distortionInit
    this.mainCompressor = new Tone.Compressor()
    this.mainCompressor.threshold.value = config.compressorThreshold
    this.mainCompressor.ratio.value = 4
    this.mainCompressor.attack.value = config.compressorAttack
    this.mainCompressor.release.value = config.compressorRelease

    this.mainAnalyser = new Tone.Analyser('waveform', config.analyserResolution)

    this.mainChannel.chain(
      this.mainFilterHP,
      this.mainDistortion,
      this.mainCompressor,
      this.mainAnalyser,
      Tone.getDestination()
    )
  }

  // Set up chaining for each sample
  setChains(samples: Sample[]) {
    samples.forEach((sample) => {
      sample.sampler.chain(sample.channel, sample.delay, this.mainChannel)
    })
  }

  toggleMainHighPass(enabled: boolean) {
    this.mainHighPassed = enabled
    this.mainFilterHP.frequency.value = enabled ? this.config.highpassFreq : 0
  }

  toggleMainDistortion(enabled: boolean) {
    this.mainDistorted = enabled
    this.mainDistortion.wet.value = enabled
      ? this.config.distortionAmount
      : this.config.distortionInit
    this.mainChannel.volume.value = enabled ? -6 : 0
  }

  toggleCompressor(enabled: boolean) {
    this.mainCompressed = enabled
    this.mainCompressor.threshold.value = enabled ? -6 : -48
  }

  toggleSampleDelay(sample: Sample, enabled: boolean) {
    sample.delay.wet.value = enabled ? 0.5 : 0
  }

  toggleSampleMute(sample: Sample, enabled: boolean) {
    sample.channel.volume.value = enabled ? -Infinity : 0
  }

  getAnalyserValues() {
    return this.mainAnalyser.getValue()
  }

  dispose() {
    this.mainChannel.dispose()
    this.mainFilterHP.dispose()
    this.mainDistortion.dispose()
    this.mainAnalyser.dispose()
  }
}
