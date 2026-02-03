import * as Tone from 'tone';

export interface MainAudioBusConfig {
  readonly highpass_freq: number;
  readonly distortion_init: number;
  readonly distortion_wet_amount: number;
  readonly compressor_threshold: number;
  readonly compressor_attack: number;
  readonly compressor_release: number;
  readonly analyser_resolution: number;
  readonly bit_crusher_bits: number;
}

export class MainAudioBus {
  #mainChannel: Tone.Channel;
  #mainFilterHP: Tone.Filter;
  mainIsHighPassed: boolean = $state(false);
  #mainDistortion: Tone.Distortion;
  #mainBitCrusher: Tone.BitCrusher;
  mainIsDistorted: boolean = $state(false);
  #mainCompressor: Tone.Compressor;
  #mainAnalyser: Tone.Analyser;

  constructor(private config: MainAudioBusConfig) {
    this.#mainChannel = new Tone.Channel(0);
    this.#mainFilterHP = new Tone.Filter(0, 'highpass');
    this.#mainDistortion = new Tone.Distortion();
    this.#mainDistortion.wet.value = config.distortion_init;
    this.#mainBitCrusher = new Tone.BitCrusher(config.bit_crusher_bits);
    this.#mainBitCrusher.wet.value = 0;
    this.#mainCompressor = new Tone.Compressor();
    this.#mainCompressor.threshold.value = config.compressor_threshold;
    this.#mainCompressor.ratio.value = 2;
    this.#mainCompressor.attack.value = config.compressor_attack;
    this.#mainCompressor.release.value = config.compressor_release;
    this.#mainAnalyser = new Tone.Analyser('waveform', config.analyser_resolution);

    this.#mainChannel.chain(
      this.#mainFilterHP,
      this.#mainDistortion,
      this.#mainBitCrusher,
      this.#mainCompressor,
      this.#mainAnalyser,
      Tone.getDestination()
    );
  }

  toggleMainHighPass(enabled: boolean) {
    this.mainIsHighPassed = enabled;
    this.#mainFilterHP.frequency.value = enabled ? this.config.highpass_freq : 0;
  }

  toggleMainDistortion(enabled: boolean) {
    this.mainIsDistorted = enabled;
    this.#mainDistortion.wet.value = enabled
      ? this.config.distortion_wet_amount
      : this.config.distortion_init;
    this.#mainBitCrusher.wet.value = enabled ? 0.4 : 0;
    this.#mainChannel.volume.value = enabled ? -12 : 0;
  }

  getAnalyserValues() {
    return this.#mainAnalyser.getValue();
  }

  get mainChannel(): Tone.Channel {
    return this.#mainChannel;
  }

  dispose() {
    // Dispose main chain nodes
    this.#mainChannel.dispose();
    this.#mainFilterHP.dispose();
    this.#mainDistortion.dispose();
    this.#mainBitCrusher.dispose();
    this.#mainCompressor.dispose();
    this.#mainAnalyser.dispose();
  }
}
