<template>
  <div class="app-container" :style="containerStyle">
    <div class="title-bar">
      <div class="title">鸿蒙工具箱</div>
      <div class="window-controls">
        <div class="control-btn skin" @click="openSkinSelector">
          <el-icon><Brush /></el-icon>
        </div>
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
          <el-menu-item index="/more">
            <el-icon><Menu /></el-icon>
            <span>更多功能</span>
          </el-menu-item>
          <el-menu-item index="/experimental">
            <el-icon><MagicStick /></el-icon>
            <span>实验功能</span>
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
            <KeepAlive>
              <component :is="Component" />
            </KeepAlive>
          </transition>
        </router-view>
      </div>
    </div>
    <SkinSelector v-model="skinDialogVisible" @change="handleSkinChange" />
  </div>
</template>

<script setup lang="ts">
import {
  Minus,
  FullScreen,
  Close,
  HomeFilled,
  Setting,
  Menu,
  MagicStick,
  Brush
} from '@element-plus/icons-vue'
import { ref, onMounted, computed, reactive } from 'vue'
import SkinSelector from './components/SkinSelector.vue'

const skinDialogVisible = ref(false)
const skinSettings = reactive({
  selected: 'default',
  blur: 20
})

// Load images from ../../skins/images
const rawSkinImages = import.meta.glob('@skins/images/*.{png,jpg,jpeg,svg}', {
  eager: true
}) as Record<string, { default: string }>

const skinMap = computed(() => {
  const map: Record<string, string> = {}
  for (const [path, mod] of Object.entries(rawSkinImages)) {
    const filename = path.split('/').pop() || path
    map[filename] = mod.default
  }
  return map
})

const containerStyle = computed(() => {
  const style: any = {
    '--content-blur': `${skinSettings.blur}px`
  }

  if (skinSettings.selected === 'transparent') {
    style.backgroundImage = 'none'
    style.boxShadow =
      'inset 3px 3px 3px 0 rgba(255, 255, 255, 0.45), inset -3px -3px 3px 0 rgba(255, 255, 255, 0.45)'
    style.backgroundColor = 'transparent' // Ensure transparency
  } else if (skinSettings.selected !== 'default' && skinMap.value[skinSettings.selected]) {
    style.backgroundImage = `url(${skinMap.value[skinSettings.selected]})`
    style.boxShadow = 'none' // Remove shadow when skin is active if desired, or keep it. Requirement says "transparent时...设置box-shadow", implying others might not need it or have different one.
    // Let's keep default shadow for default skin, but maybe remove for image skin?
    // The requirement is specific about transparent mode.
    // For now, I will unset box-shadow for image skins to let the image shine, or maybe keep it for depth.
    // Let's unset it for image skins to be safe, as usually skins cover the background.
  }

  return style
})

const openSkinSelector = () => {
  skinDialogVisible.value = true
}

const handleSkinChange = (settings: any) => {
  // This is called for live preview from selector
  skinSettings.selected = settings.skin
  skinSettings.blur = settings.blur
}

const loadConfig = async () => {
  try {
    const config = await window.electronAPI.getConfig()
    if (config.skin) {
      skinSettings.selected = config.skin.selected
      skinSettings.blur = config.skin.blur
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadConfig()
  window.electronAPI.onConfigUpdated((config: any) => {
    if (config.skin) {
      skinSettings.selected = config.skin.selected
      skinSettings.blur = config.skin.blur
    }
  })
})

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
  background-color: rgba(255, 255, 255, 0.5);
  background-size: cover;
  backdrop-filter: blur(20px);
  border-radius: 8px;
  overflow: hidden;
  box-shadow:
    inset 3px 3px 3px 0 rgba(255, 255, 255, 0.45),
    inset -3px -3px 3px 0 rgba(255, 255, 255, 0.45);
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
  backdrop-filter: blur(4px);
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
  background: rgba(0, 0, 0, 0.1);
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
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
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
  overflow-y: overlay;
  background: rgba(255, 255, 255, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
