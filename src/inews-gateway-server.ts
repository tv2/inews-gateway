import { EventServer } from './presentation/interfaces/event-server'
import { ApplicationConfigurationService } from './business-logic/interfaces/application-configuration-service'
import { ApplicationConfiguration } from './data-access/value-objects/application-configuration'
import { InewsQueueWatcher } from './business-logic/interfaces/inews-queue-watcher'

export class InewsGatewayServer {
  public constructor(
    private readonly eventServer: EventServer,
    private readonly applicationConfigurationService: ApplicationConfigurationService,
    private readonly inewsQueueWatcher: InewsQueueWatcher,
  ) {}

  public async start(): Promise<void> {
    const configuration: ApplicationConfiguration = this.applicationConfigurationService.getApplicationConfiguration()
    if (configuration.inewsFtpConnectionConfigurations.length === 0) {
      throw new Error('No iNews connection configuration found.')
    }
    await this.eventServer.start(configuration.eventServerPort)
    await this.inewsQueueWatcher.start()
  }
}
