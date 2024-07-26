import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { ConnectionStateEvent } from '../value-objects/connection-state-event'

export interface ConnectionStateEventBuilder {
  buildConnectionStateEvent(connectionState: ConnectionState): ConnectionStateEvent
}
