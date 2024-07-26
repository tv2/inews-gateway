import { ConnectionState } from '../../data-access/value-objects/connection-state'

export interface ConnectionStateEmitter {
  emitConnectionState(connectionState: ConnectionState): void
}
