<template>
  <div class="experimental-container">
    <el-card class="exp-card">
      <template #header>
        <div class="card-header">
          <span>实验性功能</span>
          <el-tag type="danger" size="small">实验功能</el-tag>
        </div>
      </template>
      <div class="exp-content">
        <el-empty v-if="false" description="更多实验性功能开发中..." />

        <div class="exp-list">
          <div class="exp-item">
            <div class="exp-info">
              <span class="exp-title">屏幕截图 (UITest)</span>
              <span class="exp-desc">使用 uitest 截图 (hdc shell uitest screenCap)</span>
            </div>
            <el-button type="primary" @click="runScreenCap">截图</el-button>
          </div>

          <div class="exp-item">
            <div class="exp-info">
              <span class="exp-title">UI操作录制</span>
              <span class="exp-desc">录制屏幕操作 (hdc shell uitest uiRecord record)</span>
            </div>
            <el-button type="danger" @click="runUiRecord">开始录制</el-button>
          </div>

          <div class="exp-item">
            <div class="exp-info">
              <span class="exp-title">系统信息转储</span>
              <span class="exp-desc">hdc shell hidumper</span>
            </div>
            <el-button type="warning" @click="runHidumper">执行</el-button>
          </div>

          <div class="exp-item">
            <div class="exp-info">
              <span class="exp-title">挂载系统读写</span>
              <span class="exp-desc">hdc shell mount -o remount,rw /</span>
            </div>
            <el-button type="danger" @click="runMountRw">挂载RW</el-button>
          </div>

          <div class="exp-item">
            <div class="exp-info">
              <span class="exp-title">高级重启</span>
              <span class="exp-desc">重启到不同模式</span>
            </div>
            <div class="exp-actions">
              <el-button type="info" size="small" @click="runReboot('bootloader')"
                >Bootloader</el-button
              >
              <el-button type="info" size="small" @click="runReboot('recovery')"
                >Recovery</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </el-card>

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

const output = ref('')

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

const runScreenCap = async () => {
  await execute('shell uitest screenCap -p /data/local/tmp/screen.png')
  appendOutput('Screenshot saved to /data/local/tmp/screen.png. Use "File Recv" to pull it.')
}

const runUiRecord = async () => {
  appendOutput(
    'Starting UI Record... Press Ctrl+C in terminal to stop (Not fully supported in GUI yet)'
  )
  await execute('shell uitest uiRecord record')
}

const runHidumper = async () => {
  await execute('shell hidumper')
}

const runMountRw = async () => {
  await execute('shell mount -o remount,rw /')
}

const runReboot = async (mode: string) => {
  await execute(`target boot -${mode}`)
}
</script>

<style scoped>
.experimental-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exp-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: none;
}

.exp-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exp-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.exp-info {
  display: flex;
  flex-direction: column;
}

.exp-title {
  font-weight: bold;
  font-size: 16px;
}

.exp-desc {
  font-size: 12px;
  color: #666;
}

.exp-actions {
  display: flex;
  gap: 10px;
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
}
</style>
