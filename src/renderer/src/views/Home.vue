<template>
  <div class="home-container">
    <el-card class="device-card">
      <template #header>
        <div class="card-header">
          <div class="device-header">
            <el-icon v-if="deviceChecking" class="is-loading">
              <loading />
            </el-icon>
            设备连接({{ devices.length }}台)
          </div>
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
      <div class="command-grid">
        <el-button type="default" @click="openDeviceDialog">
          <el-icon>
            <connection />
          </el-icon>
          <span> 添加设备</span>
        </el-button>
        <el-button type="default" @click="runCommand('get-udid')">
          <el-icon>
            <aim />
          </el-icon>
          <span> 获取UDID</span>
        </el-button>
        <el-button type="primary" @click="runCommand('screenshot')">
          <el-icon>
            <cellphone />
          </el-icon>
          <span> 截屏预览</span>
        </el-button>

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

    <el-card class="command-card">
      <template #header>
        <div class="card-header">
          <span>应用操作</span>
          <div v-if="currentPackages.length > 0">
            <el-checkbox
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="handleCheckAllChange"
              >全选</el-checkbox
            >
          </div>
          <el-tag v-else type="warning">未配置包名</el-tag>
        </div>
      </template>

      <div v-if="currentPackages.length > 0" class="package-selection">
        <div class="text-select">选择安装包</div>
        <el-checkbox-group v-model="selectedPackages" @change="handleCheckedPackagesChange">
          <el-checkbox
            v-for="pkg in currentPackages"
            :key="pkg.packageName"
            :label="pkg.packageName"
            >{{ pkg.name }}</el-checkbox
          >
        </el-checkbox-group>
      </div>
      <div class="command-grid">
        <el-button
          type="success"
          @click="runCommand('clean-data')"
          :disabled="selectedPackages.length === 0"
        >
          <el-icon>
            <coin />
          </el-icon>
          <span> 清除数据</span>
        </el-button>
        <el-button
          type="warning"
          @click="runCommand('clean-cache')"
          :disabled="selectedPackages.length === 0"
        >
          <el-icon>
            <delete />
          </el-icon>
          <span> 清除缓存</span>
        </el-button>

        <el-button
          type="danger"
          @click="runCommand('uninstall')"
          :disabled="selectedPackages.length === 0"
        >
          <el-icon>
            <remove />
          </el-icon>
          <span> 卸载应用</span>
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
    <el-card v-if="foundHaps.length > 0" class="hap-card">
      <template #header>
        <div class="card-header">
          <div class="hap-wrapper">
            <el-icon v-if="hapChecking" class="is-loading">
              <loading />
            </el-icon>
            <span>扫描小程序构建包</span>
            <el-tooltip
              effect="light"
              content="扫描文件为C:\Users\{computerName}\AppData\Local\微信开发者工具\User Data\{random}\WeappMiniApp\ohos\{random}\*.hap"
              placement="top"
            >
              <span class="text-primary"> ({{ foundHaps.length }})</span>
            </el-tooltip>
          </div>
          <el-button type="primary" link @click="scanHaps">重新扫描</el-button>
        </div>
      </template>
      <div class="hap-list">
        <div v-for="(hap, index) in foundHaps" :key="index" class="hap-item">
          <div class="hap-info">
            <div class="hap-name">{{ hap.name }}</div>
            <div class="hap-path" :title="hap.path">{{ hap.path }}</div>
            <div class="hap-time">创建时间: {{ new Date(hap.mtime).toLocaleString() }}</div>
          </div>
          <el-button type="primary" size="small" @click="installHap(hap.path)">安装</el-button>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="deviceDialogVisible" title="添加无线鸿蒙设备">
      <el-form :model="ruleForm" :rules="rules" label-width="80px">
        <el-form-item label="">
          <el-icon class="text-warning">
            <warning />
          </el-icon>
          <span> 需到设置-开发者选项-开启无线调试</span>
        </el-form-item>
        <el-form-item label="设备IP" prop="ip">
          <el-input v-model="ruleForm.ip" clearable></el-input>
        </el-form-item>
        <el-form-item label="设备端口" prop="port">
          <el-input
            v-model="ruleForm.port"
            type="number"
            clearable
            @keyup.enter="addDevice"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deviceDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!ruleForm.ip || !ruleForm.port" @click="addDevice">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onActivated } from 'vue'
import { ElMessage } from 'element-plus'

interface AppPackage {
  name: string
  packageName: string
}

const devices = ref<string[]>([])
const selectedDevice = ref('')
const deviceChecking = ref(false)
const hapChecking = ref(false)
const deviceDialogVisible = ref(false)

const ruleForm = ref({
  ip: '192.168.',
  port: ''
})
const rules = ref({
  ip: [{ required: true, message: '请输入设备IP', trigger: 'blur' }],
  port: [{ required: true, message: '请输入设备端口', trigger: 'blur' }]
})
const logs = ref<{ time: string; content: string; type: 'info' | 'error' }[]>([])
const logViewerRef = ref<HTMLElement | null>(null)
const currentPackages = ref<AppPackage[]>([])
const customCommands = ref<{ name: string; command: string }[]>([])
const selectedPackages = ref<string[]>([])
const checkAll = ref(false)
const isIndeterminate = ref(false)

// Load settings from config
const loadSettings = async () => {
  try {
    const config = await window.electronAPI.getConfig()
    currentPackages.value = config.packages || []
    customCommands.value = config.customCommands || []
    // Default select all
    selectedPackages.value = currentPackages.value.map((p) => p.packageName)
    checkAll.value = true
    isIndeterminate.value = false
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
}

const handleCheckAllChange = (val: boolean) => {
  selectedPackages.value = val ? currentPackages.value.map((p) => p.packageName) : []
  isIndeterminate.value = false
}

const handleCheckedPackagesChange = (value: string[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === currentPackages.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < currentPackages.value.length
}

const refreshDevices = async () => {
  deviceChecking.value = true
  const res = await window.electronAPI.getDevices()
  deviceChecking.value = false
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
    case 'screenshot':
      addLog('正在截屏...')
      try {
        const res = await window.electronAPI.screenshot(selectedDevice.value)
        if (res.success) {
          addLog(`截屏成功: ${res.path}`)
        } else {
          addLog(`截屏失败: ${res.error}`, 'error')
        }
      } catch (e) {
        addLog(`截屏异常: ${e}`, 'error')
      }
      break
    case 'clean-data':
      if (selectedPackages.value.length === 0) return
      for (const pkgName of selectedPackages.value) {
        const pkg = currentPackages.value.find((p) => p.packageName === pkgName)
        if (!pkg) continue
        addLog(`正在清除 [${pkg.name}] 数据...`)
        await execute(`${prefix} bm clean -d -n ${pkgName}`)
      }
      break
    case 'clean-cache':
      if (selectedPackages.value.length === 0) return
      for (const pkgName of selectedPackages.value) {
        const pkg = currentPackages.value.find((p) => p.packageName === pkgName)
        if (!pkg) continue
        addLog(`正在清除 [${pkg.name}] 缓存...`)
        await execute(`${prefix} bm clean -c -n ${pkgName}`)
      }
      break
    case 'uninstall':
      if (selectedPackages.value.length === 0) return
      for (const pkgName of selectedPackages.value) {
        const pkg = currentPackages.value.find((p) => p.packageName === pkgName)
        if (!pkg) continue
        addLog(`正在卸载 [${pkg.name}] ...`)
        await execute(`${prefix} bm uninstall -n ${pkgName}`)
      }
      break
  }
}

const runCustomCommand = async (cmdTemplate: string) => {
  if (!selectedDevice.value) {
    ElMessage.warning('请先选择设备')
    return
  }

  let finalCmd = cmdTemplate
  if (cmdTemplate.startsWith('hdc ')) {
    finalCmd = cmdTemplate.replace('hdc ', `hdc -t ${selectedDevice.value} `)
  } else {
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

const foundHaps = ref<Array<{ path: string; mtime: Date; name: string }>>([])

const checkAppHap = async () => {
  hapChecking.value = true
  const res = await window.electronAPI.findAppHap()
  hapChecking.value = false
  if (res && res.length > 0) {
    foundHaps.value = res
  }
}

const installHap = async (path: string) => {
  if (!selectedDevice.value) {
    ElMessage.warning('请先选择设备')
    return
  }

  const cmd = `hdc -t ${selectedDevice.value} install -r "${path}"`
  await execute(cmd)
}

function scanHaps() {
  checkAppHap()
}

function openDeviceDialog() {
  deviceDialogVisible.value = true
}

async function addDevice() {
  // 关闭弹窗
  deviceDialogVisible.value = false
  // 通过hdc连接设备
  await execute(`tconn ${ruleForm.value.ip}:${ruleForm.value.port}`)
  // 刷新设备列表
  await refreshDevices()
}

onMounted(() => {
  checkAppHap()
  loadSettings()

  // Listen for config updates
  window.electronAPI.onConfigUpdated((config: any) => {
    currentPackages.value = config.packages || []
    customCommands.value = config.customCommands || []
    // Re-evaluate selection logic if needed, or just keep existing selection if valid?
    // For simplicity, reset selection to all or keep valid ones.
    // Let's keep valid ones.
    const newPkgNames = new Set(currentPackages.value.map((p) => p.packageName))
    selectedPackages.value = selectedPackages.value.filter((p) => newPkgNames.has(p))

    // Update checkAll state
    const checkedCount = selectedPackages.value.length
    checkAll.value = checkedCount > 0 && checkedCount === currentPackages.value.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < currentPackages.value.length
  })
})

onActivated(() => {
  refreshDevices()
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
  backdrop-filter: blur(var(--content-blur, 20px));
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.device-header {
  display: flex;
  align-items: center;
  gap: 4px;
}
.device-list {
  margin-bottom: 20px;
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
.hap-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}
.text-primary {
  color: var(--el-color-primary);
  cursor: pointer;
}
.hap-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.hap-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.hap-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-right: 10px;
}

.hap-name {
  font-weight: bold;
  font-size: 14px;
  color: var(--el-color-success);
}

.hap-path {
  font-size: 12px;
  color: #666;
  word-break: break-all;
  margin-bottom: 2px;
}

.hap-time {
  font-size: 12px;
  color: #999;
}

.package-selection {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.text-select {
  color: var(--el-text-color-primary);
  font-size: 14px;
  line-height: 12px;
}
.text-warning {
  color: var(--el-color-warning);
  margin-right: 4px;
}
</style>
