import { InewsQueue } from '../entities/inews-queue'

export interface InewsQueueRepository {
  getInewsQueue(inewsQueueId: string): InewsQueue
  setInewsQueue(inewsQueue: InewsQueue): void
}
