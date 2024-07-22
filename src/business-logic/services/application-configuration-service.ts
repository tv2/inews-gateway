import { ApplicationConfigurationRepository } from '../../data-access/interfaces/application-configuration-repository'
import { ApplicationConfiguration } from '../../data-access/value-objects/application-configuration'
import { ConfigurationService } from '../interfaces/configuration-service'

export class ApplicationConfigurationService implements ConfigurationService<ApplicationConfiguration> {
  public constructor(private readonly applicationConfigurationRepository: ApplicationConfigurationRepository) {}

  public getApplicationConfiguration(): ApplicationConfiguration {
    return this.applicationConfigurationRepository.getApplicationConfiguration()
  }
}
