import { ApplicationConfigurationService } from '../interfaces/application-configuration-service'
import { ApplicationConfigurationRepositoryService } from '../services/application-configuration-repository-service'
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
import { InewsStoryParser } from '../interfaces/inews-story-parser'
import { NsmlInewsStoryParser } from '../services/nsml-inews-story-parser'
import { RegExpNsmlParser } from '../services/reg-exp-nsml-parser'
import { InewsQueueDiffer } from '../interfaces/inews-queue-differ'
import { InewsQueueDifferImplementation } from '../services/inews-queue-differ-implementation'
import { InewsIdParser } from '../interfaces/inews-id-parser'
import { InewsIdParserImplementation } from '../services/inews-id-parser-implementation'

export class ServiceFacade {
  public static createApplicationConfigurationService(): ApplicationConfigurationService {
    return new ApplicationConfigurationRepositoryService(RepositoryFacade.createApplicationConfigurationRepository())
  }

  public static createInewsQueueWatcher(): InewsQueueWatcher {
    const applicationConfiguration: ApplicationConfiguration = this.createApplicationConfigurationService().getApplicationConfiguration()
    return new PollingInewsQueueWatcher(
      applicationConfiguration.inewsPollingIntervalInMs,
      this.createInewsClient(),
      DomainEventFacade.createConnectionStateEmitter(),
      DomainEventFacade.createInewsQueuePoolObserver(),
      DomainEventFacade.createInewsQueueEmitter(),
      this.createInewsQueueDiffer(),
      LoggerFacade.createLogger(),
    )
  }

  public static createInewsClient(): InewsClient {
    const applicationConfiguration: ApplicationConfiguration = this.createApplicationConfigurationService().getApplicationConfiguration()
    return new FtpInewsClient(FtpClientFacade.createRoundRobinFtpClientPool(applicationConfiguration.inewsFtpConnectionConfigurations), this.createInewsTimestampParser(), this.createInewsStoryParser(), this.createInewsIdParser(), LoggerFacade.createLogger())
  }

  public static createInewsStoryParser(): InewsStoryParser {
    return new NsmlInewsStoryParser(new RegExpNsmlParser(), this.createInewsIdParser())
  }

  public static createInewsTimestampParser(): InewsTimestampParser {
    return new InewsFtpTimestampParser()
  }

  public static createInewsQueueDiffer(): InewsQueueDiffer {
    return new InewsQueueDifferImplementation()
  }

  public static createInewsIdParser(): InewsIdParser {
    return new InewsIdParserImplementation()
  }
}
