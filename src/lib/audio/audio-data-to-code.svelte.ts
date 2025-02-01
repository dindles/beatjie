// audio-data-to-code.svelte.ts
import * as Tone from 'tone'
import type { Packs } from '$lib/models.svelte'
import { Sample } from '$lib/models.svelte'

export class AudioDataToCode {
  private buffers_are_loaded: boolean = $state(false)

  // Convert pack data into Sample objects and load their buffers
  async processPacks(packs: Packs): Promise<Sample[]> {
    try {
      const buffers = await this.makeBuffers(packs)
      const samples = this.makeSamples(packs)
      const loadedSamples = this.loadBuffers(samples, buffers)
      this.buffers_are_loaded = true
      return loadedSamples
    } catch (error) {
      console.error('Error processing audio packs:', error)
      throw error
    }
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

  areBuffersLoaded(): boolean {
    return this.buffers_are_loaded
  }
}
