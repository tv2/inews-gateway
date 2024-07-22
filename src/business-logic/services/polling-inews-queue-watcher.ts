import { InewsQueueWatcher } from '../interfaces/inews-queue-watcher'
import { InewsClient } from '../interfaces/inews-client'
import { Logger } from '../../logger/logger'
import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { InewsQueuePoolObserver } from '../interfaces/inews-queue-pool-observer'

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
    for (const queueId of this.queueIds) {
      const storyId: string | undefined = (await this.inewsClient.getStoryMetadataForQueue(queueId))[0]?.id
      if (!storyId) {
        continue
      }
      console.log(JSON.stringify(await this.inewsClient.getStory(queueId, storyId), null, 4))
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
