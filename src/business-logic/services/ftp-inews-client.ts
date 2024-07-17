import { FtpClient } from '../../data-access/interfaces/ftp-client'
import { FileMetadata } from '../../data-access/value-objects/file-metadata'
import { StoryMetadata } from '../value-objects/story-metadata'
import { InewsClient } from '../interfaces/inews-client'
import { InewsTimestampParser } from '../interfaces/inews-timestamp-parser'
import { ConnectionStatus } from '../../data-access/enums/connection-status'

export class FtpInewsClient implements InewsClient {
  private readonly onConnectionStatusChangedCallbacks: ((connectionStatus: ConnectionStatus) => void)[] = []

  public constructor(
    private readonly ftpClient: FtpClient,
    private readonly inewsTimestampParser: InewsTimestampParser,
  ) {}

  public async connect(): Promise<void> {
    this.ftpClient.setOnConnectionStatusChangedCallback(connectionStatus => this.emitConnectionStatus(connectionStatus))
    await this.ftpClient.connect()
  }

  private emitConnectionStatus(connectionStatus: ConnectionStatus): void {
    this.onConnectionStatusChangedCallbacks.forEach(callback => callback(connectionStatus))
  }

  public async getStoryMetadataForQueue(queueId: string): Promise<readonly StoryMetadata[]> {
    await this.setWorkingDirectory(queueId)
    const fileMetadataCollection: readonly FileMetadata[] = await this.ftpClient.listFiles()
    return fileMetadataCollection
      .filter(fileMetadata => fileMetadata.type === 'file')
      .map(fileMetadata => ({
        id: this.getStoryIdFromFileMetadata(fileMetadata),
        name: this.getStoryNameFromFileMetadata(fileMetadata),
        modifiedAtEpochTime: this.inewsTimestampParser.parseInewsFtpTimestamp(fileMetadata.modifiedAt),
      }))
  }

  private async setWorkingDirectory(path: string): Promise<void> {
    await this.ftpClient.changeWorkingDirectory('/')
    await this.ftpClient.changeWorkingDirectory(path)
  }

  public async getStory(queueId: string, storyId: string): Promise<unknown> {
    await this.setWorkingDirectory(queueId)
    return this.ftpClient.getFile(storyId)
  }

  private getStoryIdFromFileMetadata(fileMetadata: FileMetadata): string {
    return fileMetadata.name.trim().split(':')[0] ?? fileMetadata.name
  }

  private getStoryNameFromFileMetadata(fileMetadata: FileMetadata): string {
    return fileMetadata.name.trim().split(' ').slice(1).join(' ') ?? 'unknown name'
  }

  public subscribeToConnectionStatus(onConnectionStatusChangedCallback: (connectionStatus: ConnectionStatus) => void): void {
    this.onConnectionStatusChangedCallbacks.push(onConnectionStatusChangedCallback)
  }

  public async disconnect(): Promise<void> {
    await this.ftpClient.disconnect()
    this.ftpClient.setOnConnectionStatusChangedCallback(() => {})
  }
}
