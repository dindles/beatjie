// audio-routing-and-effects.svelte.ts
import * as Tone from 'tone'
import type { Sample } from '$lib/models.svelte'

export interface RoutingAndFXConfig {
  highpassFreq: number
  distortionInit: number
  distortionAmount: number
  analyserResolution: number
}

export class RoutingAndFX {
  private mainChannel: Tone.Channel
  private mainFilterHP: Tone.Filter
  private mainDistortion: Tone.Distortion
  private mainAnalyser: Tone.Analyser

  constructor(private config: RoutingAndFXConfig) {
    // Initialize audio processing chain
    this.mainChannel = new Tone.Channel(0)
    this.mainFilterHP = new Tone.Filter(0, 'highpass')
    this.mainDistortion = new Tone.Distortion()
    this.mainDistortion.wet.value = config.distortionInit
    this.mainAnalyser = new Tone.Analyser('waveform', config.analyserResolution)

    // Connect main effects chain
    this.mainChannel.chain(
      this.mainFilterHP,
      this.mainDistortion,
      this.mainAnalyser,
      Tone.getDestination()
    )
  }

  // Set up routing for all samples
  setChains(samples: Sample[]) {
    samples.forEach((sample) => {
      sample.sampler.chain(sample.channel, sample.delay, this.mainChannel)
    })
  }

  toggleMainHighPass(enabled: boolean) {
    this.mainFilterHP.frequency.value = enabled ? this.config.highpassFreq : 0
  }

  toggleMainDistortion(enabled: boolean) {
    this.mainDistortion.wet.value = enabled
      ? this.config.distortionAmount
      : this.config.distortionInit
    this.mainChannel.volume.value = enabled ? -6 : 0
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
