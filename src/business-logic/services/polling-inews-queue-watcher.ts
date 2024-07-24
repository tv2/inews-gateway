import { InewsQueueWatcher } from '../interfaces/inews-queue-watcher'
import { InewsClient } from '../interfaces/inews-client'
import { Logger } from '../../logger/logger'
import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { InewsQueuePoolObserver } from '../interfaces/inews-queue-pool-observer'
import { InewsStory } from '../entities/inews-story'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { InewsQueueEmitter } from '../interfaces/inews-queue-emitter'
import { InewsQueueDiffer } from '../interfaces/inews-queue-differ'

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
    private readonly inewsQueueDiffer: InewsQueueDiffer,
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
    this.checkAndProcessQueues()
      .catch(error => this.logger.data(error).warn('Failed polling data.'))
      .finally(() => this.pollingTimer = setTimeout(() => this.schedulePolling(), this.pollingIntervalInMs))
  }

  private async checkAndProcessQueues(): Promise<void> {
    const startTime: bigint = process.hrtime.bigint()
    for (const queueId of this.queueIds) {
      try {
        await this.checkAndProcessQueue(queueId)
      } catch (error) {
        this.logger.data(error).error(`Failed getting updates for queue ${queueId}.`)
      }
    }
    const diff: bigint = process.hrtime.bigint() - startTime
    this.logger.debug(`Pulling changes for ${this.queueIds.length} queues took ${Number(diff) / 1_000_000}ms.`)
  }

  private readonly storyCache: Record<string, InewsStory> = {}

  private async checkAndProcessQueue(queueId: string): Promise<void> {
    const storyMetadataSequence: readonly InewsStoryMetadata[] = await this.getStoryMetadataSequence(queueId)

    const metadataForNewStories: readonly InewsStoryMetadata[] = this.inewsQueueDiffer.getMetadataForUncachedStories(storyMetadataSequence, this.storyCache)
    const metadataForChangedStories: readonly InewsStoryMetadata[] = this.inewsQueueDiffer.getMetadataForStoriesWithChangedContent(storyMetadataSequence, this.storyCache)
    const metadataForMovedStories: readonly InewsStoryMetadata[] = this.inewsQueueDiffer.getMetadataForMovedStories(storyMetadataSequence, this.storyCache)
    const deletedStoryIds: readonly string[] = this.inewsQueueDiffer.getDeletedStoryIds(storyMetadataSequence, this.storyCache)

    const newStories: readonly InewsStory[] = await this.getStories(queueId, metadataForNewStories)
    const changedStories: readonly InewsStory[] = await this.getStories(queueId, metadataForChangedStories)
    const movedStories: readonly InewsStory[] = metadataForMovedStories.map(storyMetadata => this.getMovedStory(storyMetadata))

    // TODO: compute ranks (remember that changed stories can also have been moved).
    deletedStoryIds.forEach(storyId => this.inewsQueueEmitter.emitDeletedInewsStory(queueId, storyId))
    changedStories.forEach(story => this.inewsQueueEmitter.emitChangedInewsStory(story))
    newStories.forEach(story => this.inewsQueueEmitter.emitCreatedInewsStory(story))
    movedStories.forEach(story => this.inewsQueueEmitter.emitMovedInewsStory(story))

    // TODO: Remove this log statement
    if (deletedStoryIds.length > 0 || changedStories.length > 0 || newStories.length > 0 || movedStories.length > 0) {
      this.logger.data({
        newStoryIds: metadataForNewStories.map(storyMetadata => storyMetadata.id),
        changedStoryIds: metadataForChangedStories.map(storyMetadata => storyMetadata.id),
        movedStoryIds: metadataForMovedStories.map(storyMetadata => storyMetadata.id),
        deletedStoryIds,
      }).debug('Emitted events for:')
    }

    // TODO: Update cache through a repository
    deletedStoryIds.forEach(storyId => delete this.storyCache[storyId])
    newStories.concat(changedStories).concat(movedStories)
      .forEach(story => this.storyCache[story.id] = story)
  }

  private getStoryMetadataSequence(queueId: string): Promise<readonly InewsStoryMetadata[]> {
    return this.inewsClient.getStoryMetadataForQueue(queueId)
  }

  private async getStories(queueId: string, storyMetadataCollection: readonly InewsStoryMetadata[]): Promise<readonly InewsStory[]> {
    let stories: InewsStory[] = []
    for (const storyMetadata of storyMetadataCollection) {
      stories.push(await this.inewsClient.getStory(queueId, { ...storyMetadata, storyId: storyMetadata.id }))
    }
    return stories
  }

  private getMovedStory(storyMetadata: InewsStoryMetadata): InewsStory {
    const cachedStory: InewsStory | undefined = this.storyCache[storyMetadata.id]
    if (!cachedStory) {
      throw new Error(`Uncached story with '${storyMetadata.id}' cannot be treated as a moved story.`)
    }
    return {
      ...cachedStory,
      contentLocator: storyMetadata.contentLocator,
      versionLocator: storyMetadata.versionLocator,
    }
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
