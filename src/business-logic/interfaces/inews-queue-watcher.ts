export interface InewsQueueWatcher {
  start(): Promise<void>
  stop(): Promise<void>
}
