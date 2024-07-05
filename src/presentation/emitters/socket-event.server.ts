import { EventServer } from '../interfaces/event-server'
import { Logger } from '../../logger/logger'
import { Server, Socket } from 'socket.io'
import express from 'express'
import * as http from 'http'
import { IngestEvent } from '../value-objects/ingest-event'
import { IngestEventObserver } from '../interfaces/ingest-event-observer'
import { IngestEventEmitter } from '../interfaces/ingest-event-emitter'

export class SocketEventServer implements EventServer {
  private static instance: EventServer

  public static getInstance(ingestEventEmitter: IngestEventEmitter, ingestEventObserver: IngestEventObserver, logger: Logger): EventServer {
    if (!this.instance) {
      this.instance = new SocketEventServer(ingestEventEmitter, ingestEventObserver, logger)
    }
    return this.instance
  }

  private readonly logger: Logger
  private socketServer?: Server
  private readonly clientRundowns: Map<string, Set<Socket>> = new Map()

  private constructor(private readonly ingestEventEmitter: IngestEventEmitter, private readonly ingestEventObserver: IngestEventObserver, logger: Logger) {
    this.logger = logger.tag(SocketEventServer.name)
  }

  public startServer(port: number): void {
    if (this.socketServer) {
      this.logger.info('Server is already started')
      return
    }
    this.setupSocketServer(port)
  }

  private setupSocketServer(port: number): void {
    if (this.socketServer) {
      return
    }

    this.socketServer = this.createSocketServer(port)

    this.socketServer.on('connection', (socket) => {
      this.logger.info('Socket successfully registered to server')
      this.setupSocket(socket)
    })

    this.socketServer.on('close', () => {
      this.logger.info('Socket server has closed')
    })
  }

  private createSocketServer(port: number): Server {
    const app = express()
    const httpServer = http.createServer(app)
    const socketServer = new Server(httpServer)

    httpServer.listen(port, () => {
      this.logger.info(`Socket server started on port: ${port}`)
    })

    return socketServer
  }

  private setupSocket(socket: Socket): void {
    this.addObserversForSocket(socket)
    const rundowns: string[] = JSON.parse(socket.handshake.query.rundowns as string)
    if (rundowns) {
      this.addClientRundowns(rundowns, socket)
    }

    socket.on('disconnect', () => {
      this.removeClientSocket(socket)
    })
  }

  private addObserversForSocket(socket: Socket): void {
    this.ingestEventObserver.subscribeToIngestEvents((ingestEvent: IngestEvent) => {
      socket.emit(JSON.stringify(ingestEvent))
    })
    // TODO: Remove when creating ingest events
    this.ingestEventEmitter.emitTestEvent()
  }

  private addClientRundowns(rundowns: string[], socket: Socket): void {
    rundowns.forEach((rundown) => {
      const sockets: Set<Socket> = this.clientRundowns.get(rundown) ?? new Set<Socket>()
      sockets.add(socket)
      this.clientRundowns.set(rundown, sockets)
    })
  }

  private removeClientSocket(socket: Socket): void {
    console.log(this.clientRundowns)
    this.clientRundowns.forEach((socketSet) => {
      socketSet.delete(socket)
    })
  }

  public stopServer(): void {
    if (!this.socketServer) {
      this.logger.info('Socket server is already dead')
      return
    }
    this.logger.info('Killing Socket server')
    this.socketServer.close()
  }
}
