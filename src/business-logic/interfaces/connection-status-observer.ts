import { ConnectionStatus } from '../../data-access/enums/connection-status'

export type ConnectionStatusCallback = (connectionStatus: ConnectionStatus) => void

export interface ConnectionStatusObserver {
  subscribeToConnectionStatus(onStatusChangedCallback: ConnectionStatusCallback): void
  emitConnectionStatus(connectionStatus: ConnectionStatus): void
}
