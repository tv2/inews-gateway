import { LoggerFacade } from '../../logger/logger-facade'
import { ClientEventServer } from '../services/client-event-server'
import { WebsocketServer } from '../services/websocket-server'
import { EventServer } from '../interfaces/event-server'
import { DomainEventFacade } from '../../business-logic/facades/domain-event-facade'
import { EventBuilderFacade } from './event-builder-facade'

export class EventServerFacade {
  public static createWebsocketEventServer(): EventServer {
    return new ClientEventServer(
      new WebsocketServer(LoggerFacade.createLogger()),
      DomainEventFacade.createConnectionStateObserver(),
      EventBuilderFacade.createConnectionStateEventBuilder(),
      DomainEventFacade.createInewsQueueObserver(),
      EventBuilderFacade.createIngestEventBuilder(),
      DomainEventFacade.createInewsQueuePoolEmitter(),
      LoggerFacade.createLogger(),
    )
  }
}
