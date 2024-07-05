import { IngestEventEmitter } from '../interfaces/ingest-event-emitter'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { IngestEventBuilder } from '../interfaces/ingest-event-builder'
import { IngestEvent } from '../value-objects/ingest-event'

export class IngestEventService implements IngestEventEmitter, IngestEventObserver {
  public static instance: IngestEventService

  public static getInstance(ingestEventBuilder: IngestEventBuilder): IngestEventService {
    if (!this.instance) {
      this.instance = new IngestEventService(ingestEventBuilder)
    }
    return this.instance
  }

  private readonly callbacks: ((ingestEvent: IngestEvent) => void)[] = []

  private constructor(private readonly ingestEventBuilder: IngestEventBuilder) {}

  private emitIngestEvent(ingestEvent: IngestEvent): void {
    this.callbacks.forEach(callback => callback(ingestEvent))
  }

  public emitTestEvent(): void {
    const event: IngestEvent = this.ingestEventBuilder.buildTestEvent()
    this.emitIngestEvent(event)
  }

  public subscribeToIngestEvents(onIngestEventCallback: (ingestEvent: IngestEvent) => void): void {
    this.callbacks.push(onIngestEventCallback)
  }
}
