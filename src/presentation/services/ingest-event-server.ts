import { ClientConfiguration } from '../value-objects/client-configuration'
import { Logger } from '../../logger/logger'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { IngestEvent } from '../value-objects/ingest-event'
import { ClientConnectionServer } from '../interfaces/client-connection-server'

export class IngestEventServer {
  private readonly queueSubscriptions: Map<string, Set<string>> = new Map()
  private readonly logger: Logger

  public constructor(
    private readonly clientConnectionServer: ClientConnectionServer,
    private readonly ingestEventObserver: IngestEventObserver,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
    this.ingestEventObserver.subscribeToIngestEvents(ingestEvent => this.sendIngestEvent(ingestEvent))
  }

  private sendIngestEvent(ingestEvent: IngestEvent): void {
    const serializedIngestEvent: string = JSON.stringify(ingestEvent)
    this.queueSubscriptions
      .get(ingestEvent.queueId)
      ?.forEach(clientId => this.clientConnectionServer.sendMessageToClient(clientId, serializedIngestEvent))
  }

  public async start(port: number): Promise<void> {
    this.clientConnectionServer.onConnectedClient(this.registerClient.bind(this))
    this.clientConnectionServer.onDisconnectedClient(this.deregisterClient.bind(this))
    await this.clientConnectionServer.start(port)
  }

  private registerClient(clientId: string, options: Record<string, unknown>): void {
    const clientConfiguration: ClientConfiguration = this.getClientConfiguration(options)
    this.registerClientToQueues(clientId, clientConfiguration.queueIds)
    this.logger.data(clientConfiguration).debug(`Client with client id '${clientId}' is registered with ${clientConfiguration.queueIds.length} queue(s).`)
    this.logger.data([...this.queueSubscriptions.keys()]).debug(`${this.queueSubscriptions.size} queue(s) are registered.`)
  }

  private getClientConfiguration(options: Record<string, unknown>): ClientConfiguration {
    const queueIdsText: unknown = options.queues
    if (!this.isString(queueIdsText)) {
      throw new Error(`Expected the parameter 'queue' to be a comma-separated list of queue names, but received '${queueIdsText}'.`)
    }
    return {
      queueIds: queueIdsText.split(','),
    }
  }

  private isString(text: unknown): text is string {
    return typeof text === 'string'
  }

  private registerClientToQueues(clientId: string, queueIds: string[]): void {
    queueIds.forEach(queueId => this.registerClientToQueue(clientId, queueId))
  }

  private registerClientToQueue(clientId: string, queueId: string): void {
    const clientIds: Set<string> = this.queueSubscriptions.get(queueId) ?? new Set()
    clientIds.add(clientId)
    this.queueSubscriptions.set(queueId, clientIds)
  }

  private deregisterClient(clientId: string): void {
    this.queueSubscriptions.forEach((clientIds: Set<string>, queueId: string) => {
      clientIds.delete(clientId)
      if (clientIds.size === 0) {
        this.queueSubscriptions.delete(queueId)
      }
    })
    this.logger.data([...this.queueSubscriptions.keys()]).debug(`Client with client id '${clientId}' disconnected. ${this.queueSubscriptions.size} queue(s) are still registered.`)
  }

  public stopServer(): void {
    this.clientConnectionServer.stop()
  }
}
