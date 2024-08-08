import { FtpClient } from '../../data-access/interfaces/ftp-client'
import { FileMetadata } from '../../data-access/value-objects/file-metadata'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { InewsClient } from '../interfaces/inews-client'
import { InewsTimestampParser } from '../interfaces/inews-timestamp-parser'
import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { InewsStoryParser } from '../interfaces/inews-story-parser'
import { InewsStory } from '../entities/inews-story'
import { InewsIdParser } from '../interfaces/inews-id-parser'
import { InewsId } from '../entities/inews-id'
import { Logger } from '../../logger/logger'

export class FtpInewsClient implements InewsClient {
  private readonly onConnectionStateChangedCallbacks: ((connectionState: ConnectionState) => void)[] = []
  private readonly logger: Logger

  public constructor(
    private readonly ftpClient: FtpClient,
    private readonly inewsTimestampParser: InewsTimestampParser,
    private readonly inewsStoryParser: InewsStoryParser,
    private readonly inewsIdParser: InewsIdParser,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
  }

  public async connect(): Promise<void> {
    this.ftpClient.setOnConnectionStateChangedCallback(connectionState => this.emitConnectionState(connectionState))
    await this.ftpClient.connect()
  }

  private emitConnectionState(connectionState: ConnectionState): void {
    this.onConnectionStateChangedCallbacks.forEach(callback => callback(connectionState))
  }

  public async getStoryMetadataForQueue(queueId: string): Promise<readonly InewsStoryMetadata[]> {
    await this.setWorkingDirectory(queueId)
    const fileMetadataCollection: readonly FileMetadata[] = await this.ftpClient.listFiles()
    return fileMetadataCollection
      .filter(fileMetadata => fileMetadata.type === 'file')
      .reduce(
        (storyMetadataSequence: readonly InewsStoryMetadata[], fileMetadata: FileMetadata) => {
          try {
            const storyMetadata: InewsStoryMetadata = this.mapToInewsStoryMetadata(fileMetadata, queueId)
            return [...storyMetadataSequence, storyMetadata]
          } catch (error) {
            this.logger.data({ error, fileMetadata }).error('Failed converting file metadata to iNews story metadata.')
            return storyMetadataSequence
          }
        },
        [],
      )
  }

  private mapToInewsStoryMetadata(fileMetadata: FileMetadata, queueId: string): InewsStoryMetadata {
    const inewsId: InewsId = this.getInewsIdFromFileMetadata(fileMetadata)
    return {
      id: inewsId.storyId,
      name: this.getStoryNameFromFileMetadata(fileMetadata),
      queueId,
      contentLocator: inewsId.contentLocator,
      versionLocator: inewsId.versionLocator,
      modifiedAtEpochTime: this.inewsTimestampParser.parseInewsFtpTimestamp(fileMetadata.modifiedAt),
    }
  }

  private getInewsIdFromFileMetadata(fileMetadata: FileMetadata): InewsId {
    const inewsIdText: string | undefined = fileMetadata.name.trim().split(' ')[0]
    if (!inewsIdText) {
      throw new Error('Expected file name to have the format "<inews-id> <story-name>".')
    }
    return this.inewsIdParser.parseInewsId(inewsIdText)
  }

  private getStoryNameFromFileMetadata(fileMetadata: FileMetadata): string {
    return fileMetadata.name.trim().split(' ')[1] ?? fileMetadata.name.trim()
  }

  private async setWorkingDirectory(path: string): Promise<void> {
    await this.ftpClient.changeWorkingDirectory('/')
    await this.ftpClient.changeWorkingDirectory(path)
  }

  public async getStory(queueId: string, inewsId: InewsId): Promise<InewsStory> {
    await this.setWorkingDirectory(queueId)
    return this.inewsStoryParser.parseInewsStory(await this.ftpClient.getFile(inewsId.storyId), queueId, inewsId)
  }

  public subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void {
    this.onConnectionStateChangedCallbacks.push(onConnectionStateChangedCallback)
  }

  public async disconnect(reason: string): Promise<void> {
    await this.ftpClient.disconnect(reason)
    this.ftpClient.clearOnConnectionStateChangedCallback()
  }
}
