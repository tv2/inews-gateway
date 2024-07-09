import { LoggerFacade } from '../../logger/logger-facade'
import { IngestEventServer } from '../services/ingest-event-server'
import { WebsocketServer } from '../services/websocket-server'
import { EventEmitterFacade } from '../facades/event-emitter-facade'

export class IngestEventServerFactory {
  public static createIngestEventWebsocketServer(): IngestEventServer {
    return new IngestEventServer(
      new WebsocketServer(LoggerFacade.createLogger()),
      EventEmitterFacade.createIngestEventObserver(),
      LoggerFacade.createLogger(),
    )
  }
}
