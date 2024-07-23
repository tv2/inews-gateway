import { ClientConfiguration } from '../value-objects/client-configuration'
import { Logger } from '../../logger/logger'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { IngestEvent } from '../value-objects/ingest-event'
import { ClientConnectionServer } from '../interfaces/client-connection-server'
import { EventServer } from '../interfaces/event-server'
import { ConnectionStateEventObserver } from '../interfaces/connection-state-event-observer'
import { TypedEvent } from '../value-objects/typed-event'
import { InewsQueuePoolEmitter } from '../../business-logic/interfaces/inews-queue-pool-emitter'
import { ConnectionStatus } from '../../data-access/enums/connection-status'
import { ConnectionStateEvent } from '../value-objects/connection-state-event'
import { ConnectionStateEventType } from '../enums/connection-state-event-type'

export class ClientEventServer implements EventServer {
  private lastConnectionStateEvent: ConnectionStateEvent = {
    type: ConnectionStateEventType.CONNECTION_STATE_UPDATED,
    status: ConnectionStatus.DISCONNECTED,
    message: 'Unknown reason.',
  }

  private readonly queueSubscriptions: Map<string, Set<string>> = new Map()
  private readonly logger: Logger

  public constructor(
    private readonly clientConnectionServer: ClientConnectionServer,
    private readonly ingestEventObserver: IngestEventObserver,
    private readonly connectionStateEventObserver: ConnectionStateEventObserver,
    private readonly inewsQueuePoolEmitter: InewsQueuePoolEmitter,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
    this.ingestEventObserver.subscribeToIngestEvents(ingestEvent => this.sendIngestEvent(ingestEvent))
    this.connectionStateEventObserver.subscribeToConnectionStateEvents((connectionStateEvent) => {
      this.lastConnectionStateEvent = connectionStateEvent
      this.broadcastTypedEvent(connectionStateEvent)
    })
  }

  private sendIngestEvent(ingestEvent: IngestEvent): void {
    const serializedIngestEvent: string = JSON.stringify(ingestEvent)
    this.queueSubscriptions
      .get(ingestEvent.queueId)
      ?.forEach(clientId => this.clientConnectionServer.sendMessageToClient(clientId, serializedIngestEvent))
  }

  private broadcastTypedEvent(event: TypedEvent): void {
    this.clientConnectionServer.broadcastMessageToAllClients(JSON.stringify(event))
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
    this.logger.data(this.getInewsQueuePool()).debug(`${this.queueSubscriptions.size} queue(s) are registered.`)
    this.emitInewsQueuePool()
    this.sendTypedEventToClient(clientId, this.lastConnectionStateEvent)
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

  private emitInewsQueuePool(): void {
    this.inewsQueuePoolEmitter.emitQueuePool(this.getInewsQueuePool())
  }

  private getInewsQueuePool(): string[] {
    return Array.from(this.queueSubscriptions.keys())
  }

  private sendTypedEventToClient(clientId: string, typedEvent: TypedEvent): void {
    this.clientConnectionServer.sendMessageToClient(clientId, JSON.stringify(typedEvent))
  }

  private deregisterClient(clientId: string): void {
    this.queueSubscriptions.forEach((clientIds: Set<string>, queueId: string) => {
      clientIds.delete(clientId)
      if (clientIds.size === 0) {
        this.queueSubscriptions.delete(queueId)
      }
    })
    this.logger.data(this.getInewsQueuePool()).debug(`Client with client id '${clientId}' disconnected. ${this.queueSubscriptions.size} queue(s) are still registered.`)
    this.emitInewsQueuePool()
  }

  public stop(): void {
    this.clientConnectionServer.stop()
  }
}
