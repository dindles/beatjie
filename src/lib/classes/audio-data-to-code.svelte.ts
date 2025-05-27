import * as Tone from 'tone'
import type { Packs } from '$lib/audio/audio-models.svelte'
import { Sample } from '$lib/audio/audio-models.svelte'

export class AudioDataToCode {
  #buffers_are_loaded: boolean = $state(false)
  #error_state: string | null = null
  async processPacks(packs: Packs): Promise<Sample[]> {
    try {
      const buffers = await this.makeBuffers(packs)
      const samples = this.makeSamples(packs)
      const buffered_samples = this.setBuffers(samples, buffers)
      this.#buffers_are_loaded = true
      this.#error_state = null
      return buffered_samples
    } catch (error) {
      this.#error_state =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('Error processing audio packs:', error)
      throw error
    }
  }

  private makeBuffers(packs: Packs): Promise<Tone.ToneAudioBuffers> {
    const urls: Record<string, string> = {}
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
        (sample) => new Sample(sample.id, pack.name, sample.emoji, sample.url)
      )
    )
  }

  private setBuffers(
    samples: Sample[],
    buffers: Tone.ToneAudioBuffers
  ): Sample[] {
    samples.forEach((sample) => {
      sample.setSamplerBuffers(sample.pitch, buffers.get(sample.id.toString()))
    })
    return samples
  }

  buffersAreLoaded(): boolean {
    return this.#buffers_are_loaded
  }

  getErrorState(): string | null {
    return this.#error_state
  }
}
