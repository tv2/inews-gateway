import { InewsQueueRepository } from '../interfaces/inews-queue-repository'
import { InewsQueue } from '../entities/inews-queue'

export class InMemoryInewsQueueRepository implements InewsQueueRepository {
  private readonly inewsQueues: Map<string, InewsQueue> = new Map()

  public getInewsQueue(inewsQueueId: string): InewsQueue {
    const inewsQueue: InewsQueue | undefined = this.inewsQueues.get(inewsQueueId)
    if (!inewsQueue) {
      throw new Error(`Unable to find an iNews queue with id '${inewsQueueId}'.`)
    }
    return inewsQueue
  }

  public setInewsQueue(inewsQueue: InewsQueue): void {
    this.inewsQueues.set(inewsQueue.id, inewsQueue)
  }
}
