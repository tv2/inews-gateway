import { ApplicationConfiguration } from '../../data-access/value-objects/application-configuration'

export interface ApplicationConfigurationService {
  getApplicationConfiguration(): ApplicationConfiguration
}
