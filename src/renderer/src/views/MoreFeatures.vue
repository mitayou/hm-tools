<template>
  <div class="more-features-container">
    <el-tabs v-model="activeTab" class="feature-tabs">
      <el-tab-pane label="设备连接与基础" name="device">
        <div class="command-group">
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">查看设备列表</span>
              <span class="cmd-desc">hdc list targets -v</span>
            </div>
            <el-button type="primary" size="small" @click="runCommand('list targets -v')"
              >执行</el-button
            >
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">重启HDC服务</span>
              <span class="cmd-desc">hdc start -r</span>
            </div>
            <el-button type="warning" size="small" @click="runCommand('start -r')">执行</el-button>
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">网络连接设备</span>
              <span class="cmd-desc">hdc tconn [IP]:[port]</span>
            </div>
            <div class="cmd-input">
              <el-input v-model="tconnIp" placeholder="IP:Port" size="small" style="width: 200px" />
              <el-button type="primary" size="small" @click="runTconn">连接</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="文件传输" name="file">
        <div class="command-group">
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">发送文件</span>
              <span class="cmd-desc">hdc file send [local] [remote]</span>
            </div>
            <div class="cmd-input">
              <el-input v-model="fileSendLocal" placeholder="本地路径" size="small" />
              <el-input v-model="fileSendRemote" placeholder="远程路径" size="small" />
              <el-button type="primary" size="small" @click="runFileSend">发送</el-button>
            </div>
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">拉取文件</span>
              <span class="cmd-desc">hdc file recv [remote] [local]</span>
            </div>
            <div class="cmd-input">
              <el-input v-model="fileRecvRemote" placeholder="远程路径" size="small" />
              <el-input v-model="fileRecvLocal" placeholder="本地路径" size="small" />
              <el-button type="primary" size="small" @click="runFileRecv">拉取</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="应用管理" name="app">
        <div class="command-group">
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">安装应用</span>
              <span class="cmd-desc">hdc install [-r/-d/-g] [package]</span>
            </div>
            <div class="cmd-input">
              <el-input v-model="installPath" placeholder="HAP路径" size="small" />
              <el-checkbox v-model="installOpts.r" label="-r 覆盖" size="small" />
              <el-checkbox v-model="installOpts.d" label="-d 降级" size="small" />
              <el-checkbox v-model="installOpts.g" label="-g 授权" size="small" />
              <el-button type="primary" size="small" @click="runInstall">安装</el-button>
            </div>
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">卸载应用</span>
              <span class="cmd-desc">hdc uninstall [-k] [package]</span>
            </div>
            <div class="cmd-input">
              <el-input v-model="uninstallPkg" placeholder="包名" size="small" />
              <el-checkbox v-model="uninstallKeepData" label="-k 保留数据" size="small" />
              <el-button type="danger" size="small" @click="runUninstall">卸载</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="调试与日志" name="debug">
        <div class="command-group">
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">Shell交互</span>
              <span class="cmd-desc">hdc shell [command]</span>
            </div>
            <div class="cmd-input">
              <el-input v-model="shellCmd" placeholder="命令 (e.g. ls -l)" size="small" />
              <el-button type="primary" size="small" @click="runShell">执行</el-button>
            </div>
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">实时日志 (HiLog)</span>
              <span class="cmd-desc">hdc hilog</span>
            </div>
            <el-button type="primary" size="small" @click="runCommand('hilog')">查看日志</el-button>
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">进程列表</span>
              <span class="cmd-desc">hdc jpid</span>
            </div>
            <el-button type="info" size="small" @click="runCommand('jpid')">查看进程</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="端口转发" name="port">
        <div class="command-group">
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">正向转发</span>
              <span class="cmd-desc">hdc fport tcp:local tcp:remote</span>
            </div>
            <div class="cmd-input">
              <el-input
                v-model="fportLocal"
                placeholder="Local Port"
                size="small"
                style="width: 100px"
              />
              <el-input
                v-model="fportRemote"
                placeholder="Remote Port"
                size="small"
                style="width: 100px"
              />
              <el-button type="primary" size="small" @click="runFport">转发</el-button>
            </div>
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">反向转发</span>
              <span class="cmd-desc">hdc rport tcp:remote tcp:local</span>
            </div>
            <div class="cmd-input">
              <el-input
                v-model="rportRemote"
                placeholder="Remote Port"
                size="small"
                style="width: 100px"
              />
              <el-input
                v-model="rportLocal"
                placeholder="Local Port"
                size="small"
                style="width: 100px"
              />
              <el-button type="primary" size="small" @click="runRport">转发</el-button>
            </div>
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">查看转发列表</span>
              <span class="cmd-desc">hdc fport ls</span>
            </div>
            <el-button type="info" size="small" @click="runCommand('fport ls')">查看列表</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="系统与权限" name="system">
        <div class="command-group">
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">挂载系统分区</span>
              <span class="cmd-desc">hdc target mount</span>
            </div>
            <el-button type="danger" size="small" @click="runCommand('target mount')"
              >挂载</el-button
            >
          </div>
          <div class="cmd-item">
            <div class="cmd-header">
              <span class="cmd-title">Root权限</span>
              <span class="cmd-desc">hdc smode [-r]</span>
            </div>
            <div class="cmd-input">
              <el-button type="danger" size="small" @click="runCommand('smode')"
                >授予Root</el-button
              >
              <el-button type="info" size="small" @click="runCommand('smode -r')"
                >取消Root</el-button
              >
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-card class="output-card">
      <template #header>
        <div class="card-header">
          <span>执行结果</span>
          <el-button type="info" link @click="clearOutput">清空</el-button>
        </div>
      </template>
      <div class="output-viewer">
        <pre>{{ output }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('device')
const output = ref('')

// Inputs
const tconnIp = ref('')
const fileSendLocal = ref('')
const fileSendRemote = ref('')
const fileRecvRemote = ref('')
const fileRecvLocal = ref('')
const installPath = ref('')
const installOpts = ref({ r: true, d: false, g: false })
const uninstallPkg = ref('')
const uninstallKeepData = ref(false)
const shellCmd = ref('')
const fportLocal = ref('')
const fportRemote = ref('')
const rportLocal = ref('')
const rportRemote = ref('')

const appendOutput = (text: string) => {
  output.value += `> ${new Date().toLocaleTimeString()}\n${text}\n\n`
}

const clearOutput = () => {
  output.value = ''
}

const execute = async (cmd: string) => {
  appendOutput(`Executing: hdc ${cmd}`)
  const res = await window.electronAPI.runHdcCommand(cmd)
  if (res.success) {
    appendOutput(res.data || 'Success (No output)')
  } else {
    appendOutput(`Error: ${res.error}`)
  }
}

const runCommand = (cmd: string) => execute(cmd)

const runTconn = () => {
  if (!tconnIp.value) {
    ElMessage.warning('请输入IP:Port')
    return
  }
  execute(`tconn ${tconnIp.value}`)
}

const runFileSend = () => {
  if (!fileSendLocal.value || !fileSendRemote.value) {
    ElMessage.warning('请输入路径')
    return
  }
  execute(`file send "${fileSendLocal.value}" "${fileSendRemote.value}"`)
}

const runFileRecv = () => {
  if (!fileRecvLocal.value || !fileRecvRemote.value) {
    ElMessage.warning('请输入路径')
    return
  }
  execute(`file recv "${fileRecvRemote.value}" "${fileRecvLocal.value}"`)
}

const runInstall = () => {
  if (!installPath.value) {
    ElMessage.warning('请输入HAP路径')
    return
  }
  const opts: string[] = []
  if (installOpts.value.r) opts.push('-r')
  if (installOpts.value.d) opts.push('-d')
  if (installOpts.value.g) opts.push('-g')
  execute(`install ${opts.join(' ')} "${installPath.value}"`)
}

const runUninstall = () => {
  if (!uninstallPkg.value) {
    ElMessage.warning('请输入包名')
    return
  }
  const k = uninstallKeepData.value ? '-k' : ''
  execute(`uninstall ${k} ${uninstallPkg.value}`)
}

const runShell = () => {
  if (!shellCmd.value) {
    ElMessage.warning('请输入命令')
    return
  }
  execute(`shell ${shellCmd.value}`)
}

const runFport = () => {
  if (!fportLocal.value || !fportRemote.value) {
    ElMessage.warning('请输入端口')
    return
  }
  execute(`fport tcp:${fportLocal.value} tcp:${fportRemote.value}`)
}

const runRport = () => {
  if (!rportLocal.value || !rportRemote.value) {
    ElMessage.warning('请输入端口')
    return
  }
  execute(`rport tcp:${rportRemote.value} tcp:${rportLocal.value}`)
}
</script>

<style scoped>
.more-features-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-tabs {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  padding: 10px;
  border-radius: 4px;
}

.command-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cmd-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

.cmd-header {
  display: flex;
  flex-direction: column;
}

.cmd-title {
  font-weight: bold;
  font-size: 14px;
}

.cmd-desc {
  font-size: 12px;
  color: #666;
}

.cmd-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.output-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: #0f0;
}

.output-viewer {
  flex: 1;
  overflow-y: overlay;
  padding: 10px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}
</style>
