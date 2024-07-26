import { EventBuilderFacade } from './event-builder-facade'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { ConnectionStateEventObserver } from '../interfaces/connection-state-event-observer'
import { DomainEventAdapter } from '../services/domain-event-adapter'
import { DomainEventFacade } from '../../business-logic/facades/domain-event-facade'

export class EventEmitterFacade {
  private static domainEventAdapater: DomainEventAdapter

  public static createIngestEventObserver(): IngestEventObserver {
    return this.getDomainEventAdapter()
  }

  public static createConnectionStateEventObserver(): ConnectionStateEventObserver {
    return this.getDomainEventAdapter()
  }

  private static getDomainEventAdapter(): DomainEventAdapter {
    this.domainEventAdapater ??= new DomainEventAdapter(DomainEventFacade.createConnectionStateObserver(), EventBuilderFacade.createConnectionStateEventBuilder(), DomainEventFacade.createInewsQueueObserver(), EventBuilderFacade.createIngestEventBuilder())
    return this.domainEventAdapater
  }
}
