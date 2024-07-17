import { ConnectionStateEmitter } from '../interfaces/connection-state-emitter'
import { EventBus } from '../services/event-bus'
import { ConnectionStateObserver } from '../interfaces/connection-state-observer'

export class DomainEventFacade {
  private static eventBus: EventBus

  public static createConnectionStateEmitter(): ConnectionStateEmitter {
    return this.getEventBus()
  }

  public static createConnectionStateObserver(): ConnectionStateObserver {
    return this.getEventBus()
  }

  private static getEventBus(): EventBus {
    this.eventBus ??= new EventBus()
    return this.eventBus
  }
}
