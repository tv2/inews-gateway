import { EventServer } from '../interfaces/event-server'
import { Logger } from '../logger/logger'
import { Server } from 'socket.io'
import express from 'express'
import * as http from 'http'

export class SocketEventServer implements EventServer {
  private static instance: EventServer

  public static getInstance(logger: Logger): EventServer {
    if (!this.instance) {
      this.instance = new SocketEventServer(logger)
    }
    return this.instance
  }

  private readonly logger: Logger
  private socketServer?: Server

  private constructor(logger: Logger) {
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

    this.socketServer.on('connection', () => {
      this.logger.info('Socket successfully registered to server')
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

  public stopServer(): void {
    if (!this.socketServer) {
      this.logger.info('Socket server is already dead')
      return
    }
    this.logger.info('Killing Socket server')
    this.socketServer.close()
  }
}
