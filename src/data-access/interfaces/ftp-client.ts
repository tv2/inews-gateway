import { FileMetadata } from '../value-objects/file-metadata'
import { ConnectionState } from '../value-objects/connection-state'

export interface FtpClient {
  connect(): Promise<void>
  isConnected(): boolean
  changeWorkingDirectory(path: string): Promise<void>
  listFiles(): Promise<readonly FileMetadata[]>
  getFile(filename: string): Promise<string>
  setOnConnectionStateChangedCallback(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void
  clearOnConnectionStateChangedCallback(): void
  disconnect(): Promise<void>
}
