import {
  InewsQueueEvent,
  InewsStoryChangedEvent,
  InewsStoryCreatedEvent, InewsStoryDeletedEvent,
  InewsStoryMovedEvent,
  IngestEvent,
} from '../value-objects/ingest-event'
import { InewsStory } from '../../business-logic/entities/inews-story'
import { InewsQueue } from '../../business-logic/entities/inews-queue'

export interface IngestEventBuilder {
  buildTestEvent(queueId: string): IngestEvent
  buildInewsQueueEvent(inewsQueue: InewsQueue): InewsQueueEvent
  buildInewsStoryCreatedEvent(inewsStory: InewsStory): InewsStoryCreatedEvent
  buildInewsStoryChangedEvent(inewsStory: InewsStory): InewsStoryChangedEvent
  buildInewsStoryMovedEvent(inewsStory: InewsStory): InewsStoryMovedEvent
  buildInewsStoryDeletedEvent(inewsQueueId: string, inewsStoryId: string): InewsStoryDeletedEvent

}
