import { ClientConfiguration } from '../value-objects/client-configuration'
import { Logger } from '../../logger/logger'
import { IngestEvent } from '../value-objects/ingest-event'
import { ClientConnectionServer } from '../interfaces/client-connection-server'
import { EventServer } from '../interfaces/event-server'
import { TypedEvent } from '../value-objects/typed-event'
import { InewsQueuePoolEmitter } from '../../business-logic/interfaces/inews-queue-pool-emitter'
import { ConnectionStatus } from '../../data-access/enums/connection-status'
import { ConnectionStateEvent } from '../value-objects/connection-state-event'
import { ConnectionStateEventType } from '../enums/connection-state-event-type'
import { InewsQueueObserver } from '../../business-logic/interfaces/inews-queue-observer'
import { ConnectionStateObserver } from '../../business-logic/interfaces/connection-state-observer'
import { ConnectionStateEventBuilder } from '../interfaces/connection-state-event-builder'
import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { InewsQueueRepository } from '../../business-logic/interfaces/inews-queue-repository'
import { InewsQueue } from '../../business-logic/entities/inews-queue'

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
    private readonly connectionStateObserver: ConnectionStateObserver,
    private readonly connectionStateEventBuilder: ConnectionStateEventBuilder,
    private readonly inewsQueueObserver: InewsQueueObserver,
    private readonly ingestEventBuilder: IngestEventBuilder,
    private readonly inewsQueuePoolEmitter: InewsQueuePoolEmitter,
    private readonly inewsQueueRepository: InewsQueueRepository,
    logger: Logger,
  ) {
    this.logger = logger.tag(this.constructor.name)
    this.inewsQueueObserver.subscribeToCreatedInewsStories(inewsStory => this.sendIngestEvent(this.ingestEventBuilder.buildInewsStoryCreatedEvent(inewsStory)))
    this.inewsQueueObserver.subscribeToChangedInewsStories(inewsStory => this.sendIngestEvent(this.ingestEventBuilder.buildInewsStoryChangedEvent(inewsStory)))
    this.inewsQueueObserver.subscribeToMovedInewsStories(inewsStory => this.sendIngestEvent(this.ingestEventBuilder.buildInewsStoryMovedEvent(inewsStory)))
    this.inewsQueueObserver.subscribeToDeletedInewsStories((queueId: string, inewsStoryId: string) => this.sendIngestEvent(this.ingestEventBuilder.buildInewsStoryDeletedEvent(queueId, inewsStoryId)))
    this.connectionStateObserver.subscribeToConnectionState((connectionState) => {
      this.lastConnectionStateEvent = this.connectionStateEventBuilder.buildConnectionStateEvent(connectionState)
      this.broadcastTypedEvent(this.lastConnectionStateEvent)
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
    this.sendQueueStatesToClient(clientId, clientConfiguration.queueIds)
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

  private sendQueueStatesToClient(clientId: string, queueIds: string[]): void {
    queueIds.forEach(queueId => this.sendQueueStateToClient(clientId, queueId))
  }

  private sendQueueStateToClient(clientId: string, queueId: string): void {
    try {
      const queue: InewsQueue = this.inewsQueueRepository.getInewsQueue(queueId)
      const event: IngestEvent = this.ingestEventBuilder.buildInewsQueueEvent(queue)
      this.sendTypedEventToClient(clientId, event)
    } catch {}
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
