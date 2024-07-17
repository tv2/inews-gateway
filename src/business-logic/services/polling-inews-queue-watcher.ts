import { InewsQueueWatcher } from '../interfaces/inews-queue-watcher'
import { InewsClient } from '../interfaces/inews-client'
import { Logger } from '../../logger/logger'
import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'

const POLLING_INTERVAL_IN_MS: number = 5000

export class PollingInewsQueueWatcher implements InewsQueueWatcher {
  private pollingTimer?: NodeJS.Timeout
  private readonly logger: Logger

  public constructor(
    private readonly inewsClient: InewsClient,
    private readonly connectionStateEmitter: ConnectionStateEmitter,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
  }

  public async start(): Promise<void> {
    this.inewsClient.subscribeToConnectionState(connectionState => this.connectionStateEmitter.emitConnectionState(connectionState))
    await this.inewsClient.connect().catch(error => this.logger.data(error).error(`Failed connecting to iNews server. Reconnect attempt in ${POLLING_INTERVAL_IN_MS}ms.`))
    this.schedulePolling()
  }

  private schedulePolling(): void {
    this.clearPollingTimer()
    this.pollData()
      .catch(error => this.logger.data(error).warn('Failed polling data.'))
      .finally(() => this.pollingTimer = setTimeout(() => this.schedulePolling(), POLLING_INTERVAL_IN_MS))
  }

  private async pollData(): Promise<void> {
    return Promise.resolve()
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
