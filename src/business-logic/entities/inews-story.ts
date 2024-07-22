export interface InewsStory {
  readonly id: string
  readonly name: string
  readonly queueId: string
  readonly metadata: Readonly<Record<string, string>>
  readonly cues: readonly InewsCue[]
}

export interface InewsCue {
  readonly type: CueType
  readonly content: readonly string[]
}

export enum CueType {
  CONTENT = 'CONTENT',
  MANUS = 'MANUS',
  COMMENT = 'COMMENT',
  INVALID = 'INVALID',
}
