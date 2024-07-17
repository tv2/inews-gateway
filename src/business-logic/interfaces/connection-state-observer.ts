import { ConnectionState } from '../../data-access/value-objects/connection-state'

export interface ConnectionStateObserver {
  subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void
}
