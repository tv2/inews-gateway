import { FileMetadata } from '../value-objects/file-metadata'
import { ConnectionStatus } from '../enums/connection-status'

export interface FtpClient {
  connect(): Promise<void>
  isConnected(): boolean
  changeWorkingDirectory(path: string): Promise<void>
  listFiles(): Promise<readonly FileMetadata[]>
  getFile(filename: string): Promise<string>
  setOnConnectionStatusChangedCallback(onConnectionStatusChangedCallback: (connectionStatus: ConnectionStatus) => void): void
  disconnect(): Promise<void>
}
