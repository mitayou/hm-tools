import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electronAPI: {
      runHdcCommand: (
        command: string
      ) => Promise<{ success: boolean; data?: string; error?: string }>
      getDevices: () => Promise<{ success: boolean; data?: string[]; error?: string }>
      minimize: () => void
      maximize: () => void
      close: () => void
      findAppHap: () => Promise<Array<{ path: string; mtime: Date; name: string }> | null>
      getConfig: () => Promise<any>
      saveConfig: (config: any) => Promise<boolean>
      screenshot: (deviceId: string) => Promise<{ success: boolean; path?: string; error?: string }>
      onConfigUpdated: (callback: (config: any) => void) => void
      getVersion: () => Promise<string>
    }
  }
}
