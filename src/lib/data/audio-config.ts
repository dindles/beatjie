// audio-config.ts - Default configuration constants for the audio system

import type { Note } from 'tone/build/esm/core/type/NoteUnits';

export interface DelayConfig {
  readonly delayTime: string;
  readonly feedback: number;
  readonly wet: number;
}

export const DEFAULT_SEQUENCE_LENGTH = 16;
export const DEFAULT_VOLUME = -3;
export const DEFAULT_PITCH: Note = 'C2';
export const DEFAULT_ATTACK = 0.01;
export const DEFAULT_DELAY_CONFIG: DelayConfig = {
  delayTime: '16n',
  feedback: 0.4,
  wet: 0
} as const;
