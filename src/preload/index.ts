import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronAPI', {
      /**
       * 执行HDC命令
       * @param command 命令字符串，如 "shell bm get -u"
       */
      runHdcCommand: (command: string) => ipcRenderer.invoke('hdc:run', command),
      /**
       * 获取设备列表
       */
      getDevices: () => ipcRenderer.invoke('hdc:getDevices'),
      /**
       * 窗口控制：最小化
       */
      minimize: () => ipcRenderer.send('window:minimize'),
      /**
       * 窗口控制：最大化/还原
       */
      maximize: () => ipcRenderer.send('window:maximize'),
      /**
       * 窗口控制：关闭
       */
      close: () => ipcRenderer.send('window:close'),
      /**
       * 查找微信开发者工具生成的hap包 (Windows only)
       */
      findAppHap: () => ipcRenderer.invoke('app:findAppHap')
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}
