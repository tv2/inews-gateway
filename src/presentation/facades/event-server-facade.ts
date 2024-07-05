import { EventServer } from '../interfaces/event-server'
import { SocketEventServer } from '../emitters/socket-event.server'
import { LoggerFacade } from '../../logger/logger-facade'
import { EventEmitterFacade } from './event-emitter-facade'

export class EventServerFacade {
  public static createEventServer(): EventServer {
    return SocketEventServer.getInstance(EventEmitterFacade.createIngestEventEmitter(), EventEmitterFacade.createIngestEventObserver(), LoggerFacade.createLogger())
  }
}
