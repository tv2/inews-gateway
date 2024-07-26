import { InewsStory } from '../entities/inews-story'

export interface InewsStoryParser {
  parseInewsStory(nsmlText: string, queueId: string): InewsStory
}
