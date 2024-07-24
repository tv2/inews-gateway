import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { InewsStory } from '../entities/inews-story'

export interface InewsQueueDiffer {
  getMetadataForUncachedStories(storyMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly InewsStoryMetadata[]
  getMetadataForStoriesWithChangedContent(storyMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly InewsStoryMetadata[]
  getMetadataForMovedStories(storyMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly InewsStoryMetadata[]
  getDeletedStoryIds(storyMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly string[]
}
