import { ConfigurationService } from '../interfaces/configuration-service'
import { ApplicationConfigurationService } from '../services/application-configuration-service'
import { RepositoryFacade } from '../../data-access/facades/repository-facade'
import { InewsQueueWatcher } from '../interfaces/inews-queue-watcher'
import { PollingInewsQueueWatcher } from '../services/polling-inews-queue-watcher'
import { InewsClient } from '../interfaces/inews-client'
import { LoggerFacade } from '../../logger/logger-facade'
import { ApplicationConfiguration } from '../../data-access/value-objects/application-configuration'
import { FtpInewsClient } from '../services/ftp-inews-client'
import { FtpClientFacade } from '../../data-access/facades/ftp-client-facade'
import { InewsTimestampParser } from '../interfaces/inews-timestamp-parser'
import { InewsFtpTimestampParser } from '../services/inews-ftp-timestamp-parser'
import { DomainEventFacade } from './domain-event-facade'

export class ServiceFacade {
  public static createApplicationConfigurationService(): ConfigurationService<ApplicationConfiguration> {
    return new ApplicationConfigurationService(RepositoryFacade.createApplicationConfigurationRepository())
  }

  public static createInewsQueueWatcher(): InewsQueueWatcher {
    const applicationConfiguration: ApplicationConfiguration = this.createApplicationConfigurationService().getApplicationConfiguration()
    return new PollingInewsQueueWatcher(applicationConfiguration.inewsPollingIntervalInMs, this.createInewsClient(), DomainEventFacade.createConnectionStateEmitter(), LoggerFacade.createLogger())
  }

  public static createInewsClient(): InewsClient {
    const applicationConfiguration: ApplicationConfiguration = this.createApplicationConfigurationService().getApplicationConfiguration()
    return new FtpInewsClient(FtpClientFacade.createRoundRobinFtpClientPool(applicationConfiguration.inewsFtpConnectionConfigurations), this.createInewsTimestampParser())
  }

  public static createInewsTimestampParser(): InewsTimestampParser {
    return new InewsFtpTimestampParser()
  }
}
