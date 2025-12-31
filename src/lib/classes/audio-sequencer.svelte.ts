// audio-sequencer.svelte.ts
import * as Tone from 'tone';
import type { Sample } from '$lib/classes/audio-models.svelte';

export class AudioSequencer {
  #sequences: Tone.Sequence[] = [];
  #transport;
  #stepArray: number[]; // Cache the step array
  is_playing: boolean = $state(false);
  active_step_index: number = $state(0);
  bpm: number = $state(120);

  constructor() {
    this.#transport = Tone.getTransport();
    this.#stepArray = [...Array(16).keys()];
  }

  makeSequences(samples: Sample[]) {
    this.dispose();

    this.#sequences = samples.map((sample) => {
      const seq = new Tone.Sequence(
        (time, step) => {
          if (this.#sequences[0] === seq) {
            this.active_step_index = step;
          }

          if (sample.sequence[step]) {
            sample.play(time);
          }
        },
        this.#stepArray,
        '16n'
      );

      if (this.is_playing) {
        seq.start();
      }
      return seq;
    });
  }

  async togglePlayback() {
    if (!this.is_playing) {
      this.active_step_index = 0;
      await this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }

  private async startPlayback() {
    const context = Tone.getContext();
    if (context.state !== 'running') {
      await Tone.start();
    }

    Promise.all(this.#sequences.map((seq) => seq.start()));
    this.#transport.start('+0.1');
    this.is_playing = true;
  }

  stopPlayback() {
    this.#transport.stop();
    this.is_playing = false;
    Promise.all(this.#sequences.map((seq) => seq.stop()));
  }

  getBPM(): number {
    return this.bpm;
  }

  setBPM(new_bpm: number) {
    this.bpm = new_bpm;
    this.#transport.bpm.value = new_bpm;
  }

  dispose() {
    Promise.all(this.#sequences.map((seq) => seq.dispose()));
    this.#sequences = [];
  }
}
