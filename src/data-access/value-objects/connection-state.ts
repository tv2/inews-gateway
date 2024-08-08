import { ConnectionStatus } from '../enums/connection-status'

export type ConnectionState =
  | ConnectedConnectionState
  | DisconnectedConnectionState

export interface ConnectedConnectionState {
  readonly status: ConnectionStatus.CONNECTED
}

export interface DisconnectedConnectionState {
  readonly status: ConnectionStatus.DISCONNECTED
  readonly message: string
}
