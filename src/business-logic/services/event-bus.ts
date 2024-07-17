import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { ConnectionStateObserver } from '../interfaces/connection-state-observer'
import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { EventEmitter } from 'node:events'

export class EventBus implements ConnectionStateEmitter, ConnectionStateObserver {
  private readonly eventEmitter: EventEmitter<{
    connectionStateEvent: [ConnectionState]
  }> = new EventEmitter()

  public emitConnectionState(connectionState: ConnectionState): void {
    this.eventEmitter.emit('connectionStateEvent', connectionState)
  }

  public subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void {
    this.eventEmitter.on('connectionStateEvent', onConnectionStateChangedCallback)
  }
}
