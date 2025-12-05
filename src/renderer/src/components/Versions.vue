<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

const appVersion = ref('获取中...')
const versions = reactive({ ...window.electron.process.versions })

onMounted(async () => {
  const version = await window.electronAPI.getVersion()
  appVersion.value = version
})
</script>

<template>
  <div class="versions">
    <el-tag type="info">{{ appVersion }}</el-tag>
    <el-tag>Electron v{{ versions.electron }}</el-tag>
    <el-tag type="success">Chromium v{{ versions.chrome }}</el-tag>
    <el-tag>Node v{{ versions.node }}</el-tag>
    <el-tag type="warning">V8 v{{ versions.v8 }}</el-tag>
  </div>
</template>

<style scoped>
.versions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
