import path from 'path'
import fs from 'fs'
import child_process from 'child_process'

export default class HdcWrapper {
  hdcPath: string
  constructor() {
    const isDev = process.env.NODE_ENV === 'development'
    const rootDir = isDev ? process.cwd() : process.resourcesPath
    const possiblePaths = [
      path.join(rootDir, 'toolchains', 'hdc.exe'),
      path.join(rootDir, '..', 'toolchains', 'hdc.exe')
      // 应对某些打包结构
    ]
    this.hdcPath = possiblePaths.find((p) => fs.existsSync(p)) || 'hdc'
    console.log('HDC Path:', this.hdcPath)
  }
  /**
   * 执行HDC命令
   * @param args 命令参数数组
   * @returns Promise<string> 命令输出
   */
  async exec(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = child_process.spawn(this.hdcPath, args, { shell: true })
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.trim())
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`))
        }
      })
      child.on('error', (err) => {
        reject(err)
      })
    })
  }
  /**
   * 获取设备列表
   */
  async getDevices() {
    try {
      const output = await this.exec(['list', 'targets'])
      if (!output || output.includes('[Empty]')) return []
      return output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line !== '[Empty]')
    } catch (error) {
      console.error('Failed to get devices:', error)
      return []
    }
  }
}
