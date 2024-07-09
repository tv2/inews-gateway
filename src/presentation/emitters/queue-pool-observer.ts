type QueuePoolChangedCallback = (queueIds: Set<string>) => void

export class QueuePoolObserver {
  private static instance: QueuePoolObserver

  public static getInstance(): QueuePoolObserver {
    this.instance ??= new QueuePoolObserver()
    return this.instance
  }

  private readonly onQueuePoolChangedCallbacks: QueuePoolChangedCallback[] = []

  public subscribeToQueuePoolChanges(onQueuePoolChangedCallback: QueuePoolChangedCallback): void {
    this.onQueuePoolChangedCallbacks.push(onQueuePoolChangedCallback)
  }

  public emitQueuePool(queuePool: Set<string>): void {
    this.onQueuePoolChangedCallbacks.forEach(callback => callback(queuePool))
  }
}
