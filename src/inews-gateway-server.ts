import { EventServer } from './presentation/interfaces/event-server'

export interface InewsGatewayServerConfiguration {
  eventServerPort: number
}

export class InewsGatewayServer {
  public constructor(
    private readonly eventServer: EventServer,
  ) {}

  public async start(configuration: InewsGatewayServerConfiguration): Promise<void> {
    await this.eventServer.start(configuration.eventServerPort)
  }
}
