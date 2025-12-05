import { app, ipcMain, BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs'

const CONFIG_FILE_NAME = 'config.json'

// Get the directory where the executable is located
const getExeDir = (): string => {
  // In development, we might want to use the project root or a specific temp dir
  // But the requirement says "current exe running directory"
  // app.getPath('exe') returns the full path to the executable
  return path.dirname(app.getPath('exe'))
}

const getConfigPath = (): string => {
  return path.join(getExeDir(), CONFIG_FILE_NAME)
}

export interface AppConfig {
  packages: Array<{ name: string; packageName: string }>
  customCommands: Array<{ name: string; command: string }>
  skin?: {
    selected: string
    blur: number
  }
}

const DEFAULT_CONFIG: AppConfig = {
  packages: [],
  customCommands: [{ name: '查看连接设备列表', command: 'hdc list targets -v' }],
  skin: {
    selected: 'default',
    blur: 20
  }
}

export class ConfigStore {
  private config: AppConfig

  constructor() {
    this.config = this.loadConfig()
    this.registerIpc()
  }

  private loadConfig(): AppConfig {
    const configPath = getConfigPath()
    try {
      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf-8')
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) }
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
    return DEFAULT_CONFIG
  }

  private saveConfig(newConfig: Partial<AppConfig>): boolean {
    const configPath = getConfigPath()
    try {
      this.config = { ...this.config, ...newConfig }
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2), 'utf-8')
      BrowserWindow.getAllWindows().forEach((w) => {
        w.webContents.send('config:updated', this.config)
      })
      return true
    } catch (error) {
      console.error('Failed to save config:', error)
      return false
    }
  }

  private registerIpc() {
    ipcMain.handle('config:get', () => {
      return this.config
    })

    ipcMain.handle('config:save', (_event, newConfig: Partial<AppConfig>) => {
      return this.saveConfig(newConfig)
    })

    ipcMain.handle('config:getPath', () => {
      return getConfigPath()
    })
  }
}
