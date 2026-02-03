import * as Tone from 'tone';

export class AudioContext {
  #initialised: boolean = false;

  async initAudioContext() {
    if (this.#initialised) return;

    try {
      await Tone.start();
      this.#initialised = true;
      console.log('audio context initialised');
    } catch (error) {
      console.error('failed to initialise audio context:', error);
    }
  }

  dispose() {
    if (!this.#initialised) return;

    try {
      Tone.getContext().dispose();
      this.#initialised = false;
      console.log('audio context disposed');
    } catch (error) {
      console.error('error disposing audio context:', error);
    }
  }

  isInitialised(): boolean {
    return this.#initialised && Tone.getContext().state === 'running';
  }
}
