import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { ConnectionStateObserver } from '../interfaces/connection-state-observer'
import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { EventEmitter } from 'node:events'
import { InewsQueuePoolEmitter } from '../interfaces/inews-queue-pool-emitter'
import { InewsQueuePoolObserver } from '../interfaces/inews-queue-pool-observer'

export class EventBus implements ConnectionStateEmitter, ConnectionStateObserver, InewsQueuePoolEmitter, InewsQueuePoolObserver {
  private readonly eventEmitter: EventEmitter<{
    connectionStateEvent: [ConnectionState]
    inewsQueuePoolChangeEvent: [readonly string[]]
  }> = new EventEmitter()

  public emitConnectionState(connectionState: ConnectionState): void {
    this.eventEmitter.emit('connectionStateEvent', connectionState)
  }

  public subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void {
    this.eventEmitter.on('connectionStateEvent', onConnectionStateChangedCallback)
  }

  public emitQueuePool(queueIds: readonly string[]): void {
    this.eventEmitter.emit('inewsQueuePoolChangeEvent', queueIds)
  }

  public subscribeToQueuePoolChanges(onQueuePoolChangedCallback: (queueIds: readonly string[]) => void): void {
    this.eventEmitter.on('inewsQueuePoolChangeEvent', onQueuePoolChangedCallback)
  }
}
