import { IngestEventEmitter } from '../interfaces/ingest-event-emitter'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { IngestEvent } from '../value-objects/ingest-event'

export type IngestEventCallback = (ingest: IngestEvent) => void

export class IngestEventService implements IngestEventEmitter, IngestEventObserver {
  public static instance: IngestEventService

  public static getInstance(ingestEventBuilder: IngestEventBuilder): IngestEventService {
    if (!this.instance) {
      this.instance = new IngestEventService(ingestEventBuilder)
    }
    return this.instance
  }

  private readonly callbacks: IngestEventCallback[] = []

  private constructor(private readonly ingestEventBuilder: IngestEventBuilder) {}

  public emitTestEvent(): void {
    const event: IngestEvent = this.ingestEventBuilder.buildTestEvent('MY.TEST.QUEUE')
    this.emitIngestEvent(event)
  }

  private emitIngestEvent(ingestEvent: IngestEvent): void {
    this.callbacks.forEach(callback => callback(ingestEvent))
  }

  public subscribeToIngestEvents(onIngestEventCallback: IngestEventCallback): void {
    this.callbacks.push(onIngestEventCallback)
  }
}
