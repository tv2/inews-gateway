import { ApplicationConfiguration } from '../value-objects/application-configuration'

export interface ApplicationConfigurationRepository {
  getApplicationConfiguration(): ApplicationConfiguration
}
