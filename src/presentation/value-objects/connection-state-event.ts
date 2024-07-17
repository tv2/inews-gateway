import { TypedEvent } from './typed-event'
import { ConnectionStateEventType } from '../enums/connection-state-event-type'
import { ConnectionStatus } from '../../data-access/enums/connection-status'

export type ConnectionStateEvent =
  | ConnectingConnectionStateEvent
  | ConnectedConnectionStateEvent
  | DisconnectedConnectionStateEvent

export interface ConnectingConnectionStateEvent extends TypedEvent<ConnectionStateEventType.CONNECTION_STATE_UPDATED> {
  status: ConnectionStatus.CONNECTING
}

export interface ConnectedConnectionStateEvent extends TypedEvent<ConnectionStateEventType.CONNECTION_STATE_UPDATED> {
  status: ConnectionStatus.CONNECTED
}

export interface DisconnectedConnectionStateEvent extends TypedEvent<ConnectionStateEventType.CONNECTION_STATE_UPDATED> {
  status: ConnectionStatus.DISCONNECTED
  message: string
}
