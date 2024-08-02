import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { InewsStory } from '../entities/inews-story'
import { InewsId } from '../entities/inews-id'

export interface InewsClient {
  connect(): Promise<void>
  getStoryMetadataForQueue(queueId: string): Promise<readonly InewsStoryMetadata[]>
  getStory(queueId: string, inewsId: InewsId): Promise<InewsStory>
  subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void
  disconnect(reason: string): Promise<void>
}
