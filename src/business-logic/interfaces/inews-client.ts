import { StoryMetadata } from '../value-objects/story-metadata'
import { ConnectionStatus } from '../../data-access/enums/connection-status'

export interface InewsClient {
  connect(): Promise<void>
  getStoryMetadataForQueue(queueId: string): Promise<readonly StoryMetadata[]>
  getStory(queueId: string, storyId: string): Promise<unknown>
  subscribeToConnectionStatus(onConnectionStatusChangedCallback: (connectionStatus: ConnectionStatus) => void): void
  disconnect(): Promise<void>
}
