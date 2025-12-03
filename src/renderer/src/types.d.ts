export interface IElectronAPI {
  runHdcCommand: (command: string) => Promise<{ success: boolean; data?: string; error?: string }>
  getDevices: () => Promise<{ success: boolean; data?: string[]; error?: string }>
  minimize: () => void
  maximize: () => void
  close: () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
