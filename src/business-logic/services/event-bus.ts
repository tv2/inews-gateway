import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { ConnectionStateObserver } from '../interfaces/connection-state-observer'
import { ConnectionState } from '../../data-access/value-objects/connection-state'
import { EventEmitter } from 'node:events'
import { InewsQueuePoolEmitter } from '../interfaces/inews-queue-pool-emitter'
import { InewsQueuePoolObserver } from '../interfaces/inews-queue-pool-observer'
import { InewsQueueObserver } from '../interfaces/inews-queue-observer'
import { InewsStory } from '../entities/inews-story'
import { InewsQueueEmitter } from '../interfaces/inews-queue-emitter'

export class EventBus implements ConnectionStateEmitter, ConnectionStateObserver, InewsQueuePoolEmitter, InewsQueuePoolObserver, InewsQueueEmitter, InewsQueueObserver {
  private readonly eventEmitter: EventEmitter<{
    connectionStateChanged: [ConnectionState]
    inewsQueuePoolChanged: [readonly string[]]
    inewsStoryCreated: [InewsStory]
    inewsStoryChanged: [InewsStory]
    inewsStoryMoved: [InewsStory]
    inewsStoryDeleted: [string, string]
  }> = new EventEmitter()

  public emitConnectionState(connectionState: ConnectionState): void {
    this.eventEmitter.emit('connectionStateChanged', connectionState)
  }

  public subscribeToConnectionState(onConnectionStateChangedCallback: (connectionState: ConnectionState) => void): void {
    this.eventEmitter.on('connectionStateChanged', onConnectionStateChangedCallback)
  }

  public emitQueuePool(queueIds: readonly string[]): void {
    this.eventEmitter.emit('inewsQueuePoolChanged', queueIds)
  }

  public subscribeToQueuePoolChanges(onQueuePoolChangedCallback: (queueIds: readonly string[]) => void): void {
    this.eventEmitter.on('inewsQueuePoolChanged', onQueuePoolChangedCallback)
  }

  public emitCreatedInewsStory(inewsStory: InewsStory): void {
    this.eventEmitter.emit('inewsStoryCreated', inewsStory)
  }

  public emitChangedInewsStory(inewsStory: InewsStory): void {
    this.eventEmitter.emit('inewsStoryChanged', inewsStory)
  }

  public emitMovedInewsStory(inewsStory: InewsStory): void {
    this.eventEmitter.emit('inewsStoryMoved', inewsStory)
  }

  public emitDeletedInewsStory(inewsQueueId: string, inewsStoryId: string): void {
    this.eventEmitter.emit('inewsStoryDeleted', inewsQueueId, inewsStoryId)
  }

  public subscribeToCreatedInewsStories(onInewsStoryCreatedCallback: (inewsStory: InewsStory) => void): void {
    this.eventEmitter.on('inewsStoryCreated', onInewsStoryCreatedCallback)
  }

  public subscribeToChangedInewsStories(onInewsStoryChangedCallback: (inewsStory: InewsStory) => void): void {
    this.eventEmitter.on('inewsStoryChanged', onInewsStoryChangedCallback)
  }

  public subscribeToMovedInewsStories(onInewsStoryMovedCallback: (inewsStory: InewsStory) => void): void {
    this.eventEmitter.on('inewsStoryMoved', onInewsStoryMovedCallback)
  }

  public subscribeToDeletedInewsStories(onInewsStoryDeletedCallback: (inewsQueueId: string, inewsStoryId: string) => void): void {
    this.eventEmitter.on('inewsStoryDeleted', onInewsStoryDeletedCallback)
  }
}
