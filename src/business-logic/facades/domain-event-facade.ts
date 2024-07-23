import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { EventBus } from '../services/event-bus'
import { ConnectionStateObserver } from '../interfaces/connection-state-observer'
import { InewsQueuePoolObserver } from '../interfaces/inews-queue-pool-observer'
import { InewsQueuePoolEmitter } from '../interfaces/inews-queue-pool-emitter'
import { InewsQueueEmitter } from '../interfaces/inews-queue-emitter'
import { InewsQueueObserver } from '../interfaces/inews-queue-observer'

export class DomainEventFacade {
  private static eventBus: EventBus

  public static createConnectionStateEmitter(): ConnectionStateEmitter {
    return this.getEventBus()
  }

  public static createConnectionStateObserver(): ConnectionStateObserver {
    return this.getEventBus()
  }

  public static createInewsQueuePoolEmitter(): InewsQueuePoolEmitter {
    return this.getEventBus()
  }

  public static createInewsQueuePoolObserver(): InewsQueuePoolObserver {
    return this.getEventBus()
  }

  public static createInewsQueueEmitter(): InewsQueueEmitter {
    return this.getEventBus()
  }

  public static createInewsQueueObserver(): InewsQueueObserver {
    return this.getEventBus()
  }

  private static getEventBus(): EventBus {
    this.eventBus ??= new EventBus()
    return this.eventBus
  }
}
