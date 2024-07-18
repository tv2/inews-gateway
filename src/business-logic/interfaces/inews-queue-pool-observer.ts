export interface InewsQueuePoolObserver {
  subscribeToQueuePoolChanges(onQueuePoolChangedCallback: (queueIds: readonly string[]) => void): void
}
