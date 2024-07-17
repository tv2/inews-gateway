import { EventServerFacade } from './presentation/facades/event-server-facade'
import { LoggerFacade } from './logger/logger-facade'
import { InewsGatewayServer } from './inews-gateway-server'
import { ServiceFacade } from './business-logic/facades/service-facade'

new InewsGatewayServer(
  EventServerFacade.createWebsocketEventServer(),
  ServiceFacade.createApplicationConfigurationService(),
)
  .start()
  .catch(LoggerFacade.createLogger().tag('startup').error)
