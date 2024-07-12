export interface FtpClient {
  connect(): Promise<void>
  changeWorkingDirectory(path: string): Promise<void>
  listFiles(): Promise<readonly string[]>
  getFile(filename: string): Promise<string>
  disconnect(): Promise<void>
}
