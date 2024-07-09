import { IngestEvent } from '../value-objects/ingest-event'

export interface IngestEventBuilder {
  buildTestEvent(queueId: string): IngestEvent
}
