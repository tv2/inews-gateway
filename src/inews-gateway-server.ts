import { EventServer } from './presentation/interfaces/event-server'
import { ApplicationConfigurationService } from './business-logic/interfaces/application-configuration-service'
import { ApplicationConfiguration } from './data-access/value-objects/application-configuration'
export interface InewsGatewayServerConfiguration {
  eventServerPort: number
}

export class InewsGatewayServer {
  private readonly configuration: ApplicationConfiguration

  public constructor(
    private readonly eventServer: EventServer,
    applicationConfigurationService: ApplicationConfigurationService,
  ) {
    this.configuration = applicationConfigurationService.getApplicationConfiguration()
  }

  public async start(): Promise<void> {
    await this.eventServer.start(this.configuration.eventServerPort)
  }
}
