import { TypedEvent } from './typed-event'
import { IngestEventType } from '../enums/ingest-event-type'

export interface IngestEvent extends TypedEvent {
  type: IngestEventType
  queueId: string
}
