import { ApplicationConfigurationRepository } from '../interfaces/application-configuration-repository'
import {
  DotEnvApplicationConfigurationRepository,
} from '../services/dot-env-application-configuration-repository'

export class RepositoryFacade {
  public static createApplicationConfigurationRepository(): ApplicationConfigurationRepository {
    return new DotEnvApplicationConfigurationRepository()
  }
}
