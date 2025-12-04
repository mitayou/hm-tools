import { ipcMain, shell, app } from 'electron'
import path from 'path'
import fs from 'fs'
import HdcWrapper from '../hdc'

export class HdcHandler {
  private hdc: HdcWrapper

  constructor() {
    this.hdc = new HdcWrapper()
    this.registerIpc()
  }

  private registerIpc() {
    ipcMain.handle('hdc:run', async (_event, command) => {
      try {
        const cmdParts = command.trim().split(/\s+/)
        // If command starts with 'hdc', remove it as exec might add it or we pass args
        // The HdcWrapper.exec takes args.
        // If the user sends "hdc shell ...", we want ["shell", "..."]
        const args = cmdParts[0] === 'hdc' ? cmdParts.slice(1) : cmdParts
        const result = await this.hdc.exec(args)
        return { success: true, data: result }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    })

    ipcMain.handle('hdc:getDevices', async () => {
      try {
        const devices = await this.hdc.getDevices()
        return { success: true, data: devices }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    })

    ipcMain.handle('hdc:screenshot', async (_event, deviceId: string) => {
      return this.handleScreenshot(deviceId)
    })

    ipcMain.handle('app:getVersion', async () => {
      return app.getVersion()
    })
  }

  private async handleScreenshot(deviceId: string) {
    try {
      const timestamp = Date.now()
      const filename = `截图${timestamp}.jpeg`
      // In dev, use process.cwd() which is project root. In prod, use exe dir.
      const exeDir = app.isPackaged ? path.dirname(app.getPath('exe')) : process.cwd()
      const screenshotDir = path.join(exeDir, 'screenshot')
      const localPath = path.join(screenshotDir, filename)
      const remotePath = `/data/local/tmp/${filename}`

      // Ensure screenshot directory exists
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true })
      }

      // 1. Capture screenshot
      // Command: hdc -t <id> shell snapshot_display -f /data/local/tmp/snap.png
      // We need to pass args to hdc.exec.
      // HdcWrapper.exec uses spawn(hdcPath, args).
      // We need to construct args carefully.

      const targetArgs = deviceId ? ['-t', deviceId] : []

      await this.hdc.exec([...targetArgs, 'shell', 'snapshot_display', '-f', remotePath])

      // 2. Pull file
      // Command: hdc -t <id> file recv remote local
      await this.hdc.exec([...targetArgs, 'file', 'recv', remotePath, localPath])

      // 3. Delete remote file
      await this.hdc.exec([...targetArgs, 'shell', 'rm', remotePath])

      // 4. Open file
      shell.openPath(localPath)

      return { success: true, path: localPath }
    } catch (error) {
      console.error('Screenshot failed:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
}
