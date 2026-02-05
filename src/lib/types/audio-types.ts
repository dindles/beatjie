export interface SampleHeader {
  readonly id: number
  readonly name: string
  readonly emoji: string
  readonly url: string
  readonly gain_adjustment?: number
}

export interface Pack {
  readonly name: string
  readonly samples: readonly SampleHeader[]
}

export type Packs = readonly Pack[]
export type Sequence = boolean[]
