import { InewsStory } from '../entities/inews-story'

export interface InewsQueueObserver {
  subscribeToCreatedInewsStories(onInewsStoryCreatedCallback: (inewsStory: InewsStory) => void): void
  subscribeToChangedInewsStories(onInewsStoryChangedCallback: (inewsStory: InewsStory) => void): void
  subscribeToMovedInewsStories(onInewsStoryMovedCallback: (inewsStory: InewsStory) => void): void
  subscribeToDeletedInewsStories(onInewsStoryDeletedCallback: (inewsQueueId: string, inewsStoryId: string) => void): void
}
