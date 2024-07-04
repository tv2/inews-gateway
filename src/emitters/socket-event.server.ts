import { EventServer } from '../interfaces/event-server'
import { Logger } from '../logger/logger'
import { Server } from 'socket.io'
import express from 'express'
import * as http from 'http'
import {type} from "os";

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
  private clientRundowns: string[] = []

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

    this.socketServer.on('connection', (socket) => {
      this.logger.info('Socket successfully registered to server')
      const rundowns: string = socket.handshake.query.rundowns as string
      if (rundowns) {
        this.logger.data(rundowns).info('Rundowns received: ')
        this.clientRundowns = JSON.parse(rundowns)
      }
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
