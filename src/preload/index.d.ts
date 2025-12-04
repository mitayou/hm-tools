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
      findAppHap: () => Promise<{ path: string; mtime: Date } | null>
    }
  }
}
