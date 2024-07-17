import { LoggerFacade } from '../../logger/logger-facade'
import { ClientEventServer } from '../services/client-event-server'
import { WebsocketServer } from '../../data-access/services/websocket-server'
import { EventEmitterFacade } from './event-emitter-facade'
import { EventServer } from '../interfaces/event-server'

export class EventServerFacade {
  public static createWebsocketEventServer(): EventServer {
    return new ClientEventServer(
      new WebsocketServer(LoggerFacade.createLogger()),
      EventEmitterFacade.createIngestEventObserver(),
      LoggerFacade.createLogger(),
    )
  }
}
