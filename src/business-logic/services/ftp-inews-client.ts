import { FtpClient } from '../../data-access/interfaces/ftp-client'
import { FileMetadata } from '../../data-access/value-objects/file-metadata'
import { StoryMetadata } from '../value-objects/story-metadata'
import { InewsClient } from '../interfaces/inews-client'
import { InewsTimestampParser } from '../interfaces/inews-timestamp-parser'
import { ConnectionState } from '../../data-access/value-objects/connection-state'

export class FtpInewsClient implements InewsClient {
  private readonly onConnectionStateChangedCallbacks: ((connectionState: ConnectionState) => void)[] = []

  public constructor(
    private readonly ftpClient: FtpClient,
    private readonly inewsTimestampParser: InewsTimestampParser,
  ) {}

  public async connect(): Promise<void> {
    this.ftpClient.setOnConnectionStateChangedCallback(connectionState => this.emitConnectionState(connectionState))
    await this.ftpClient.connect()
  }

  private emitConnectionState(connectionState: ConnectionState): void {
    this.onConnectionStateChangedCallbacks.forEach(callback => callback(connectionState))
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

  public subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void {
    this.onConnectionStateChangedCallbacks.push(onConnectionStateChangedCallback)
  }

  public async disconnect(): Promise<void> {
    await this.ftpClient.disconnect()
    this.ftpClient.clearOnConnectionStateChangedCallback()
  }
}
