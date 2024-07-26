import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { IngestEvent } from '../value-objects/ingest-event'
import { IngestEventType } from '../enums/ingest-event-type'
import { ConnectionStateEventBuilder } from '../interfaces/connection-state-event-builder'
import { ConnectionStateEvent } from '../value-objects/connection-state-event'
import { ConnectionStateEventType } from '../enums/connection-state-event-type'
import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { ConnectionStatus } from '../../data-access/enums/connection-status'

export class EventBuilder implements IngestEventBuilder, ConnectionStateEventBuilder {
  public buildTestEvent(queueId: string): IngestEvent {
    return {
      type: IngestEventType.TEST_EVENT,
      queueId,
    }
  }

  public buildConnectionStateEvent(connectionState: ConnectionState): ConnectionStateEvent {
    if (connectionState.status == ConnectionStatus.DISCONNECTED) {
      return {
        type: ConnectionStateEventType.CONNECTION_STATE_UPDATED,
        status: connectionState.status,
        message: connectionState.message,
      }
    }

    return {
      type: ConnectionStateEventType.CONNECTION_STATE_UPDATED,
      status: connectionState.status,
    }
  }
}
