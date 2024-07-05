import { EventType } from '../enums/event-type'
import { TypedEvent } from './typed-event'

export interface IngestEvent extends TypedEvent {
  type: EventType
}
