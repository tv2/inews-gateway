import { IngestEventServer } from './presentation/services/ingest-event-server'

export interface InewsGatewayServerConfiguration {
  ingestEventServerPort: number
}

export class InewsGatewayServer {
  public constructor(
    private readonly ingestEventServer: IngestEventServer,
  ) {}

  public async start(configuration: InewsGatewayServerConfiguration): Promise<void> {
    await this.ingestEventServer.start(configuration.ingestEventServerPort)
  }
}
