// audio.ts - Type definitions for the audio system

export interface SampleHeader {
  readonly id: number;
  readonly emoji: string;
  readonly url: string;
}

export interface Pack {
  readonly name: string;
  readonly samples: readonly SampleHeader[];
}

export type Packs = readonly Pack[];
export type Sequence = boolean[];
