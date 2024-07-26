import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import {
  InewsQueueEvent,
  InewsStoryChangedEvent,
  InewsStoryCreatedEvent, InewsStoryDeletedEvent,
  InewsStoryMovedEvent,
} from '../value-objects/ingest-event'
import { IngestEventType } from '../enums/ingest-event-type'
import { ConnectionStateEventBuilder } from '../interfaces/connection-state-event-builder'
import { ConnectionStateEvent } from '../value-objects/connection-state-event'
import { ConnectionStateEventType } from '../enums/connection-state-event-type'
import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { ConnectionStatus } from '../../data-access/enums/connection-status'
import { InewsStory } from '../../business-logic/entities/inews-story'
import { InewsQueue } from '../../business-logic/entities/inews-queue'

export class EventBuilder implements IngestEventBuilder, ConnectionStateEventBuilder {
  public buildInewsQueueEvent(inewsQueue: InewsQueue): InewsQueueEvent {
    return {
      type: IngestEventType.INEWS_QUEUE,
      queueId: inewsQueue.id,
      queue: inewsQueue,
    }
  }

  public buildInewsStoryCreatedEvent(inewsStory: InewsStory): InewsStoryCreatedEvent {
    return {
      type: IngestEventType.INEWS_STORY_CREATED,
      queueId: inewsStory.queueId,
      story: inewsStory,
    }
  }

  public buildInewsStoryChangedEvent(inewsStory: InewsStory): InewsStoryChangedEvent {
    return {
      type: IngestEventType.INEWS_STORY_CHANGED,
      queueId: inewsStory.queueId,
      story: inewsStory,
    }
  }

  public buildInewsStoryMovedEvent(inewsStory: InewsStory): InewsStoryMovedEvent {
    return {
      type: IngestEventType.INEWS_STORY_MOVED,
      queueId: inewsStory.queueId,
      story: inewsStory,
    }
  }

  public buildInewsStoryDeletedEvent(queueId: string, storyId: string): InewsStoryDeletedEvent {
    return {
      type: IngestEventType.INEWS_STORY_DELETED,
      queueId,
      storyId: storyId,
    }
  }

  public buildConnectionStateEvent(connectionState: ConnectionState): ConnectionStateEvent {
    if (connectionState.status == ConnectionStatus.DISCONNECTED) {
      return {
        type: ConnectionStateEventType.CONNECTION_STATE_UPDATED,
        status: connectionState.status,
        message: connectionState.message,
      }
    }

    return {
      type: ConnectionStateEventType.CONNECTION_STATE_UPDATED,
      status: connectionState.status,
    }
  }
}
