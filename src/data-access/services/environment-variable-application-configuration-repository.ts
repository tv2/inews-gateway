import { ApplicationConfigurationRepository } from '../interfaces/application-configuration-repository'
import { ApplicationConfiguration } from '../value-objects/application-configuration'
import { FtpConnectionConfiguration } from '../value-objects/ftp-connection-configuration'

export class EnvironmentVariableApplicationConfigurationRepository implements ApplicationConfigurationRepository {
  public getApplicationConfiguration(): ApplicationConfiguration {
    return {
      inewsFtpConnectionConfigurations: this.getFtpConnectionConfigurations(),
      inewsPollingIntervalInMs: this.parseInteger(process.env.INEWS_POLLING_INTERVAL_IN_MS ?? '', 2000),
      eventServerPort: this.parseInteger(process.env.EVENT_SERVER_PORT ?? '', 3008),
    }
  }

  private getFtpConnectionConfigurations(): FtpConnectionConfiguration[] {
    const hosts: readonly string[] = process.env.INEWS_FTP_HOSTS?.split(',') ?? []
    const port: number = this.parseInteger(process.env.INEWS_FTP_PORT ?? '', 21)
    const user: string = process.env.INEWS_FTP_USER ?? ''
    const password: string = process.env.INEWS_FTP_PASSWORD ?? ''
    return hosts.map(host => ({
      host,
      port,
      user,
      password,
    }))
  }

  private parseInteger(text: string, defaultValue: number): number {
    const value: number = parseInt(text, 10)
    if (Number.isNaN(value)) {
      return defaultValue
    }
    return value
  }
}
