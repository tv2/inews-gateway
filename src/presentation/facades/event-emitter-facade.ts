import { IngestEventEmitter } from '../interfaces/ingest-event-emitter'
import { IngestEventService } from '../services/ingest-event-service'
import { EventBuilderFacade } from './event-builder-facade'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'

export class EventEmitterFacade {
  public static createIngestEventEmitter(): IngestEventEmitter {
    return IngestEventService.getInstance(EventBuilderFacade.createIngestEventBuilder())
  }

  public static createIngestEventObserver(): IngestEventObserver {
    return IngestEventService.getInstance(EventBuilderFacade.createIngestEventBuilder())
  }
}
