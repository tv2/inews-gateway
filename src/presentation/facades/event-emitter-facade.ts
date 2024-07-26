import { IngestEventEmitter } from '../interfaces/ingest-event-emitter'
import { IngestEventService } from '../services/ingest-event-service'
import { EventBuilderFacade } from './event-builder-facade'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { ConnectionStateEventObserver } from '../interfaces/connection-state-event-observer'
import { DomainEventAdapter } from '../services/domain-event-adapter'
import { DomainEventFacade } from '../../business-logic/facades/domain-event-facade'

export class EventEmitterFacade {
  public static createIngestEventEmitter(): IngestEventEmitter {
    return IngestEventService.getInstance(EventBuilderFacade.createIngestEventBuilder())
  }

  public static createIngestEventObserver(): IngestEventObserver {
    return IngestEventService.getInstance(EventBuilderFacade.createIngestEventBuilder())
  }

  public static createConnectionStateEventObserver(): ConnectionStateEventObserver {
    return new DomainEventAdapter(DomainEventFacade.createConnectionStateObserver(), EventBuilderFacade.createConnectionStateEventBuilder())
  }
}
