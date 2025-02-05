import * as Tone from 'tone'
import type { Sample } from '$lib/audio/audio-models.svelte'

export interface ChainConfig {
  readonly highpassFreq: number
  readonly distortionInit: number
  readonly distortionAmount: number
  readonly compressorThreshold: number
  readonly compressorAttack: number
  readonly compressorRelease: number
  readonly analyserResolution: number
  readonly bitCrusherBits: number
}

export class AudioChain {
  #mainChannel: Tone.Channel
  #mainFilterHP: Tone.Filter
  #mainHighPassed: boolean = $state(false)
  #mainDistortion: Tone.Distortion
  #mainBitCrusher: Tone.BitCrusher
  #mainDistorted: boolean = $state(false)
  #mainCompressor: Tone.Compressor
  #mainAnalyser: Tone.Analyser

  constructor(private config: ChainConfig) {
    this.#mainChannel = new Tone.Channel(0)
    this.#mainFilterHP = new Tone.Filter(0, 'highpass')
    this.#mainDistortion = new Tone.Distortion()
    this.#mainDistortion.wet.value = config.distortionInit
    this.#mainBitCrusher = new Tone.BitCrusher(config.bitCrusherBits)
    this.#mainBitCrusher.wet.value = 0
    this.#mainCompressor = new Tone.Compressor()
    this.#mainCompressor.threshold.value = config.compressorThreshold
    this.#mainCompressor.ratio.value = 2
    this.#mainCompressor.attack.value = config.compressorAttack
    this.#mainCompressor.release.value = config.compressorRelease
    this.#mainAnalyser = new Tone.Analyser(
      'waveform',
      config.analyserResolution
    )

    this.#mainChannel.chain(
      this.#mainFilterHP,
      this.#mainDistortion,
      this.#mainBitCrusher,
      this.#mainCompressor,
      this.#mainAnalyser,
      Tone.getDestination()
    )
  }

  // Set up chaining for each sample
  setChains(samples: Sample[]) {
    samples.forEach((sample) => {
      sample.sampler.chain(sample.channel, sample.delay, this.#mainChannel)
    })
  }

  toggleMainHighPass(enabled: boolean) {
    this.#mainHighPassed = enabled
    this.#mainFilterHP.frequency.value = enabled ? this.config.highpassFreq : 0
  }

  mainIsHighPassed(): boolean {
    return this.#mainHighPassed
  }

  toggleMainDistortion(enabled: boolean) {
    this.#mainDistorted = enabled
    this.#mainDistortion.wet.value = enabled
      ? this.config.distortionAmount
      : this.config.distortionInit
    this.#mainBitCrusher.wet.value = enabled ? 0.2 : 0
    this.#mainChannel.volume.value = enabled ? -6 : 0
  }

  mainIsDistorted(): boolean {
    return this.#mainDistorted
  }

  toggleSampleDelay(sample: Sample, enabled: boolean) {
    sample.delay.wet.value = enabled ? 0.5 : 0
  }

  toggleSampleMute(sample: Sample, enabled: boolean) {
    sample.channel.volume.value = enabled ? -Infinity : 0
  }

  getAnalyserValues() {
    return this.#mainAnalyser.getValue()
  }

  dispose() {
    this.#mainChannel.dispose()
    this.#mainFilterHP.dispose()
    this.#mainDistortion.dispose()
    this.#mainBitCrusher.dispose()
    this.#mainAnalyser.dispose()
  }
}
