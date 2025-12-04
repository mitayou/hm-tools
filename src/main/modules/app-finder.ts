import { ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'

export class AppFinder {
  constructor() {
    this.registerIpc()
  }

  private registerIpc() {
    ipcMain.handle('app:findAppHap', async () => {
      return this.findAppHaps()
    })
  }

  private findAppHaps() {
    if (process.platform !== 'win32') return []

    try {
      const homeDir = os.homedir()
      const baseDir = path.join(homeDir, 'AppData', 'Local', '微信开发者工具', 'User Data')

      if (!fs.existsSync(baseDir)) return []

      const results: Array<{ path: string; mtime: Date; name: string }> = []

      // Recursive search function
      const searchDir = (currentDir: string, depth: number) => {
        if (depth > 10) return // Prevent infinite recursion

        try {
          const files = fs.readdirSync(currentDir)
          for (const file of files) {
            const fullPath = path.join(currentDir, file)
            const stats = fs.statSync(fullPath)

            if (stats.isDirectory()) {
              // Optimization: Skip some known non-relevant folders to speed up
              if (file === 'Default' || file === 'Crashpad' || file === 'ShaderCache') continue

              searchDir(fullPath, depth + 1)
            } else if (file === 'app.hap') {
              // Found app.hap
              // Try to derive a meaningful name.
              // Structure: .../WeappMiniApp/ohos/{unique_folder}/app.hap
              // Parent is unique folder, Grandparent is ohos, Great-grandparent is WeappMiniApp
              // Let's use the parent folder name as the identifier
              const parentDir = path.basename(currentDir)
              results.push({
                path: fullPath,
                mtime: stats.mtime,
                name: parentDir
              })
            }
          }
        } catch (e) {
          // Ignore access errors
        }
      }

      searchDir(baseDir, 0)

      // Sort by mtime desc
      return results.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
    } catch (error) {
      console.error('Error finding app.hap:', error)
      return []
    }
  }
}
