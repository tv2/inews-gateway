import { IngestEventServerFactory } from './presentation/factories/ingest-event-server-factory'
import { LoggerFacade } from './logger/logger-facade'
import { InewsGatewayServer } from './inews-gateway-server'

const INGEST_EVENT_SERVER_PORT: number = 3008

new InewsGatewayServer(
  IngestEventServerFactory.createIngestEventWebsocketServer(),
)
  .start({ ingestEventServerPort: INGEST_EVENT_SERVER_PORT })
  .catch(LoggerFacade.createLogger().tag('startup').error)
