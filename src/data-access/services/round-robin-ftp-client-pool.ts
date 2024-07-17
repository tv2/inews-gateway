import { ConnectionStatus } from '../enums/connection-status'
import { FtpClient } from '../interfaces/ftp-client'
import { FileMetadata } from '../value-objects/file-metadata'
import { ConnectionState } from '../value-objects/connection-state'

const MAX_FAILED_OPERATIONS_THRESHOLD: number = 20
const SUCCESSFUL_OPERATION_WEIGHT: number = 1
const FAILED_OPERATION_WEIGHT: number = 2

export class RoundRobinFtpClientPool implements FtpClient {
  private connectedFtpClient?: FtpClient
  private onConnectionStateChangedCallback?: (connectionState: ConnectionState) => void
  private failedOperationsTracker: number = 0

  public constructor(private ftpClients: readonly FtpClient[]) {}

  public async connect(): Promise<void> {
    await this.getConnectedFtpClient()
  }

  private async getConnectedFtpClient(): Promise<FtpClient> {
    if (!this.connectedFtpClient?.isConnected()) {
      this.connectedFtpClient = await this.getFtpClientByRoundRobin()
    }
    return this.connectedFtpClient
  }

  private async getFtpClientByRoundRobin(): Promise<FtpClient> {
    await this.disconnect()
    this.emitConnectionState({ status: ConnectionStatus.CONNECTING })

    for (const ftpClient of this.ftpClients) {
      try {
        await ftpClient.connect()
        this.emitConnectionState({ status: ConnectionStatus.CONNECTED })
        ftpClient.setOnConnectionStateChangedCallback(connectionState => this.emitConnectionState(connectionState))
        return ftpClient
      } catch {
        ftpClient.clearOnConnectionStateChangedCallback()
      }
    }

    this.emitConnectionState({ status: ConnectionStatus.DISCONNECTED, message: 'No available iNews servers.' })
    throw new Error('No available iNews servers.')
  }

  private emitConnectionState(connectionState: ConnectionState): void {
    this.onConnectionStateChangedCallback?.(connectionState)
  }

  public isConnected(): boolean {
    return this.connectedFtpClient?.isConnected() ?? false
  }

  public async changeWorkingDirectory(path: string): Promise<void> {
    return this.trackFailedOperations(async () => {
      const ftpClient: FtpClient = await this.getConnectedFtpClient()
      await ftpClient.changeWorkingDirectory(path)
    })
  }

  private async trackFailedOperations<T>(operationCallback: () => Promise<T>): Promise<T> {
    await this.reconnectIfHasTooManyFailedOperations()
    try {
      const result: T = await operationCallback()
      this.failedOperationsTracker = Math.max(0, this.failedOperationsTracker - SUCCESSFUL_OPERATION_WEIGHT)
      return result
    } catch (error) {
      this.failedOperationsTracker += FAILED_OPERATION_WEIGHT
      throw error
    }
  }

  private async reconnectIfHasTooManyFailedOperations(): Promise<void> {
    if (this.failedOperationsTracker <= MAX_FAILED_OPERATIONS_THRESHOLD) {
      return
    }
    this.downPrioritizeConnectedFtpClient()
    this.connectedFtpClient = await this.getFtpClientByRoundRobin()
    this.failedOperationsTracker = 0
  }

  private downPrioritizeConnectedFtpClient(): void {
    if (!this.connectedFtpClient) {
      return
    }
    this.ftpClients = this.ftpClients
      .filter(ftpClient => ftpClient !== this.connectedFtpClient)
      .concat(this.connectedFtpClient)
  }

  public async listFiles(): Promise<readonly FileMetadata[]> {
    return this.trackFailedOperations(async () => {
      const ftpClient: FtpClient = await this.getConnectedFtpClient()
      return ftpClient.listFiles()
    })
  }

  public async getFile(filename: string): Promise<string> {
    return this.trackFailedOperations(async () => {
      const ftpClient: FtpClient = await this.getConnectedFtpClient()
      return ftpClient.getFile(filename)
    })
  }

  public setOnConnectionStateChangedCallback(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void {
    this.onConnectionStateChangedCallback = onConnectionStateChangedCallback
  }

  public clearOnConnectionStateChangedCallback(): void {
    delete this.onConnectionStateChangedCallback
  }

  public async disconnect(): Promise<void> {
    if (this.connectedFtpClient?.isConnected()) {
      await this.connectedFtpClient?.disconnect()
    }
    this.connectedFtpClient?.clearOnConnectionStateChangedCallback()
  }
}
