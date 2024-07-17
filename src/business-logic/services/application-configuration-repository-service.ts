import { ApplicationConfigurationRepository } from '../../data-access/interfaces/application-configuration-repository'
import { ApplicationConfiguration } from '../../data-access/value-objects/application-configuration'
import { ApplicationConfigurationService } from '../interfaces/application-configuration-service'

export class ApplicationConfigurationRepositoryService implements ApplicationConfigurationService {
  public constructor(private readonly applicationConfigurationRepository: ApplicationConfigurationRepository) {}

  public getApplicationConfiguration(): ApplicationConfiguration {
    return this.applicationConfigurationRepository.getApplicationConfiguration()
  }
}
