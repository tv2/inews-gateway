import { ConnectionStatus } from '../enums/connection-status'

export type ConnectionState =
  | ConnectingConnectionState
  | ConnectedConnectionState
  | DisconnectedConnectionState

export interface ConnectingConnectionState {
  readonly status: ConnectionStatus.CONNECTING
}

export interface ConnectedConnectionState {
  readonly status: ConnectionStatus.CONNECTED
}

export interface DisconnectedConnectionState {
  readonly status: ConnectionStatus.DISCONNECTED
  readonly message: string
}
