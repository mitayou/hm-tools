<template>
  <div class="app-container">
    <div class="title-bar">
      <div class="title">鸿蒙工具箱</div>
      <div class="window-controls">
        <div class="control-btn minimize" @click="minimize">
          <el-icon><Minus /></el-icon>
        </div>
        <div class="control-btn maximize" @click="maximize">
          <el-icon><FullScreen /></el-icon>
        </div>
        <div class="control-btn close" @click="close">
          <el-icon><Close /></el-icon>
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <div class="sidebar">
        <el-menu
          default-active="/"
          class="el-menu-vertical"
          :router="true"
          background-color="transparent"
          style="--el-menu-hover-bg-color: var(--el-color-primary-light-9)"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>常用功能</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, FullScreen, Close, HomeFilled, Setting } from '@element-plus/icons-vue'

const minimize = () => {
  window.electronAPI?.minimize()
}

const maximize = () => {
  window.electronAPI?.maximize()
}

const close = () => {
  window.electronAPI?.close()
}
</script>

<style scoped>
.app-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  box-shadow: inset 3px 3px 3px 0 rgba(255, 255, 255, 0.45), inset -3px -3px 3px 0 rgba(255, 255, 255, 0.45);
  inset: 0;
}

.title-bar {
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  -webkit-app-region: drag;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.window-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 30px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(0,0,0,0.1);
}

.control-btn.close:hover {
  background: #ff5f57;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  border-right: 1px solid rgba(0,0,0,0.05);
  background: rgba(255, 255, 255, 0.5);
}

.el-menu-vertical .el-menu-item.is-active {
  border-right: 2px solid var(--el-menu-active-color);
  backdrop-filter: blur(2px);
}
.el-menu-vertical {
  border-right: 0;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
