import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { InewsStory } from '../entities/inews-story'
import { InewsId } from '../entities/inews-id'

export class EntityTestFactory {
  public static createInewsStoryMetadata(partialInewsStoryMetadata: Partial<InewsStoryMetadata> = {}): InewsStoryMetadata {
    return {
      id: this.generateRandomId(),
      name: 'Story name',
      queueId: this.generateQueueId(),
      contentLocator: this.generateRandomId(),
      versionLocator: this.generateRandomId(),
      modifiedAtEpochTime: Date.now(),
      ...partialInewsStoryMetadata,
    }
  }

  private static generateQueueId(): string {
    return 'QUEUE1'
  }

  private static generateRandomId(): string {
    return crypto.randomUUID()
  }

  public static createInewsStory(partialInewsStory: Partial<InewsStory> = {}): InewsStory {
    return {
      id: this.generateRandomId(),
      name: 'Story name',
      queueId: this.generateQueueId(),
      contentLocator: this.generateRandomId(),
      versionLocator: this.generateRandomId(),
      metadata: {},
      cues: [],
      ...partialInewsStory,
    }
  }

  public static createInewsId(partialInewsId: Partial<InewsId>): InewsId {
    return {
      storyId: partialInewsId.storyId?.toUpperCase() ?? this.generateRandomId(),
      contentLocator: partialInewsId.contentLocator?.toUpperCase() ?? this.generateRandomId(),
      versionLocator: partialInewsId.versionLocator?.toUpperCase() ?? this.generateRandomId(),
    }
  }
}
