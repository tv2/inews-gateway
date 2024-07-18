export interface InewsQueuePoolEmitter {
  emitQueuePool(queueIds: readonly string[]): void
}
