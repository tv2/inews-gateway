import {
  InewsQueueEvent,
  InewsStoryChangedEvent,
  InewsStoryCreatedEvent, InewsStoryDeletedEvent,
  InewsStoryMovedEvent,
} from '../value-objects/ingest-event'
import { InewsStory } from '../../business-logic/entities/inews-story'
import { InewsQueue } from '../../business-logic/entities/inews-queue'

export interface IngestEventBuilder {
  buildInewsQueueEvent(inewsQueue: InewsQueue): InewsQueueEvent
  buildInewsStoryCreatedEvent(inewsStory: InewsStory): InewsStoryCreatedEvent
  buildInewsStoryChangedEvent(inewsStory: InewsStory): InewsStoryChangedEvent
  buildInewsStoryMovedEvent(inewsStory: InewsStory): InewsStoryMovedEvent
  buildInewsStoryDeletedEvent(inewsQueueId: string, inewsStoryId: string): InewsStoryDeletedEvent
}
