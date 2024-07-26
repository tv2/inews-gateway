import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { InewsStory } from '../entities/inews-story'

export interface InewsClient {
  connect(): Promise<void>
  getStoryMetadataForQueue(queueId: string): Promise<readonly InewsStoryMetadata[]>
  getStory(queueId: string, storyId: string): Promise<InewsStory>
  subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void
  disconnect(): Promise<void>
}
