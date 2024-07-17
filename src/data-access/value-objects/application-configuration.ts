import { FtpConnectionConfiguration } from './ftp-connection-configuration'

export interface ApplicationConfiguration {
  inewsFtpConnectionConfigurations: FtpConnectionConfiguration[]
  eventServerPort: number
}
