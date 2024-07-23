import { ConnectionStateEventObserver } from '../interfaces/connection-state-event-observer'
import { ConnectionStateEvent } from '../value-objects/connection-state-event'
import { ConnectionStateObserver } from '../../business-logic/interfaces/connection-state-observer'
import { ConnectionStateEventBuilder } from '../interfaces/connection-state-event-builder'
import { InewsQueueObserver } from '../../business-logic/interfaces/inews-queue-observer'
import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { IngestEvent } from '../value-objects/ingest-event'
import { InewsStory } from '../../business-logic/entities/inews-story'

export class DomainEventAdapter implements ConnectionStateEventObserver, IngestEventObserver {
  private readonly onConnectionStateEventCallbacks: ((connectionStateEvent: ConnectionStateEvent) => void)[] = []
  private readonly onIngestEventCallbacks: ((ingestEvent: IngestEvent) => void)[] = []

  public constructor(
    private readonly connectionStateObserver: ConnectionStateObserver,
    private readonly connectionStateEventBuilder: ConnectionStateEventBuilder,
    private readonly inewsQueueObserver: InewsQueueObserver,
    private readonly ingestEventBuilder: IngestEventBuilder,
  ) {
    this.connectionStateObserver.subscribeToConnectionState((connectionState) => {
      const event: ConnectionStateEvent = this.connectionStateEventBuilder.buildConnectionStateEvent(connectionState)
      this.onConnectionStateEventCallbacks.forEach(callback => callback(event))
    })

    this.inewsQueueObserver.subscribeToCreatedInewsStories((inewsStory: InewsStory) => {
      const event: IngestEvent = this.ingestEventBuilder.buildInewsStoryCreatedEvent(inewsStory)
      this.onIngestEventCallbacks.forEach(callback => callback(event))
    })

    this.inewsQueueObserver.subscribeToChangedInewsStories((inewsStory: InewsStory) => {
      const event: IngestEvent = this.ingestEventBuilder.buildInewsStoryChangedEvent(inewsStory)
      this.onIngestEventCallbacks.forEach(callback => callback(event))
    })

    this.inewsQueueObserver.subscribeToMovedInewsStories((inewsStory: InewsStory) => {
      const event: IngestEvent = this.ingestEventBuilder.buildInewsStoryMovedEvent(inewsStory)
      this.onIngestEventCallbacks.forEach(callback => callback(event))
    })

    this.inewsQueueObserver.subscribeToDeletedInewsStories((inewsQueueId: string, inewsStoryId: string) => {
      const event: IngestEvent = this.ingestEventBuilder.buildInewsStoryDeletedEvent(inewsQueueId, inewsStoryId)
      this.onIngestEventCallbacks.forEach(callback => callback(event))
    })
  }

  public subscribeToConnectionStateEvents(onConnectionStateEventCallback: (connectionStateEvent: ConnectionStateEvent) => void): void {
    this.onConnectionStateEventCallbacks.push(onConnectionStateEventCallback)
  }

  public subscribeToIngestEvents(onIngestEventCallback: (ingestEvent: IngestEvent) => void): void {
    this.onIngestEventCallbacks.push(onIngestEventCallback)
  }
}
