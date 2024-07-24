export interface InewsStory {
  readonly id: string
  readonly name: string
  readonly queueId: string
  readonly contentLocator: string
  readonly versionLocator: string
  readonly metadata: Readonly<Record<string, string>>
  readonly cues: readonly InewsCue[]
  readonly rank: number
}

export interface InewsCue {
  readonly type: CueType
  readonly content: readonly string[]
}

export enum CueType {
  CONTENT = 'CONTENT',
  MANUS = 'MANUS',
  COMMENT = 'COMMENT',
}
