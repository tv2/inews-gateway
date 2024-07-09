import { IngestEventEmitter } from './presentation/interfaces/ingest-event-emitter'
import { IngestEventServer } from './presentation/services/ingest-event-server'

export interface InewsGatewayServerConfiguration {
  ingestEventServerPort: number
}

export class InewsGatewayServer {
  public constructor(
    private readonly ingestEventServer: IngestEventServer,
    private readonly ingestEventEmitter: IngestEventEmitter,
  ) {}

  public async start(configuration: InewsGatewayServerConfiguration): Promise<void> {
    await this.ingestEventServer.start(configuration.ingestEventServerPort)
    setInterval(() => this.ingestEventEmitter.emitTestEvent(), 5_000)
  }
}
