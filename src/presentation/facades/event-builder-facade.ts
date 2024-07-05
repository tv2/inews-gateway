import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { EventBuilder } from '../services/event-builder'

export class EventBuilderFacade {
  public static createIngestEventBuilder(): IngestEventBuilder {
    return new EventBuilder()
  }
}
