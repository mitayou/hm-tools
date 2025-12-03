<script setup lang="ts">
import Versions from './components/Versions.vue'

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <img alt="logo" class="logo" src="./assets/electron.svg" />
  <div class="creator">HM 工具</div>
  <div class="text">
    使用以下工具构建 Electron 应用
    <span class="vue">Vue</span>
    和
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">请尝试按 <code>F12</code> 打开开发者工具</p>
  <div class="actions">
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">发送 IPC</a>
    </div>
  </div>
  <Versions />
</template>
