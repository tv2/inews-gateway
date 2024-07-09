import { IngestEventServerFactory } from './presentation/factories/ingest-event-server-factory'
import { LoggerFacade } from './logger/logger-facade'
import { InewsGatewayServer } from './inews-gateway-server'
import { EventEmitterFacade } from './presentation/facades/event-emitter-facade'
import { QueuePoolObserver } from './presentation/emitters/queue-pool-observer'

const INGEST_EVENT_SERVER_PORT: number = 3008

new InewsGatewayServer(
  IngestEventServerFactory.createIngestEventWebsocketServer(),
  EventEmitterFacade.createIngestEventEmitter(),
  QueuePoolObserver.getInstance(),
)
  .start({ ingestEventServerPort: INGEST_EVENT_SERVER_PORT })
  .catch(LoggerFacade.createLogger().tag('startup').error)
