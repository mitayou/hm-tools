import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

/**
 * HDC工具类
 * 用于执行hdc相关命令
 */
export class HdcWrapper {
  private hdcPath: string

  constructor() {
    // 假设toolchains在项目根目录下
    // 在开发环境中，根目录是项目根目录
    // 在生产环境中，可能需要根据实际打包情况调整
    const isDev = process.env.NODE_ENV === 'development'
    const rootDir = isDev ? process.cwd() : process.resourcesPath

    // 尝试查找hdc.exe
    const possiblePaths = [
      path.join(rootDir, 'toolchains', 'hdc.exe'),
      path.join(rootDir, '..', 'toolchains', 'hdc.exe') // 应对某些打包结构
    ]

    this.hdcPath = possiblePaths.find((p) => fs.existsSync(p)) || 'hdc' // 找不到则尝试全局命令
    console.log('HDC Path:', this.hdcPath)
  }

  /**
   * 执行HDC命令
   * @param args 命令参数数组
   * @returns Promise<string> 命令输出
   */
  public async exec(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.hdcPath, args, { shell: true }) // shell: true for windows compatibility if needed, though spawn usually avoids it.
      // Actually, for hdc.exe, we might not need shell: true if we point directly to exe.
      // But let's keep it simple.

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
  public async getDevices(): Promise<string[]> {
    try {
      const output = await this.exec(['list', 'targets'])
      // Output format usually:
      // [Empty] or list of device IDs
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
