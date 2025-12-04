<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>基础配置</span>
        </div>
      </template>
      <el-form label-width="100px">
        <el-form-item label="应用包名">
          <el-input
            v-model="packageName"
            placeholder="例如: com.pagoda.hm.buy"
            @change="saveSettings"
          />
          <div class="tips">用于清除数据和缓存命令</div>
        </el-form-item>
      </el-form>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const packageName = ref('')
const customCommands = ref<{ name: string; command: string }[]>([])

const loadSettings = () => {
  packageName.value = localStorage.getItem('hm_package_name') || ''
  const cmds = localStorage.getItem('hm_custom_commands')
  if (cmds) {
    customCommands.value = JSON.parse(cmds)
  } else {
    // Default custom commands if empty
    customCommands.value = [{ name: '查看内存', command: 'hdc shell dumpsys meminfo' }]
  }
}

const saveSettings = () => {
  localStorage.setItem('hm_package_name', packageName.value)
  localStorage.setItem('hm_custom_commands', JSON.stringify(customCommands.value))
}

const addCommand = () => {
  customCommands.value.push({ name: '', command: 'hdc shell ' })
}

const removeCommand = (index: number) => {
  customCommands.value.splice(index, 1)
  saveSettings()
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

.tips {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.package-config {
  width: 100%;
}

.add-package {
  display: flex;
  gap: 10px;
}
</style>
