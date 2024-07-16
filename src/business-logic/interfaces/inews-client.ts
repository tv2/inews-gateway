import { StoryMetadata } from '../value-objects/story-metadata'

export interface InewsClient {
  getStoryMetadataForQueue(queueId: string): Promise<readonly StoryMetadata[]>
  getStory(queueId: string, storyId: string): Promise<unknown>
}
