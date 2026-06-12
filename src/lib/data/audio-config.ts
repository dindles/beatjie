import type { Note } from 'tone/build/esm/core/type/NoteUnits'

export interface DelayConfig {
  readonly delayTime: string
  readonly feedback: number
  readonly wet: number
}

export const DEFAULT_SEQUENCE_LENGTH = 16
export const DEFAULT_PITCH: Note = 'C2'
export const AVAILABLE_PITCHES: Note[] = ['C2', 'E2', 'F2', 'C1']
export const MIN_BPM = 60
export const MAX_BPM = 200
export const DEFAULT_DELAY_CONFIG: DelayConfig = {
  delayTime: '16n',
  feedback: 0.4,
  wet: 0
} as const
