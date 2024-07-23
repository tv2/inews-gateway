import { InewsStory } from '../entities/inews-story'

export interface InewsQueueEmitter {
  emitCreatedInewsStory(inewsStory: InewsStory): void
  emitChangedInewsStory(inewsStory: InewsStory): void
  emitMovedInewsStory(inewsStory: InewsStory): void
  emitDeletedInewsStory(inewsQueueId: string, inewsStoryId: string): void
}
