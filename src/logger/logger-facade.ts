import { Logger } from './logger'
import { ConsoleLogger } from './console-logger'
import { DummyLogger } from './dummy-logger'

export class LoggerFacade {
  public static createLogger(): Logger {
    return ConsoleLogger.getInstance()
  }

  public static createDummyLogger(): Logger {
    return new DummyLogger()
  }
}
