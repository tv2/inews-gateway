import { InewsQueueWatcher } from '../interfaces/inews-queue-watcher'
import { InewsClient } from '../interfaces/inews-client'
import { Logger } from '../../logger/logger'
import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { InewsQueuePoolObserver } from '../interfaces/inews-queue-pool-observer'
import { InewsStory } from '../entities/inews-story'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { InewsQueueEmitter } from '../interfaces/inews-queue-emitter'

export class PollingInewsQueueWatcher implements InewsQueueWatcher {
  private pollingTimer?: NodeJS.Timeout
  private queueIds: readonly string[] = []
  private readonly logger: Logger

  public constructor(
    private readonly pollingIntervalInMs: number,
    private readonly inewsClient: InewsClient,
    private readonly connectionStateEmitter: ConnectionStateEmitter,
    private readonly inewsQueuePoolObserver: InewsQueuePoolObserver,
    private readonly inewsQueueEmitter: InewsQueueEmitter,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
  }

  public async start(): Promise<void> {
    this.inewsQueuePoolObserver.subscribeToQueuePoolChanges(queueIds => this.queueIds = queueIds)
    this.inewsClient.subscribeToConnectionState(connectionState => this.connectionStateEmitter.emitConnectionState(connectionState))
    await this.inewsClient.connect().catch(error => this.logger.data(error).error('Failed connecting to iNews server.'))
    this.schedulePolling()
  }

  private schedulePolling(): void {
    this.clearPollingTimer()
    this.pollData()
      .catch(error => this.logger.data(error).warn('Failed polling data.'))
      .finally(() => this.pollingTimer = setTimeout(() => this.schedulePolling(), this.pollingIntervalInMs))
  }

  private async pollData(): Promise<void> {
    const startTime: [number, number] = process.hrtime()
    for (const queueId of this.queueIds) {
      const changedStories: readonly InewsStory[] = await this.fetchChangedStoriesForQueue(queueId)
      changedStories.forEach(story => this.inewsQueueEmitter.emitChangedInewsStory(story))
      this.logger.debug(`${queueId} has ${changedStories.length} changed stories.`)
    }
    const diff: [number, number] = process.hrtime(startTime)
    this.logger.debug(`Pulling changes for ${this.queueIds.length} queues took ${diff[0] * 1000 + diff[1] / 1_000_000}ms.`)
  }

  private storyMetadataCache: Record<string, InewsStoryMetadata> = {}

  private async fetchChangedStoriesForQueue(queueId: string): Promise<readonly InewsStory[]> {
    const storyMetadataCollection: readonly InewsStoryMetadata[] = await this.inewsClient.getStoryMetadataForQueue(queueId)
    let changedInewsStories: InewsStory[] = []
    for (const storyMetadata of storyMetadataCollection) {
      if (this.hasStoryContentChanged(storyMetadata)) {
        changedInewsStories.push(await this.inewsClient.getStory(queueId, storyMetadata.id))
      }
      if (this.hasStoryChanged(storyMetadata)) {
        this.storyMetadataCache[storyMetadata.id] = storyMetadata
      }
    }
    return changedInewsStories
  }

  private hasStoryContentChanged(storyMetadata: InewsStoryMetadata): boolean {
    const previousStoryMetadata: InewsStoryMetadata | undefined = this.storyMetadataCache[storyMetadata.id]
    if (!previousStoryMetadata) {
      return true
    }

    if (storyMetadata.versionLocator === previousStoryMetadata.versionLocator) {
      return false
    }

    return storyMetadata.contentLocator !== previousStoryMetadata.contentLocator
  }

  private hasStoryChanged(storyMetadata: InewsStoryMetadata): boolean {
    const previousStoryMetadata: InewsStoryMetadata | undefined = this.storyMetadataCache[storyMetadata.id]
    return storyMetadata.versionLocator !== previousStoryMetadata?.versionLocator
  }

  private clearPollingTimer(): void {
    if (!this.pollingTimer) {
      return
    }
    clearTimeout(this.pollingTimer)
    delete this.pollingTimer
  }

  public async stop(): Promise<void> {
    this.clearPollingTimer()
    await this.inewsClient.disconnect()
  }
}
