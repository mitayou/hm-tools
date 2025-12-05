<template>
  <el-dialog
    v-model="visible"
    title="皮肤设置"
    width="500px"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="skin-selector">
      <div class="section-title">背景皮肤</div>
      <div class="skin-grid">
        <!-- Transparent Option -->
        <div
          class="skin-item"
          :class="{ active: selectedSkin === 'transparent' }"
          @click="selectSkin('transparent')"
        >
          <div class="skin-preview transparent-preview">
            <span>透明</span>
          </div>
          <div class="skin-name">透明模式</div>
        </div>

        <!-- Image Options -->
        <div
          v-for="(path, name) in skinMap"
          :key="name"
          class="skin-item"
          :class="{ active: selectedSkin === name }"
          @click="selectSkin(name)"
        >
          <div class="skin-preview">
            <img :src="path" alt="skin" />
          </div>
          <div class="skin-name">{{ getFileName(name) }}</div>
        </div>
      </div>

      <div class="section-title mt-4">模糊度调节 ({{ blurValue }}px)</div>
      <div class="blur-control">
        <el-slider
          v-model="blurValue"
          :min="0"
          :max="50"
          :show-tooltip="false"
          @input="handleBlurChange"
        />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <!-- <el-button @click="visible = false">关闭</el-button> -->
        <el-button type="primary" @click="saveSettings"> 保存并应用 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedSkin = ref('default')
const blurValue = ref(20)

// Load images from ../../../skins/images
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

function getFileName(fileName: string) {
  return fileName.split('.')[0]
}
const selectSkin = (skin: string) => {
  selectedSkin.value = skin
  applyPreview()
}

const handleBlurChange = () => {
  applyPreview()
}

const applyPreview = () => {
  emit('change', {
    skin: selectedSkin.value,
    blur: blurValue.value,
    skinPath:
      selectedSkin.value !== 'transparent' && selectedSkin.value !== 'default'
        ? skinMap.value[selectedSkin.value]
        : null
  })
}

const saveSettings = async () => {
  try {
    const config = await window.electronAPI.getConfig()
    const newConfig = {
      ...config,
      skin: {
        selected: selectedSkin.value,
        blur: blurValue.value
      }
    }
    await window.electronAPI.saveConfig(newConfig)
    ElMessage.success('设置已保存')
    visible.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  }
}

// Initialize with current settings
const init = async () => {
  try {
    const config = await window.electronAPI.getConfig()
    if (config.skin) {
      selectedSkin.value = config.skin.selected || 'default'
      blurValue.value = config.skin.blur || 20
    }
  } catch (error) {
    console.error(error)
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      init()
    }
  }
)
</script>

<style scoped>
.skin-selector {
  padding: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.mt-4 {
  margin-top: 20px;
}

.skin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px 0;
}

.skin-item {
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.skin-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.skin-item.active {
  border-color: var(--el-color-primary);
}

.skin-preview {
  height: 60px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.skin-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.transparent-preview {
  background:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-color: #fff;
}

.skin-name {
  font-size: 12px;
  text-align: center;
  padding: 4px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.blur-control {
  padding: 0 10px;
}
</style>
