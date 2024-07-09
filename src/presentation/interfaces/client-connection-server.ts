export type ConnectedCallback = (clientId: string, inputs: Record<string, unknown>) => void
export type DisconnectedCallback = (clientId: string) => void

export interface ClientConnectionServer {
  onConnectedClient(connectedCallback: ConnectedCallback): void
  onDisconnectedClient(disconnectedCallback: DisconnectedCallback): void
  sendTo(clientId: string, message: string | Buffer): void
  start(port: number): Promise<void>
  stop(): void
}
