import { TypedEvent } from './typed-event'
import { IngestEventType } from '../enums/ingest-event-type'
import { InewsStory } from '../../business-logic/entities/inews-story'
import { InewsQueue } from '../../business-logic/entities/inews-queue'

export interface IngestEvent extends TypedEvent<IngestEventType> {
  readonly queueId: string
}

export interface InewsStoryCreatedEvent extends IngestEvent {
  readonly type: IngestEventType.INEWS_STORY_CREATED
  readonly story: InewsStory
}

export interface InewsStoryChangedEvent extends IngestEvent {
  readonly type: IngestEventType.INEWS_STORY_CHANGED
  readonly story: InewsStory
}

export interface InewsStoryMovedEvent extends IngestEvent {
  readonly type: IngestEventType.INEWS_STORY_MOVED
  readonly story: InewsStory
}

export interface InewsStoryDeletedEvent extends IngestEvent {
  readonly type: IngestEventType.INEWS_STORY_DELETED
  readonly storyId: string
}

export interface InewsQueueEvent extends IngestEvent {
  readonly type: IngestEventType.INEWS_QUEUE
  readonly queue: InewsQueue
}
