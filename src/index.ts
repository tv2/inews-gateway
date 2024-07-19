import { EventServerFacade } from './presentation/facades/event-server-facade'
import { LoggerFacade } from './logger/logger-facade'
import { InewsGatewayServer } from './inews-gateway-server'

const EVENT_SERVER_PORT: number = 3008

new InewsGatewayServer(
  EventServerFacade.createWebsocketEventServer(),
)
  .start({ eventServerPort: EVENT_SERVER_PORT })
  .catch(LoggerFacade.createLogger().tag('startup').error)
