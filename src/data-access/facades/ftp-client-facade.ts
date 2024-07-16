import { FtpConnectionConfiguration } from '../value-objects/ftp-connection-configuration'
import { FtpClient } from '../interfaces/ftp-client'
import { RoundRobinFtpClientPool } from '../services/round-robin-ftp-client-pool'
import { BasicFtpFtpClient } from '../services/basic-ftp-ftp-client'
import { LoggerFacade } from '../../logger/logger-facade'

export class FtpClientFacade {
  public static createFtpClient(connectionConfiguration: FtpConnectionConfiguration): FtpClient {
    return new BasicFtpFtpClient(connectionConfiguration, LoggerFacade.createLogger())
  }

  public static createRoundRobinFtpClientPool(connectionConfigurations: FtpConnectionConfiguration[]): FtpClient {
    return new RoundRobinFtpClientPool(connectionConfigurations.map(connectionConfiguration => this.createFtpClient(connectionConfiguration)))
  }
}
