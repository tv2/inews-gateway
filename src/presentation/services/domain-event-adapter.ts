import { ConnectionStateEventObserver } from '../interfaces/connection-state-event-observer'
import { ConnectionStateEvent } from '../value-objects/connection-state-event'
import { ConnectionStateObserver } from '../../business-logic/interfaces/connection-state-observer'
import { ConnectionStateEventBuilder } from '../interfaces/connection-state-event-builder'

export class DomainEventAdapter implements ConnectionStateEventObserver {
  private readonly onConnectionStateEventCallbacks: ((connectionStateEvent: ConnectionStateEvent) => void)[] = []

  public constructor(
    private readonly connectionStateObserver: ConnectionStateObserver,
    private readonly connectionStateEventBuilder: ConnectionStateEventBuilder,
  ) {
    this.connectionStateObserver.subscribeToConnectionState((connectionState) => {
      const event: ConnectionStateEvent = this.connectionStateEventBuilder.buildConnectionStateEvent(connectionState)
      this.onConnectionStateEventCallbacks.forEach(callback => callback(event))
    })
  }

  public subscribeToConnectionStateEvents(onConnectionStateEventCallback: (connectionStateEvent: ConnectionStateEvent) => void): void {
    this.onConnectionStateEventCallbacks.push(onConnectionStateEventCallback)
  }
}
