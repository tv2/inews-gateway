import { LoggerFacade } from '../../logger/logger-facade'
import { ClientEventServer } from '../services/client-event-server'
import { WebsocketServer } from '../services/websocket-server'
import { EventEmitterFacade } from './event-emitter-facade'
import { EventServer } from '../interfaces/event-server'
import { DomainEventFacade } from '../../business-logic/facades/domain-event-facade'

export class EventServerFacade {
  public static createWebsocketEventServer(): EventServer {
    return new ClientEventServer(
      new WebsocketServer(LoggerFacade.createLogger()),
      EventEmitterFacade.createIngestEventObserver(),
      EventEmitterFacade.createConnectionStateEventObserver(),
      DomainEventFacade.createInewsQueuePoolEmitter(),
      LoggerFacade.createLogger(),
    )
  }
}
