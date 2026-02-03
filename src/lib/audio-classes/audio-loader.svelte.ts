import * as Tone from 'tone';
import type { Packs } from '$lib/types/audio';
import { Sample } from '$lib/audio-classes/sample.svelte';

export class AudioLoader {
  #buffers_are_loaded: boolean = $state(false);
  #error_state: string | null = null;
  #buffers: Tone.ToneAudioBuffers | null = null;

  async processPacks(packs: Packs): Promise<Sample[]> {
    try {
      this.#buffers = await this.makeBuffers(packs);
      const samples = this.makeSamples(packs);
      const buffered_samples = this.setBuffers(samples, this.#buffers);
      this.#buffers_are_loaded = true;
      this.#error_state = null;
      return buffered_samples;
    } catch (error) {
      this.#error_state = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error processing audio packs:', error);
      throw error;
    }
  }

  private async makeBuffers(packs: Packs): Promise<Tone.ToneAudioBuffers> {
    const urls: Record<string, string> = {};
    packs.forEach((pack) => {
      pack.samples.forEach((sample) => {
        urls[sample.id.toString()] = sample.url;
      });
    });

    const buffers = new Tone.ToneAudioBuffers(urls);

    await Tone.ToneAudioBuffer.loaded();

    return buffers;
  }

  private makeSamples(packs: Packs): Sample[] {
    return packs.flatMap((pack) =>
      pack.samples.map((sample) => new Sample(sample.id, pack.name, sample.emoji, sample.url))
    );
  }

  private setBuffers(samples: Sample[], buffers: Tone.ToneAudioBuffers): Sample[] {
    samples.forEach((sample) => {
      sample.setSamplerBuffers(sample.pitch, buffers.get(sample.id.toString()));
    });
    return samples;
  }

  async connectSamplesToMainChannel(samples: Sample[], mainChannel: Tone.Channel): Promise<void> {
    await Promise.all(samples.map((sample) => sample.connectToMainChannel(mainChannel)));
  }

  buffersAreLoaded(): boolean {
    return this.#buffers_are_loaded;
  }

  getErrorState(): string | null {
    return this.#error_state;
  }

  dispose(): void {
    if (this.#buffers) {
      this.#buffers.dispose();
      this.#buffers = null;
    }
    this.#buffers_are_loaded = false;
  }
}
