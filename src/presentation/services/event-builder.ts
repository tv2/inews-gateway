import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { IngestEvent } from '../value-objects/ingest-event'
import { IngestEventType } from '../enums/ingest-event-type'

export class EventBuilder implements IngestEventBuilder {
  public buildTestEvent(queueId: string): IngestEvent {
    return {
      type: IngestEventType.TEST_EVENT,
      queueId,
    }
  }
}
