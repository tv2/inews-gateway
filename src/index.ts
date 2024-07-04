import cors from 'cors'
import express, { Express } from 'express'
import { Logger } from './logger/logger'
import { EventServerFacade } from './facades/event-server-facade'
import { LoggerFacade } from './logger/logger-facade'

const REST_API_PORT: number = 3007
const GATEWAY_EVENT_SERVER_PORT: number = 3008

class INewsGateway {
  public server: Express

  public constructor() {
    this.server = express()
    this.server.use(express.json())
    this.server.use(cors())
  }
}

function startINewsGateway(): void {
  attachExpressServerToPort(REST_API_PORT)
  startEventServer()
}

function attachExpressServerToPort(port: number): void {
  new INewsGateway().server.listen(port, () => {
    const logger: Logger = LoggerFacade.createLogger().tag('Startup')
    return logger.info(`Express is listening at http://localhost:${port}`)
  })
}

function startEventServer(): void {
  EventServerFacade.createEventServer().startServer(GATEWAY_EVENT_SERVER_PORT)
}

startINewsGateway()
