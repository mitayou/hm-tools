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
      findAppHap: () => ipcRenderer.invoke('app:findAppHap'),
      /**
       * 获取配置
       */
      getConfig: () => ipcRenderer.invoke('config:get'),
      /**
       * 保存配置
       */
      saveConfig: (config: any) => ipcRenderer.invoke('config:save', config),
      /**
       * 截屏预览
       */
      screenshot: (deviceId: string) => ipcRenderer.invoke('hdc:screenshot', deviceId),
      /**
       * 监听配置更新
       */
      onConfigUpdated: (callback: (config: any) => void) =>
        ipcRenderer.on('config:updated', (_event, config) => callback(config)),
      /**
       * 获取版本信息
       */
      getVersion: () => ipcRenderer.invoke('app:getVersion'),
      /**
       * 打开调试工具
       */
      openDevTools: () => ipcRenderer.send('window:open-devtools')
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
