import { FtpClient } from '../interfaces/ftp-client'
import { FtpConnectionConfiguration } from '../value-objects/ftp-connection-configuration'
import * as basicFtp from 'basic-ftp'
import { PassThrough } from 'node:stream'
import { Logger } from '../../logger/logger'
import { FileMetadata } from '../value-objects/file-metadata'
import { ConnectionStatus } from '../enums/connection-status'

const CONNECTION_TIMEOUT_DURATION_IN_MS: number = 4000

export class BasicFtpFtpClient implements FtpClient {
  private onConnectionStatusChangedCallback?: (connectionStatus: ConnectionStatus) => void
  private readonly ftpClient: basicFtp.Client = new basicFtp.Client(CONNECTION_TIMEOUT_DURATION_IN_MS)
  private readonly logger: Logger

  public constructor(
    private readonly configuration: FtpConnectionConfiguration,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
  }

  public async connect(): Promise<void> {
    try {
      this.onConnectionStatusChangedCallback?.(ConnectionStatus.CONNECTING)

      await this.connectWithConfiguration()

      this.onConnectionStatusChangedCallback?.(ConnectionStatus.CONNECTED)
      this.logger.info(`Connected to FTP server ${this.configuration.host}:${this.configuration.port}.`)

      this.configureFtpSocketToListenForDeadConnection()
    } catch (error) {
      this.onConnectionStatusChangedCallback?.(ConnectionStatus.DISCONNECTED)
      throw error
    }
  }

  private async connectWithConfiguration(): Promise<void> {
    await this.ftpClient.access({
      host: this.configuration.host,
      port: this.configuration.port,
      user: this.configuration.user,
      password: this.configuration.password,
      secure: false,
    })
  }

  private configureFtpSocketToListenForDeadConnection(): void {
    this.ftpClient.ftp.socket.on('timeout', () => {
      this.logger.info(`The connection to the FTP server ${this.configuration.host}:${this.configuration.port} timed out.`)
      this.onConnectionStatusChangedCallback?.(ConnectionStatus.DISCONNECTED)
    })

    this.ftpClient.ftp.socket.on('end', () => {
      this.logger.info(`FTP server ${this.configuration.host}:${this.configuration.port} terminated the connection.`)
      this.onConnectionStatusChangedCallback?.(ConnectionStatus.DISCONNECTED)
    })
  }

  public isConnected(): boolean {
    return !this.ftpClient.closed
  }

  public setOnConnectionStatusChangedCallback(onConnectionStatusChangedCallback: (connectionStatus: ConnectionStatus) => void): void {
    this.onConnectionStatusChangedCallback = onConnectionStatusChangedCallback
  }

  public clearOnConnectionStatusChangedCallback(): void {
    delete this.onConnectionStatusChangedCallback
  }

  public async changeWorkingDirectory(path: string): Promise<void> {
    await this.ftpClient.cd(path)
  }

  public async listFiles(): Promise<readonly FileMetadata[]> {
    const fileInfos: basicFtp.FileInfo[] = await this.ftpClient.list()
    return fileInfos.map(fileInfo => this.mapToFileMetadata(fileInfo))
  }

  private mapToFileMetadata(fileInfo: basicFtp.FileInfo): FileMetadata {
    return {
      type: basicFtp.FileType[fileInfo.type].toLowerCase(),
      name: fileInfo.name,
      modifiedAt: fileInfo.rawModifiedAt,
    }
  }

  public async getFile(filename: string): Promise<string> {
    const fileStream: PassThrough = new PassThrough()
    await this.ftpClient.downloadTo(fileStream, filename)
    return (await fileStream.toArray()).join('')
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected()) {
      return
    }
    this.ftpClient.close()
    this.onConnectionStatusChangedCallback?.(ConnectionStatus.DISCONNECTED)
    this.logger.info(`Disconnected from FTP server ${this.configuration.host}:${this.configuration.port}.`)
    return Promise.resolve()
  }
}
