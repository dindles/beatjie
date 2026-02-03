// sample.svelte.ts - Audio sample wrapper with Tone.js integration

import * as Tone from 'tone';
import type { Note } from 'tone/build/esm/core/type/NoteUnits';
import type { Time } from 'tone/build/esm/core/type/Units';
import type { Sequence } from '$lib/types/audio';
import {
  DEFAULT_SEQUENCE_LENGTH,
  DEFAULT_VOLUME,
  DEFAULT_PITCH,
  DEFAULT_ATTACK,
  DEFAULT_DELAY_CONFIG
} from '$lib/data/audio-config';

export class Sample {
  readonly #sampler: Tone.Sampler;
  readonly #channel: Tone.Channel;
  readonly #delay: Tone.FeedbackDelay;
  readonly #reverb: Tone.Reverb;
  #playingTimeouts: Set<number> = new Set();

  readonly id: number;
  readonly pack: string;
  readonly emoji: string;
  readonly url: string;

  volume: number = $state(DEFAULT_VOLUME);
  pitch: Note = $state(DEFAULT_PITCH);
  attack: number = $state(DEFAULT_ATTACK);
  delay_is_active: boolean = $state(false);
  reverb_is_active: boolean = $state(false);
  is_muted: boolean = $state(false);
  sequence: Sequence = $state(new Array(DEFAULT_SEQUENCE_LENGTH).fill(false));
  is_playing: boolean = $state(false);

  constructor(id: number, pack: string, emoji: string, url: string) {
    this.id = id;
    this.pack = pack;
    this.emoji = emoji;
    this.url = url;

    this.#sampler = new Tone.Sampler();
    this.#channel = new Tone.Channel().set({ volume: this.volume });
    this.#delay = new Tone.FeedbackDelay(DEFAULT_DELAY_CONFIG);
    this.#reverb = new Tone.Reverb({
      decay: 2.0,
      wet: 0.0
    });
  }

  get sampler(): Tone.Sampler {
    return this.#sampler;
  }

  get channel(): Tone.Channel {
    return this.#channel;
  }

  get delay(): Tone.FeedbackDelay {
    return this.#delay;
  }

  get reverb(): Tone.Reverb {
    return this.#reverb;
  }

  setSamplerBuffers(pitch: Note, buffer: Tone.ToneAudioBuffer): void {
    if (!buffer) {
      throw new Error('Invalid buffer provided to setSamplerBuffers');
    }
    this.#sampler.add(pitch, buffer);
  }

  play(time: Time): void {
    if (!this.#sampler.loaded) {
      console.warn('Attempted to play sample before sampler was loaded');
      return;
    }

    this.is_playing = true;
    this.#sampler.triggerAttack(this.pitch, time);

    const timeoutId = setTimeout(() => {
      this.is_playing = false;
      this.#playingTimeouts.delete(timeoutId);
    }, 100) as unknown as number;
    this.#playingTimeouts.add(timeoutId);
  }

  dispose(): void {
    // Clear any pending timeouts
    this.#playingTimeouts.forEach(clearTimeout);
    this.#playingTimeouts.clear();

    // Dispose Tone.js nodes
    this.#sampler.dispose();
    this.#channel.dispose();
    this.#delay.dispose();
    this.#reverb.dispose();
  }
}
