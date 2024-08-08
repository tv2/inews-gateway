import { InewsQueueWatcher } from '../interfaces/inews-queue-watcher'
import { InewsClient } from '../interfaces/inews-client'
import { Logger } from '../../logger/logger'
import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { InewsQueuePoolObserver } from '../interfaces/inews-queue-pool-observer'
import { InewsStory } from '../entities/inews-story'
import { InewsStoryMetadata } from '../value-objects/inews-story-metadata'
import { InewsQueueEmitter } from '../interfaces/inews-queue-emitter'
import { InewsQueueDiffer } from '../interfaces/inews-queue-differ'
import { InewsQueueRepository } from '../interfaces/inews-queue-repository'
import { InewsQueue } from '../entities/inews-queue'
import { InewsStoryRankResolver } from '../interfaces/inews-story-rank-resolver'

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
    private readonly inewsQueueRepository: InewsQueueRepository,
    private readonly inewsStoryRankResolver: InewsStoryRankResolver,
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

  private async checkAndProcessQueue(queueId: string): Promise<void> {
    const inewsQueue: InewsQueue = this.getInewsQueue(queueId)
    const cachedStories: ReadonlyMap<string, InewsStory> = new Map(inewsQueue.stories.map(story => [story.id, story]))
    const storyMetadataSequence: readonly InewsStoryMetadata[] = await this.getStoryMetadataSequence(queueId)

    // Categorize
    const metadataForNewStories: readonly InewsStoryMetadata[] = this.inewsQueueDiffer.getMetadataForUncachedStories(storyMetadataSequence, cachedStories)
    const metadataForChangedStories: readonly InewsStoryMetadata[] = this.inewsQueueDiffer.getMetadataForStoriesWithChangedContent(storyMetadataSequence, cachedStories)
    const metadataForMovedStories: readonly InewsStoryMetadata[] = this.inewsQueueDiffer.getMetadataForMovedStories(storyMetadataSequence, cachedStories)
    const deletedStoryIds: readonly string[] = this.inewsQueueDiffer.getDeletedStoryIds(storyMetadataSequence, cachedStories)

    if (deletedStoryIds.length === 0 && metadataForNewStories.length === 0 && metadataForChangedStories.length === 0 && metadataForMovedStories.length === 0) {
      return
    }

    // Compute ranks
    const updatedRanks: ReadonlyMap<string, number> = this.inewsStoryRankResolver.getInewsStoryRanks(storyMetadataSequence, cachedStories)

    // Get stories with updated ranks
    const newStories: readonly InewsStory[] = (await this.getStories(queueId, metadataForNewStories)).map(story => ({ ...story, rank: updatedRanks.get(story.id) ?? 0 }))
    const changedStories: readonly InewsStory[] = (await this.getStories(queueId, metadataForChangedStories)).map(story => ({ ...story, rank: updatedRanks.get(story.id) ?? 0 }))
    const movedStories: readonly InewsStory[] = metadataForMovedStories.map(storyMetadata => this.getInewsStoryWithUpdatedLocators(storyMetadata, cachedStories)).map(story => ({ ...story, rank: updatedRanks.get(story.id) ?? 0 }))
    const alteredAndDeletedStoryIds: ReadonlySet<string> = new Set(newStories.concat(changedStories).concat(movedStories).map(story => story.id).concat(deletedStoryIds))
    const onlyRankUpdatedStories: readonly InewsStory[] = this.getStoriesAffectedByUpdatedRanks(cachedStories, updatedRanks, alteredAndDeletedStoryIds).map(story => ({ ...story, rank: updatedRanks.get(story.id) ?? 0 }))

    // Emit data
    deletedStoryIds.forEach(storyId => this.inewsQueueEmitter.emitDeletedInewsStory(queueId, storyId))
    changedStories.forEach(story => this.inewsQueueEmitter.emitChangedInewsStory(story))
    newStories.forEach(story => this.inewsQueueEmitter.emitCreatedInewsStory(story))
    movedStories.forEach(story => this.inewsQueueEmitter.emitMovedInewsStory(story))
    onlyRankUpdatedStories.forEach(story => this.inewsQueueEmitter.emitMovedInewsStory(story))

    // Persist iNews queue
    const alteredStories: Record<string, InewsStory> = Object.fromEntries(newStories.concat(changedStories).concat(movedStories).concat(onlyRankUpdatedStories).map(story => [story.id, story]))
    this.inewsQueueRepository.setInewsQueue({
      ...inewsQueue,
      stories: storyMetadataSequence.map(storyMetadata => alteredStories[storyMetadata.id] ?? cachedStories.get(storyMetadata.id)!),
    })
  }

  private getInewsQueue(inewsQueueId: string): InewsQueue {
    try {
      return this.inewsQueueRepository.getInewsQueue(inewsQueueId)
    } catch {
      return {
        id: inewsQueueId,
        stories: [],
      }
    }
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

  private getInewsStoryWithUpdatedLocators(storyMetadata: InewsStoryMetadata, storyCache: ReadonlyMap<string, InewsStory>): InewsStory {
    const cachedStory: InewsStory | undefined = storyCache.get(storyMetadata.id)
    if (!cachedStory) {
      throw new Error(`Uncached story with '${storyMetadata.id}' cannot be treated as a moved story.`)
    }
    return {
      ...cachedStory,
      contentLocator: storyMetadata.contentLocator,
      versionLocator: storyMetadata.versionLocator,
    }
  }

  private getStoriesAffectedByUpdatedRanks(storyCache: ReadonlyMap<string, InewsStory>, ranks: ReadonlyMap<string, number>, alteredStoryIds: ReadonlySet<string>): readonly InewsStory[] {
    return Array.from(storyCache.values()).filter(story => !alteredStoryIds.has(story.id) && ranks.get(story.id) && ranks.get(story.id) !== story.rank)
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
    await this.inewsClient.disconnect('Stopped polling iNews queue data.')
  }
}
