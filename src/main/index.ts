import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import HdcWrapper from './hdc'

let win: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 670,
    // 无边框
    frame: false,
    // 透明
    transparent: true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.on('ready-to-show', () => {
    win?.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
const hdc = new HdcWrapper()
ipcMain.handle('hdc:run', async (_event, command) => {
  try {
    const cmdParts = command.trim().split(/\s+/)
    const args = cmdParts[0] === 'hdc' ? cmdParts.slice(1) : cmdParts
    const result = await hdc.exec(args)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error }
  }
})
ipcMain.handle('hdc:getDevices', async () => {
  try {
    const devices = await hdc.getDevices()
    return { success: true, data: devices }
  } catch (error) {
    return { success: false, error }
  }
})
ipcMain.on('window:minimize', () => win?.minimize())
ipcMain.on('window:maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})
ipcMain.on('window:close', () => win?.close())

import fs from 'fs'
import os from 'os'

ipcMain.handle('app:findAppHap', async () => {
  if (process.platform !== 'win32') return null

  try {
    const homeDir = os.homedir()
    // C:\Users\{computerName}\AppData\Local\微信开发者工具\User Data\{唯一的一个文件夹}\WeappMiniApp\ohos\{唯一的一个文件夹2}\app.hap
    const baseDir = join(homeDir, 'AppData', 'Local', '微信开发者工具', 'User Data')

    if (!fs.existsSync(baseDir)) return null

    // Find first unique folder in User Data
    fs.readdirSync(baseDir).filter(
      (f) => fs.statSync(join(baseDir, f)).isDirectory() && f !== 'Default' && f !== 'Crashpad'
    )
    // The requirement says "unique folder", but User Data contains many folders.
    // Usually it's a hash-like folder or we might need to look deeper.
    // Let's try to find a folder that contains WeappMiniApp inside it.

    let targetHapPath = ''

    // Strategy: Search recursively or look for specific pattern?
    // Requirement: User Data\{唯一的一个文件夹}\WeappMiniApp\ohos\{唯一的一个文件夹2}\app.hap
    // Let's iterate all directories in User Data to find one having WeappMiniApp

    const potentialDirs = fs.readdirSync(baseDir)

    for (const dir of potentialDirs) {
      const weappDir = join(baseDir, dir, 'WeappMiniApp', 'ohos')
      if (fs.existsSync(weappDir)) {
        // Found the path up to ohos
        // Now find {唯一的一个文件夹2}
        const subDirs = fs.readdirSync(weappDir)
        if (subDirs.length > 0) {
          // Assuming the first one is the target as per "unique" hint, or just take the first one found
          const hapPath = join(weappDir, subDirs[0], 'app.hap')
          if (fs.existsSync(hapPath)) {
            targetHapPath = hapPath
            break
          }
        }
      }
    }

    if (targetHapPath) {
      const stats = fs.statSync(targetHapPath)
      return {
        path: targetHapPath,
        mtime: stats.mtime
      }
    }

    return null
  } catch (error) {
    console.error('Error finding app.hap:', error)
    return null
  }
})
