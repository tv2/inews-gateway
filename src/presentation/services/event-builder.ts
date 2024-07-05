import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { IngestEvent } from '../value-objects/ingest-event'
import { IngestEventType } from '../enums/event-type'

export class EventBuilder implements IngestEventBuilder {
  public buildTestEvent(): IngestEvent {
    return {
      type: IngestEventType.TEST_EVENT,
    }
  }
}
