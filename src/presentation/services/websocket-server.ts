import * as ws from 'ws'
import * as http from 'node:http'
import { Logger } from '../../logger/logger'
import { ClientConnectionServer, ConnectedCallback, DisconnectedCallback } from '../interfaces/client-connection-server'
import { WebsocketCloseCode } from '../enums/websocket-close-code'

export class WebsocketServer implements ClientConnectionServer {
  private httpServer?: http.Server
  private connectedCallback?: ConnectedCallback
  private disconnectedCallback?: DisconnectedCallback
  private readonly logger: Logger
  private readonly websockets: Map<string, ws.WebSocket> = new Map()

  public constructor(logger: Logger) {
    this.logger = logger.tag(this.constructor.name)
  }

  public onConnectedClient(connectedCallback: ConnectedCallback): void {
    this.connectedCallback = connectedCallback
  }

  public onDisconnectedClient(disconnectedCallback: DisconnectedCallback): void {
    this.disconnectedCallback = disconnectedCallback
  }

  public start(port: number): Promise<void> {
    if (this.httpServer) {
      throw new Error('Websocket server is already started.')
    }

    return new Promise((resolve, reject) => {
      this.httpServer = http.createServer()
      this.configureWebsocketServer(this.httpServer)
      this.httpServer.once('error', error => reject(error))
      this.httpServer.listen(port, () => {
        this.logger.info(`Websocket server started on port: ${port}`)
        resolve()
      })
    })
  }

  private configureWebsocketServer(httpServer: http.Server): void {
    const websocketServer: ws.Server = new ws.WebSocketServer({ server: httpServer })
    websocketServer.on('close', () => this.logger.info('Websocket server has closed.'))
    websocketServer.on('connection', (websocket: ws.WebSocket, request: http.IncomingMessage) => this.registerWebsocket(websocket, request))
  }

  private registerWebsocket(websocket: ws.WebSocket, request: http.IncomingMessage): void {
    const clientId: string = this.generateClientId()
    try {
      websocket.on('close', () => {
        this.cleanseWebsocket(clientId)
        this.disconnectedCallback?.(clientId)
      })
      this.websockets.set(clientId, websocket)
      const queryParameters: Record<string, string> = this.getQueryParameters(request)
      this.connectedCallback?.(clientId, queryParameters)
    } catch (error: unknown) {
      this.logger.data(error).warn(`Failed registering client with client id '${clientId}'.`)
      websocket.close(WebsocketCloseCode.UNSUPPORTED_DATA, error instanceof Error ? error.message : `${error}`)
    }
  }

  private generateClientId(): string {
    return process.hrtime.bigint().toString(16)
  }

  private cleanseWebsocket(clientId: string): void {
    this.websockets.get(clientId)?.close()
    this.websockets.delete(clientId)
  }

  private getQueryParameters(request: http.IncomingMessage): Record<string, string> {
    const urlSearchParams: URLSearchParams = new URLSearchParams(request.url?.split('?')[1] ?? '')
    return Object.fromEntries(urlSearchParams.entries())
  }

  public sendMessageToClient(clientId: string, message: string | Buffer): void {
    const websocket: ws.WebSocket | undefined = this.websockets.get(clientId)
    if (!websocket) {
      throw new Error(`Received unknown client id '${clientId}' when trying to send message '${message}'.`)
    }
    websocket.send(message)
  }

  public broadcastMessageToAllClients(message: string | Buffer): void {
    this.websockets.forEach(websocket => websocket.send(message))
  }

  public stop(): void {
    this.websockets.forEach(websocket => websocket.close())
    this.httpServer?.close()
    this.logger.info('Websocket server stopped.')
  }
}
