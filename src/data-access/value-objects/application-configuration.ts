import { FtpConnectionConfiguration } from './ftp-connection-configuration'

export interface ApplicationConfiguration {
  inewsFtpConnectionConfigurations: FtpConnectionConfiguration[]
  inewsPollingIntervalInMs: number
  eventServerPort: number
}
