import { IngestEventServer } from './ingest-event-server'
import { ClientConnectionServer, ConnectedCallback, DisconnectedCallback } from '../interfaces/client-connection-server'
import { anything, capture, instance, mock, when } from '@typestrong/ts-mockito'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { Logger } from '@tv2media/logger'
import { QueuePoolObserver } from '../emitters/queue-pool-observer'
import { LoggerFacade } from '../../logger/logger-facade'

describe(IngestEventServer.name, () => {
  describe('when the first client connects', () => {
    it('emits all queues that the client wants to subscribe to', async () => {
      const queuePoolObserverMock: QueuePoolObserver = mock<QueuePoolObserver>()
      const queuePoolObserver: QueuePoolObserver = instance(queuePoolObserverMock)
      const clientConnectionServerMock: ClientConnectionServerMock = createClientConnectionServerMock()
      const clientConnectionServer: ClientConnectionServerMock = instance(clientConnectionServerMock)
      const testee: IngestEventServer = createTestee({ queuePoolObserver, clientConnectionServer })
      await testee.start(0)
      const queuePoolForFirstClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.TEST.QUEUE'])

      clientConnectionServer.connectClient('first-client', { queues: [...queuePoolForFirstClient].join(',') })

      const queuePool: Set<string> = capture(queuePoolObserverMock.emitQueuePool).last()[0]
      expect(queuePool.isSupersetOf(queuePoolForFirstClient)).toBeTruthy()
      expect(queuePool.size).toBe(queuePoolForFirstClient.size)
    })

    describe('when the first client disconnects again', () => {
      it('emits an empty queue list', async () => {
        const queuePoolObserverMock: QueuePoolObserver = mock<QueuePoolObserver>()
        const queuePoolObserver: QueuePoolObserver = instance(queuePoolObserverMock)
        const clientConnectionServerMock: ClientConnectionServerMock = createClientConnectionServerMock()
        const clientConnectionServer: ClientConnectionServerMock = instance(clientConnectionServerMock)
        const testee: IngestEventServer = createTestee({ queuePoolObserver, clientConnectionServer })
        await testee.start(0)
        const queuePoolForFirstClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.TEST.QUEUE'])

        clientConnectionServer.connectClient('first-client', { queues: [...queuePoolForFirstClient].join(',') })
        clientConnectionServer.disconnectClient('first-client')

        const queuePool: Set<string> = capture(queuePoolObserverMock.emitQueuePool).last()[0]
        expect(queuePool.size).toBe(0)
      })
    })
  })

  describe('when two clients connects', () => {
    describe('when the clients queue requests are distinct', () => {
      it('emits all unique queue ids from both clients', async () => {
        const queuePoolObserverMock: QueuePoolObserver = mock<QueuePoolObserver>()
        const queuePoolObserver: QueuePoolObserver = instance(queuePoolObserverMock)
        const clientConnectionServerMock: ClientConnectionServerMock = createClientConnectionServerMock()
        const clientConnectionServer: ClientConnectionServerMock = instance(clientConnectionServerMock)
        const testee: IngestEventServer = createTestee({ queuePoolObserver, clientConnectionServer })
        await testee.start(0)
        const queuePoolForFirstClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.TEST.QUEUE'])
        const queuePoolForSecondClient: Set<string> = new Set(['MY.DEBUG.QUEUE', 'ANOTHER.DEBUG.QUEUE'])
        const combinedQueuePool: Set<string> = queuePoolForFirstClient.union(queuePoolForSecondClient)

        clientConnectionServer.connectClient('first-client', { queues: [...queuePoolForFirstClient].join(',') })
        clientConnectionServer.connectClient('second-client', { queues: [...queuePoolForSecondClient].join(',') })

        const queuePool: Set<string> = capture(queuePoolObserverMock.emitQueuePool).last()[0]
        expect(queuePool.isSupersetOf(combinedQueuePool)).toBeTruthy()
        expect(queuePool.size).toBe(combinedQueuePool.size)
      })
    })

    describe('when the clients queue requests are overlapping', () => {
      it('emits al unique queue ids from both clients', async () => {
        const queuePoolObserverMock: QueuePoolObserver = mock<QueuePoolObserver>()
        const queuePoolObserver: QueuePoolObserver = instance(queuePoolObserverMock)
        const clientConnectionServerMock: ClientConnectionServerMock = createClientConnectionServerMock()
        const clientConnectionServer: ClientConnectionServerMock = instance(clientConnectionServerMock)
        const testee: IngestEventServer = createTestee({ queuePoolObserver, clientConnectionServer })
        await testee.start(0)
        const queuePoolForFirstClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.TEST.QUEUE'])
        const queuePoolForSecondClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.DEBUG.QUEUE'])
        const combinedQueuePool: Set<string> = queuePoolForFirstClient.union(queuePoolForSecondClient)

        clientConnectionServer.connectClient('first-client', { queues: [...queuePoolForFirstClient].join(',') })
        clientConnectionServer.connectClient('second-client', { queues: [...queuePoolForSecondClient].join(',') })

        const queuePool: Set<string> = capture(queuePoolObserverMock.emitQueuePool).last()[0]
        expect(queuePool.isSupersetOf(combinedQueuePool)).toBeTruthy()
        expect(queuePool.size).toBe(combinedQueuePool.size)
      })
    })

    describe('when the first client disconnects again', () => {
      it('emits all queues from the second client', async () => {
        const queuePoolObserverMock: QueuePoolObserver = mock<QueuePoolObserver>()
        const queuePoolObserver: QueuePoolObserver = instance(queuePoolObserverMock)
        const clientConnectionServerMock: ClientConnectionServerMock = createClientConnectionServerMock()
        const clientConnectionServer: ClientConnectionServerMock = instance(clientConnectionServerMock)
        const testee: IngestEventServer = createTestee({ queuePoolObserver, clientConnectionServer })
        await testee.start(0)
        const queuePoolForFirstClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.TEST.QUEUE'])
        const queuePoolForSecondClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.DEBUG.QUEUE'])

        clientConnectionServer.connectClient('first-client', { queues: [...queuePoolForFirstClient].join(',') })
        clientConnectionServer.connectClient('second-client', { queues: [...queuePoolForSecondClient].join(',') })
        clientConnectionServer.disconnectClient('first-client')

        const queuePool: Set<string> = capture(queuePoolObserverMock.emitQueuePool).last()[0]
        expect(queuePool.isSupersetOf(queuePoolForSecondClient)).toBeTruthy()
        expect(queuePool.size).toBe(queuePoolForSecondClient.size)
      })
    })

    describe('when the second client disconnects again', () => {
      it('emits all queues from the first client', async () => {
        const queuePoolObserverMock: QueuePoolObserver = mock<QueuePoolObserver>()
        const queuePoolObserver: QueuePoolObserver = instance(queuePoolObserverMock)
        const clientConnectionServerMock: ClientConnectionServerMock = createClientConnectionServerMock()
        const clientConnectionServer: ClientConnectionServerMock = instance(clientConnectionServerMock)
        const testee: IngestEventServer = createTestee({ queuePoolObserver, clientConnectionServer })
        await testee.start(0)
        const queuePoolForFirstClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.TEST.QUEUE'])
        const queuePoolForSecondClient: Set<string> = new Set(['MY.TEST.QUEUE', 'ANOTHER.DEBUG.QUEUE'])

        clientConnectionServer.connectClient('first-client', { queues: [...queuePoolForFirstClient].join(',') })
        clientConnectionServer.connectClient('second-client', { queues: [...queuePoolForSecondClient].join(',') })
        clientConnectionServer.disconnectClient('second-client')

        const queuePool: Set<string> = capture(queuePoolObserverMock.emitQueuePool).last()[0]
        expect(queuePool.isSupersetOf(queuePoolForFirstClient)).toBeTruthy()
        expect(queuePool.size).toBe(queuePoolForFirstClient.size)
      })
    })
  })
})

function createTestee(mocks: { clientConnectionServer?: ClientConnectionServer, ingestEventObserver?: IngestEventObserver, queuePoolObserver?: QueuePoolObserver } = {}): IngestEventServer {
  const clientConnectionServer: ClientConnectionServer = mocks.clientConnectionServer ?? instance(mock<ClientConnectionServer>())
  const ingestEventObserver: IngestEventObserver = mocks.ingestEventObserver ?? instance(mock<IngestEventObserver>())
  const queuePoolObserver: QueuePoolObserver = mocks.queuePoolObserver ?? instance(mock<QueuePoolObserver>())
  const logger: Logger = LoggerFacade.createDummyLogger()
  return new IngestEventServer(clientConnectionServer, ingestEventObserver, queuePoolObserver, logger)
}

interface ClientConnectionServerMock extends ClientConnectionServer {
  connectClient(clientId: string, inputs: Record<string, unknown>): void
  disconnectClient(clientId: string): void
}

function createClientConnectionServerMock(): ClientConnectionServerMock {
  const clientConnectionServerMock: ClientConnectionServerMock = mock<ClientConnectionServerMock>()
  const callbackCache: { onConnectedCallback?: ConnectedCallback, onDisconnectedCallback?: DisconnectedCallback } = {}
  when(clientConnectionServerMock.onConnectedClient(anything())).thenCall(onConnectedCallback => callbackCache.onConnectedCallback = onConnectedCallback)
  when(clientConnectionServerMock.onDisconnectedClient(anything())).thenCall(onDisconnectedCallback => callbackCache.onDisconnectedCallback = onDisconnectedCallback)
  when(clientConnectionServerMock.connectClient(anything(), anything())).thenCall((clientId: string, inputs: Record<string, unknown>) => callbackCache.onConnectedCallback?.(clientId, inputs))
  when(clientConnectionServerMock.disconnectClient(anything())).thenCall((clientId: string) => callbackCache.onDisconnectedCallback?.(clientId))
  return clientConnectionServerMock
}
