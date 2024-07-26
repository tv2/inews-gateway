import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { EventBuilder } from '../services/event-builder'
import { ConnectionStateEventBuilder } from '../interfaces/connection-state-event-builder'

export class EventBuilderFacade {
  public static createIngestEventBuilder(): IngestEventBuilder {
    return new EventBuilder()
  }

  public static createConnectionStateEventBuilder(): ConnectionStateEventBuilder {
    return new EventBuilder()
  }
}
