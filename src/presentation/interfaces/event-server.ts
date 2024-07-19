export interface EventServer {
  start(port: number): Promise<void>
  stop(): void
}
