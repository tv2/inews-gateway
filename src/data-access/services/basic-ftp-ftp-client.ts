import { FtpClient } from '../interfaces/ftp-client'
import { FtpConnectionConfiguration } from '../value-objects/ftp-connection-configuration'
import * as basicFtp from 'basic-ftp'
import { PassThrough } from 'node:stream'
import { Logger } from '../../logger/logger'

export class BasicFtpFtpClient implements FtpClient {
  private readonly ftpClient: basicFtp.Client = new basicFtp.Client()
  private readonly logger: Logger

  public constructor(
    private readonly configuration: FtpConnectionConfiguration,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
  }

  public async connect(): Promise<void> {
    await this.ftpClient.access({
      host: this.configuration.host,
      port: this.configuration.port,
      user: this.configuration.user,
      password: this.configuration.password,
      secure: false,
    })
    this.logger.info(`Connected to FTP server ${this.configuration.host}:${this.configuration.port}.`)
    this.ftpClient.ftp.socket.on('end', () => this.logger.info(`FTP server ${this.configuration.host}:${this.configuration.port} terminated the connection.`))
  }

  public async changeWorkingDirectory(path: string): Promise<void> {
    await this.ftpClient.cd(path)
  }

  public async listFiles(): Promise<readonly string[]> {
    const fileInfos: basicFtp.FileInfo[] = await this.ftpClient.list()
    return fileInfos.map(fileInfo => fileInfo.name)
  }

  public async getFile(filename: string): Promise<string> {
    const fileStream: PassThrough = new PassThrough()
    await this.ftpClient.downloadTo(fileStream, filename)
    return (await fileStream.toArray()).join('')
  }

  public async disconnect(): Promise<void> {
    if (this.ftpClient.closed) {
      return
    }
    this.ftpClient.close()
    this.logger.info(`Disconnected from FTP server ${this.configuration.host}:${this.configuration.port}.`)
    return Promise.resolve()
  }
}
