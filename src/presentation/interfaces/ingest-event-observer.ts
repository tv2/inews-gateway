import { IngestEvent } from '../value-objects/ingest-event'

export interface IngestEventObserver {
  subscribeToIngestEvents(onIngestEventCallback: (ingestEvent: IngestEvent) => void): void
}
