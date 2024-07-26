import { InewsStory } from '../entities/inews-story'
import { InewsId } from '../entities/inews-id'

export interface InewsStoryParser {
  parseInewsStory(nsmlText: string, queueId: string, inewsId: InewsId): InewsStory
}
