import { ApplicationConfigurationService } from '../interfaces/application-configuration-service'
import { ApplicationConfigurationRepositoryService } from '../services/application-configuration-repository-service'
import { RepositoryFacade } from '../../data-access/facades/repository-facade'

export class ServiceFacade {
  public static createApplicationConfigurationService(): ApplicationConfigurationService {
    return new ApplicationConfigurationRepositoryService(RepositoryFacade.createApplicationConfigurationRepository())
  }
}
