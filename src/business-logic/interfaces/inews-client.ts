import { StoryMetadata } from '../value-objects/story-metadata'
import { ConnectionState } from '../../data-access/value-objects/connection-state'

export interface InewsClient {
  connect(): Promise<void>
  getStoryMetadataForQueue(queueId: string): Promise<readonly StoryMetadata[]>
  getStory(queueId: string, storyId: string): Promise<unknown>
  subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void
  disconnect(): Promise<void>
}
