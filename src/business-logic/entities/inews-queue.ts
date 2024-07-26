import { InewsStory } from './inews-story'

export interface InewsQueue {
  readonly id: string
  readonly stories: readonly InewsStory[]
}
