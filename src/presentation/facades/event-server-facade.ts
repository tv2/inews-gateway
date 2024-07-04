import { EventServer } from '../interfaces/event-server'
import { SocketEventServer } from '../emitters/socket-event.server'
import { LoggerFacade } from '../../logger/logger-facade'

export class EventServerFacade {
  public static createEventServer(): EventServer {
    return SocketEventServer.getInstance(LoggerFacade.createLogger())
  }
}
