import { InewsQueueWatcher } from '../interfaces/inews-queue-watcher'
import { InewsClient } from '../interfaces/inews-client'
import { Logger } from '../../logger/logger'
import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { InewsQueuePoolObserver } from '../interfaces/inews-queue-pool-observer'
import { InewsStory } from '../entities/inews-story'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'

export class PollingInewsQueueWatcher implements InewsQueueWatcher {
  private pollingTimer?: NodeJS.Timeout
  private queueIds: readonly string[] = []
  private readonly logger: Logger

  public constructor(
    private readonly pollingIntervalInMs: number,
    private readonly inewsClient: InewsClient,
    private readonly connectionStateEmitter: ConnectionStateEmitter,
    private readonly inewsQueuePoolObserver: InewsQueuePoolObserver,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
  }

  public async start(): Promise<void> {
    this.inewsQueuePoolObserver.subscribeToQueuePoolChanges(queueIds => this.queueIds = queueIds)
    this.inewsClient.subscribeToConnectionState(connectionState => this.connectionStateEmitter.emitConnectionState(connectionState))
    await this.inewsClient.connect().catch(error => this.logger.data(error).error(`Failed connecting to iNews server. Reconnect attempt in ${this.pollingIntervalInMs}ms.`))
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
      this.logger.debug(`${queueId} has ${changedStories.length} changed stories`)
    }
    const diff: [number, number] = process.hrtime(startTime)
    this.logger.debug(`Pulling all queues took ${diff[0] * 1000 + diff[1] / 1_000_000}ms.`)
  }

  private storyMetadataCache: Record<string, InewsStoryMetadata> = {}

  private async fetchChangedStoriesForQueue(queueId: string): Promise<readonly InewsStory[]> {
    const storyMetadataCollection: readonly InewsStoryMetadata[] = await this.inewsClient.getStoryMetadataForQueue(queueId)
    let changedInewsStories: InewsStory[] = []
    for (const storyMetadata of storyMetadataCollection) {
      if (storyMetadata.locator !== this.storyMetadataCache[storyMetadata.id]?.locator) {
        changedInewsStories.push(await this.inewsClient.getStory(queueId, storyMetadata.id))
        this.storyMetadataCache[storyMetadata.id] = storyMetadata
      }
    }
    return changedInewsStories
  }

  private clearPollingTimer(): void {
    if (!this.pollingTimer) {
      return
    }
    clearTimeout(this.pollingTimer)
    delete this.pollingTimer
  }

  public async stop(): Promise<void> {
    await this.inewsClient.disconnect()
  }
}
