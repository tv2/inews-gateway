import { InewsStory } from '../entities/inews-story'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { InewsQueueDiffer } from '../interfaces/inews-queue-differ'

export class InewsQueueDifferImplementation implements InewsQueueDiffer {
  public getMetadataForUncachedStories(storyMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly InewsStoryMetadata[] {
    return storyMetadataSequence
      .filter(storyMetadata => !this.isStoryCached(storyMetadata.id, cachedStories))
  }

  private isStoryCached(storyId: string, cachedStories: ReadonlyMap<string, InewsStory>): boolean {
    return cachedStories.has(storyId)
  }

  public getMetadataForStoriesWithChangedContent(storyMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly InewsStoryMetadata[] {
    return storyMetadataSequence
      .filter(storyMetadata => this.hasStoryContentChanged(storyMetadata, cachedStories))
  }

  private hasStoryContentChanged(storyMetadata: InewsStoryMetadata, cachedStories: ReadonlyMap<string, InewsStory>): boolean {
    const cachedStory: InewsStory | undefined = cachedStories.get(storyMetadata.id)
    if (!cachedStory) {
      return false
    }

    return storyMetadata.contentLocator !== cachedStory.contentLocator
  }

  public getMetadataForMovedStories(storyMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly InewsStoryMetadata[] {
    return storyMetadataSequence
      .filter(storyMetadata => this.isStoryMoved(storyMetadata, cachedStories))
  }

  private isStoryMoved(storyMetadata: InewsStoryMetadata, cachedStories: ReadonlyMap<string, InewsStory>): boolean {
    const cachedStory: InewsStory | undefined = cachedStories.get(storyMetadata.id)
    if (!cachedStory) {
      return false
    }

    if (storyMetadata.versionLocator === cachedStory.versionLocator) {
      return false
    }

    return storyMetadata.contentLocator === cachedStory.contentLocator
  }

  public getDeletedStoryIds(storyMetadataSequence: readonly InewsStoryMetadata[], cachedStories: ReadonlyMap<string, InewsStory>): readonly string[] {
    const currentStoryIds: ReadonlySet<string> = new Set(storyMetadataSequence.map(storyMetadata => storyMetadata.id))
    return Array.from(cachedStories.keys())
      .filter(storyId => !currentStoryIds.has(storyId))
  }
}
