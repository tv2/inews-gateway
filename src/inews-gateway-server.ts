import { IngestEventEmitter } from './presentation/interfaces/ingest-event-emitter'
import { IngestEventServer } from './presentation/services/ingest-event-server'

export class InewsGatewayServer {
  public constructor(
    private readonly ingestEventServer: IngestEventServer,
    private readonly ingestEventEmitter: IngestEventEmitter,
  ) {}

  public async startEventServer(eventServerPort: number): Promise<void> {
    await this.ingestEventServer.startServer(eventServerPort)
    setInterval(() => this.ingestEventEmitter.emitTestEvent(), 5_000)
    setTimeout(() => this.ingestEventServer.stopServer(), 30_000)
  }
}
