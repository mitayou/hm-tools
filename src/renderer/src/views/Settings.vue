<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>应用包名配置</span>
          <el-button type="primary" size="small" @click="addPackage">添加包名</el-button>
        </div>
      </template>
      <el-table :data="packages" style="width: 100%">
        <el-table-column prop="name" label="应用名称" width="150">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="应用名称" @change="saveSettings" />
          </template>
        </el-table-column>
        <el-table-column prop="packageName" label="包名">
          <template #default="scope">
            <el-input
              v-model="scope.row.packageName"
              placeholder="例如: com.example.app"
              @change="saveSettings"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button type="danger" link @click="removePackage(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="tips">配置的包名将用于“常用功能-应用操作-选择安装包”中的清除数据和缓存操作</div>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>自定义命令</span>
          <el-button type="primary" size="small" @click="addCommand">添加命令</el-button>
        </div>
      </template>

      <el-table :data="customCommands" style="width: 100%">
        <el-table-column prop="name" label="功能名称" width="150">
          <template #default="scope">
            <el-input v-model="scope.row.name" placeholder="名称" @change="saveSettings" />
          </template>
        </el-table-column>
        <el-table-column prop="command" label="命令行 (hdc开头)">
          <template #default="scope">
            <el-input
              v-model="scope.row.command"
              placeholder="hdc shell ..."
              @change="saveSettings"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button type="danger" link @click="removeCommand(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>关于</span>
          <el-button size="small" @click="checkUpdate">检查更新</el-button>
        </div>
      </template>

      <Versions />
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>开发者工具</span>
        </div>
      </template>
      <el-button type="default" size="small" @click="openDevTools">打开调试</el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Versions from '@renderer/components/Versions.vue'

const packages = ref<{ name: string; packageName: string }[]>([])
const customCommands = ref<{ name: string; command: string }[]>([])

const loadSettings = async () => {
  try {
    const config = await window.electronAPI.getConfig()
    packages.value = config.packages || []
    customCommands.value = config.customCommands || []
  } catch (error) {
    console.error('Failed to load settings:', error)
    ElMessage.error('加载配置失败')
  }
}

const saveSettings = async () => {
  // Validate unique package names if needed, but for now just save
  // Requirement: "包名不可以重复" - let's add a check before saving or just warn?
  // Real-time validation might be annoying. Let's just save.
  // But strictly, we should check duplicates.

  const pkgNames = new Set()
  for (const p of packages.value) {
    if (p.packageName && pkgNames.has(p.packageName)) {
      ElMessage.warning(`包名 ${p.packageName} 重复，请修改`)
      return
    }
    pkgNames.add(p.packageName)
  }

  try {
    await window.electronAPI.saveConfig({
      packages: JSON.parse(JSON.stringify(packages.value)),
      customCommands: JSON.parse(JSON.stringify(customCommands.value))
    })
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('保存配置失败')
  }
}

const addPackage = () => {
  packages.value.push({ name: '', packageName: '' })
}

const removePackage = (index: number) => {
  packages.value.splice(index, 1)
  saveSettings()
}

const addCommand = () => {
  customCommands.value.push({ name: '', command: 'hdc shell ' })
}

const removeCommand = (index: number) => {
  customCommands.value.splice(index, 1)
  saveSettings()
}

function checkUpdate() {
  ElMessage.success('敬请期待')
}

function openDevTools() {
  window.electronAPI.openDevTools()
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tips {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}
</style>
