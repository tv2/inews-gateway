import { ApplicationConfigurationRepository } from '../interfaces/application-configuration-repository'
import {
  EnvironmentVariableApplicationConfigurationRepository,
} from '../services/environment-variable-application-configuration-repository'

export class RepositoryFacade {
  public static createApplicationConfigurationRepository(): ApplicationConfigurationRepository {
    return new EnvironmentVariableApplicationConfigurationRepository()
  }
}
