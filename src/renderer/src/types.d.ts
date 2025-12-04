export interface IElectronAPI {
  runHdcCommand: (command: string) => Promise<{ success: boolean; data?: string; error?: string }>
  getDevices: () => Promise<{ success: boolean; data?: string[]; error?: string }>
  minimize: () => void
  maximize: () => void
  close: () => void
  findAppHap: () => Promise<Array<{ path: string; mtime: Date; name: string }>>
  getConfig: () => Promise<{
    packages: Array<{ name: string; packageName: string }>
    customCommands: Array<{ name: string; command: string }>
  }>
  saveConfig: (config: any) => Promise<boolean>
  screenshot: (deviceId: string) => Promise<{ success: boolean; path?: string; error?: string }>
  onConfigUpdated: (callback: (config: any) => void) => void
  getVersion: () => Promise<string>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
    electron: ElectronAPI
  }
}
