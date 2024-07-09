import { ClientConfiguration } from '../value-objects/client-configuration'
import { Logger } from '../../logger/logger'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { IngestEvent } from '../value-objects/ingest-event'
import { ClientConnectionServer } from '../interfaces/client-connection-server'

export class IngestEventServer {
  private readonly queueSubscriptions: Map<string, Set<string>> = new Map()
  private readonly logger: Logger

  public constructor(
    private readonly clientConnector: ClientConnectionServer,
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
      ?.forEach(sessionId => this.clientConnector.sendTo(sessionId, serializedIngestEvent))
  }

  public async start(port: number): Promise<void> {
    this.clientConnector.onConnectedClient(this.registerClient.bind(this))
    this.clientConnector.onDisconnectedClient(this.deregisterClient.bind(this))
    await this.clientConnector.start(port)
  }

  private registerClient(sessionId: string, options: Record<string, unknown>): void {
    const clientConfiguration: ClientConfiguration = this.getClientConfiguration(options)
    this.registerClientToQueues(sessionId, clientConfiguration.queueIds)
    this.logger.data(clientConfiguration).debug(`Client with session id '${sessionId}' is registered with ${clientConfiguration.queueIds.length} queue(s).`)
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

  private registerClientToQueues(sessionId: string, queueIds: string[]): void {
    queueIds.forEach(queueId => this.registerClientToQueue(sessionId, queueId))
  }

  private registerClientToQueue(sessionId: string, queueId: string): void {
    const sessionIds: Set<string> = this.queueSubscriptions.get(queueId) ?? new Set()
    sessionIds.add(sessionId)
    this.queueSubscriptions.set(queueId, sessionIds)
  }

  private deregisterClient(sessionId: string): void {
    this.queueSubscriptions.forEach((sessionIds: Set<string>, queueId: string) => {
      sessionIds.delete(sessionId)
      if (sessionIds.size === 0) {
        this.queueSubscriptions.delete(queueId)
      }
    })
    this.logger.data([...this.queueSubscriptions.keys()]).debug(`Client with session id '${sessionId}' disconnected. ${this.queueSubscriptions.size} queue(s) are still registered.`)
  }

  public stopServer(): void {
    this.clientConnector.stop()
  }
}
