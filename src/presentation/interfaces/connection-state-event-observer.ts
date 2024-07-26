import { ConnectionStateEvent } from '../value-objects/connection-state-event'

export interface ConnectionStateEventObserver {
  subscribeToConnectionStateEvents(onConnectionStateEventCallback: (connectionStateEvent: ConnectionStateEvent) => void): void
}
