import { ConnectionStatus } from '../enums/connection-status'
import { FtpClient } from '../interfaces/ftp-client'
import { FileMetadata } from '../value-objects/file-metadata'

export class RoundRobinFtpClientPool implements FtpClient {
  private connectedFtpClient?: FtpClient
  private onConnectionStatusChangedCallback?: (connectionStatus: ConnectionStatus) => void

  public constructor(private readonly ftpClients: readonly FtpClient[]) {}

  public async connect(): Promise<void> {
    await this.getConnectedFtpClient()
  }

  private async getConnectedFtpClient(): Promise<FtpClient> {
    if (!this.connectedFtpClient || !this.connectedFtpClient.isConnected()) {
      this.connectedFtpClient = await this.getFtpClientByRoundRobin()
    }
    return this.connectedFtpClient
  }

  private async getFtpClientByRoundRobin(): Promise<FtpClient> {
    await this.disconnect()
    this.emitConnectionStatus(ConnectionStatus.CONNECTING)
    for (const ftpClient of this.ftpClients) {
      try {
        await ftpClient.connect()
        this.emitConnectionStatus(ConnectionStatus.CONNECTED)
        ftpClient.setOnConnectionStatusChangedCallback(connectionStatus => this.emitConnectionStatus(connectionStatus))
        return ftpClient
      } catch {
        ftpClient.setOnConnectionStatusChangedCallback(() => {})
      }
    }
    this.emitConnectionStatus(ConnectionStatus.DISCONNECTED)
    throw new Error('No available iNews servers.')
  }

  private emitConnectionStatus(connectionStatus: ConnectionStatus): void {
    this.onConnectionStatusChangedCallback?.(connectionStatus)
  }

  public isConnected(): boolean {
    return this.connectedFtpClient?.isConnected() ?? false
  }

  public async changeWorkingDirectory(path: string): Promise<void> {
    const ftpClient: FtpClient = await this.getConnectedFtpClient()
    await ftpClient.changeWorkingDirectory(path)
  }

  public async listFiles(): Promise<readonly FileMetadata[]> {
    const ftpClient: FtpClient = await this.getConnectedFtpClient()
    return ftpClient.listFiles()
  }

  public async getFile(filename: string): Promise<string> {
    const ftpClient: FtpClient = await this.getConnectedFtpClient()
    return ftpClient.getFile(filename)
  }

  public setOnConnectionStatusChangedCallback(onConnectionStatusChangedCallback: (connectionStatus: ConnectionStatus) => void): void {
    this.onConnectionStatusChangedCallback = onConnectionStatusChangedCallback
  }

  public async disconnect(): Promise<void> {
    if (this.connectedFtpClient?.isConnected()) {
      await this.connectedFtpClient?.disconnect()
    }
    this.connectedFtpClient?.setOnConnectionStatusChangedCallback(() => {})
  }
}
