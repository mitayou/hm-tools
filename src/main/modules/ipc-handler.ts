import { ipcMain, BrowserWindow } from 'electron'
import { ConfigStore } from './config-store'
import { AppFinder } from './app-finder'
import { HdcHandler } from './hdc-handler'

export class IpcHandler {
  private configStore: ConfigStore
  private appFinder: AppFinder
  private hdcHandler: HdcHandler

  constructor() {
    this.configStore = new ConfigStore()
    this.appFinder = new AppFinder()
    this.hdcHandler = new HdcHandler()
    this.registerWindowIpc()
  }

  private registerWindowIpc() {
    ipcMain.on('window:minimize', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.minimize()
    })

    ipcMain.on('window:maximize', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win?.isMaximized()) {
        win.unmaximize()
      } else {
        win?.maximize()
      }
    })

    ipcMain.on('window:close', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.close()
    })

    ipcMain.on('window:open-devtools', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.webContents.openDevTools()
    })
  }
}
