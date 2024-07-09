import { IngestEventEmitter } from './presentation/interfaces/ingest-event-emitter'
import { IngestEventServer } from './presentation/services/ingest-event-server'
import { QueuePoolObserver } from './presentation/emitters/queue-pool-observer'

export interface InewsGatewayServerConfiguration {
  ingestEventServerPort: number
}

export class InewsGatewayServer {
  private queuePool: Set<string> = new Set()

  public constructor(
    private readonly ingestEventServer: IngestEventServer,
    private readonly ingestEventEmitter: IngestEventEmitter,
    private readonly queuePoolObserver: QueuePoolObserver,
  ) {}

  public async start(configuration: InewsGatewayServerConfiguration): Promise<void> {
    await this.ingestEventServer.start(configuration.ingestEventServerPort)

    this.queuePoolObserver.subscribeToQueuePoolChanges(queuePool => this.queuePool = queuePool)
    setInterval(
      () => this.queuePool.forEach(queueId => this.ingestEventEmitter.emitTestEvent(queueId)),
      5_000,
    )
  }
}
