<template>
  <div class="home-container">
    <el-card class="device-card">
      <template #header>
        <div class="card-header">
          <span>设备连接({{ devices.length }}台)</span>
          <el-button type="primary" link @click="refreshDevices">刷新列表</el-button>
        </div>
      </template>
      <div class="device-list">
        <el-select v-model="selectedDevice" placeholder="请选择设备" style="width: 100%">
          <el-option v-for="item in devices" :key="item" :label="item" :value="item" />
        </el-select>
        <div v-if="devices.length === 0" class="no-device">
          未检测到设备，请连接USB或在设置-开发者选项-开启无线调试
        </div>
      </div>
    </el-card>

    <el-card class="command-card">
      <template #header>
        <div class="card-header">
          <span>常用功能</span>
          <div v-if="currentPackages.length > 0" class="package-tags">
            <el-tag
              v-for="pkg in currentPackages"
              :key="pkg.packageName"
              type="success"
              size="small"
              >{{ pkg.name }}</el-tag
            >
          </div>
          <el-tag v-else type="warning">未配置包名</el-tag>
        </div>
      </template>

      <div class="command-grid">
        <el-button @click="runCommand('get-udid')">获取UDID</el-button>
        <el-button
          type="danger"
          @click="runCommand('clean-data')"
          :disabled="currentPackages.length === 0"
          >清除数据</el-button
        >
        <el-button
          type="warning"
          @click="runCommand('clean-cache')"
          :disabled="currentPackages.length === 0"
          >清除缓存</el-button
        >

        <!-- Custom Commands -->
        <el-button
          v-for="(cmd, index) in customCommands"
          :key="index"
          @click="runCustomCommand(cmd.command)"
        >
          {{ cmd.name }}
        </el-button>
      </div>
    </el-card>

    <el-card class="log-card">
      <template #header>
        <div class="card-header">
          <span>运行日志</span>
          <el-button type="info" link @click="clearLogs">清空</el-button>
        </div>
      </template>
      <div class="log-viewer" ref="logViewerRef" @contextmenu.prevent="handleContextMenu">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          <span class="log-time">[{{ log.time }}]</span>
          <span class="log-content" :class="{ error: log.type === 'error' }">{{
            log.content
          }}</span>
        </div>
      </div>
    </el-card>

    <!-- AppData Check Result -->
    <el-card v-if="foundHap" class="hap-card">
      <template #header>
        <div class="card-header">
          <span>发现构建包</span>
          <el-tag type="warning" size="small">DevTools</el-tag>
        </div>
      </template>
      <div class="hap-info">
        <div class="hap-path" :title="foundHap.path">{{ foundHap.path }}</div>
        <div class="hap-time">创建时间: {{ new Date(foundHap.mtime).toLocaleString() }}</div>
        <el-button type="primary" style="margin-top: 10px" @click="installHap"
          >安装到设备</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

interface AppPackage {
  name: string
  packageName: string
}

const devices = ref<string[]>([])
const selectedDevice = ref('')
const logs = ref<{ time: string; content: string; type: 'info' | 'error' }[]>([])
const logViewerRef = ref<HTMLElement | null>(null)

// Load settings from localStorage
const currentPackages = computed<AppPackage[]>(() => {
  const pkgs = localStorage.getItem('hm_packages')
  if (pkgs) {
    try {
      return JSON.parse(pkgs)
    } catch (e) {
      console.error('Failed to parse packages:', e)
      return []
    }
  }
  // Fallback for old array of strings
  const oldPkgs = localStorage.getItem('hm_package_names')
  if (oldPkgs) {
    try {
      const arr = JSON.parse(oldPkgs)
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        return arr.map((p) => ({ name: p, packageName: p }))
      }
    } catch (e) {
      console.error('Failed to parse old packages:', e)
      return []
    }
  }
  // Fallback for old single string
  const oldPkg = localStorage.getItem('hm_package_name')
  return oldPkg ? [{ name: '默认应用', packageName: oldPkg }] : []
})

const customCommands = computed(() => {
  const cmds = localStorage.getItem('hm_custom_commands')
  return cmds ? JSON.parse(cmds) : []
})

const refreshDevices = async () => {
  const res = await window.electronAPI.getDevices()
  if (res.success && res.data) {
    devices.value = res.data
    if (devices.value.length > 0 && !selectedDevice.value) {
      selectedDevice.value = devices.value[0]
    }
    addLog(`设备列表刷新: 找到 ${devices.value.length} 个设备`)
  } else {
    addLog(`设备列表刷新失败: ${res.error}`, 'error')
  }
}

const runCommand = async (type: string) => {
  if (!selectedDevice.value) {
    ElMessage.warning('请先选择设备')
    return
  }

  const prefix = `hdc -t ${selectedDevice.value} shell`

  switch (type) {
    case 'get-udid':
      await execute(`${prefix} bm get -u`)
      break
    case 'clean-data':
      if (currentPackages.value.length === 0) return
      for (const pkg of currentPackages.value) {
        addLog(`正在清除 [${pkg.name}] 数据...`)
        await execute(`${prefix} bm clean -d -n ${pkg.packageName}`)
      }
      break
    case 'clean-cache':
      if (currentPackages.value.length === 0) return
      for (const pkg of currentPackages.value) {
        addLog(`正在清除 [${pkg.name}] 缓存...`)
        await execute(`${prefix} bm clean -c -n ${pkg.packageName}`)
      }
      break
  }
}

const runCustomCommand = async (cmdTemplate: string) => {
  if (!selectedDevice.value) {
    ElMessage.warning('请先选择设备')
    return
  }
  // Replace placeholders if any, or just append to hdc -t <id> shell?
  // User requirement: "hdc shell ..."
  // If the custom command is full "hdc shell ...", we might need to inject -t <id>
  // Let's assume custom commands are stored as full commands e.g. "hdc shell bm get -u"
  // We need to insert -t <id> after hdc.

  let finalCmd = cmdTemplate
  if (cmdTemplate.startsWith('hdc ')) {
    finalCmd = cmdTemplate.replace('hdc ', `hdc -t ${selectedDevice.value} `)
  } else {
    // If it doesn't start with hdc, maybe it's just a shell command?
    // Let's assume it is a full hdc command for now as per requirement 5.3
    finalCmd = `hdc -t ${selectedDevice.value} ${cmdTemplate}`
  }

  await execute(finalCmd)
}

const execute = async (command: string) => {
  addLog(`执行命令: ${command}`)
  const res = await window.electronAPI.runHdcCommand(command)
  if (res.success) {
    addLog(res.data || '执行成功 (无输出)')
  } else {
    addLog(`执行失败: ${res.error}`, 'error')
  }
}

const addLog = (content: string, type: 'info' | 'error' = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.push({ time, content, type })
  nextTick(() => {
    if (logViewerRef.value) {
      logViewerRef.value.scrollTop = logViewerRef.value.scrollHeight
    }
  })
}

const clearLogs = () => {
  logs.value = []
}

const foundHap = ref<{ path: string; mtime: Date } | null>(null)

const checkAppHap = async () => {
  const res = await window.electronAPI.findAppHap()
  if (res) {
    foundHap.value = res
  }
}

const installHap = async () => {
  if (!foundHap.value) return
  if (!selectedDevice.value) {
    ElMessage.warning('请先选择设备')
    return
  }

  const cmd = `hdc -t ${selectedDevice.value} install -r "${foundHap.value.path}"`
  await execute(cmd)
}

onMounted(() => {
  refreshDevices()
  checkAppHap()
})

function handleContextMenu() {
  // 1. 获取选中的文本
  const selection = window.getSelection()
  const text = selection?.toString().trim()

  if (!text) {
    return
  }
  // 2. 复制选中的文本
  navigator.clipboard.writeText(text)
  // 3. 清除选中的文本
  selection?.removeAllRanges()
  // 4. 显示提示
  ElMessage.success('复制成功')
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-card,
.command-card,
.log-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.command-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.log-viewer {
  height: 200px;
  overflow-y: overlay;
  background: rgba(0, 0, 0, 0.8);
  color: #0f0;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 4px;
  word-break: break-all;
}

.log-time {
  color: #888;
  margin-right: 8px;
}

.log-content.error {
  color: #ff5f57;
}

.no-device {
  margin-top: 10px;
  color: #999;
  font-size: 12px;
  text-align: center;
}

.hap-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  border: none;
}

.hap-info {
  display: flex;
  flex-direction: column;
}

.hap-path {
  font-size: 12px;
  color: #666;
  word-break: break-all;
  margin-bottom: 5px;
}

.hap-time {
  font-size: 12px;
  color: #999;
}
</style>
