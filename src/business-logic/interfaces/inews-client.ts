import { StoryMetadata } from '../value-objects/story-metadata'

export interface InewsClient {
  connect(): Promise<void>
  getStoryMetadataForQueue(queueId: string): Promise<readonly StoryMetadata[]>
  getStory(queueId: string, storyId: string): Promise<unknown>
  disconnect(): Promise<void>
}
