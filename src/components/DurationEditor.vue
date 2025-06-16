<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="400px"
    :before-close="handleClose"
    class="duration-editor-dialog"
  >
    <div class="duration-editor">
      <div class="task-preview">
        <div class="preview-icon">
          <i :class="taskIcon"></i>
        </div>
        <div class="preview-info">
          <h4>{{ task?.type || 'Task' }}</h4>
          <p>{{ task?.task || 'Unknown Task' }}</p>
        </div>
      </div>
      
      <div class="duration-input-group">
        <label for="duration-input">Duration (minutes)</label>
        <div class="input-wrapper">
          <el-input-number
            id="duration-input"
            v-model="editedDuration"
            :min="1"
            :max="999"
            :step="1"
            size="large"
            @keyup.enter="handleSave"
          />
          <div class="duration-hints">
            <el-button
              v-for="hint in durationHints" 
              :key="hint"
              class="hint-btn"
              type="info"
              size="small"
              @click="editedDuration = hint"
            >
              {{ hint }}min
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="duration-comparison" v-if="originalDuration !== editedDuration">
        <span class="comparison-label">Change:</span>
        <span class="original-duration">{{ originalDuration }}min</span>
        <i class="fas fa-arrow-right"></i>
        <span class="new-duration">{{ editedDuration }}min</span>
        <span class="duration-diff" :class="durationDiffClass">
          ({{ durationDiffText }})
        </span>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">Cancel</el-button>
      <el-button type="primary" @click="handleSave" :disabled="!isValid">
        Save
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { InstrumentTask } from '@/types/workflow'
import { INSTRUMENT_ICONS, DEFAULT_DURATIONS } from '@/constants/instruments'

interface Props {
  visible: boolean
  task: InstrumentTask | null
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: undefined
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'save': [duration: number]
  'cancel': []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const editedDuration = ref(1)
const originalDuration = ref(1)

// Common duration hints based on task type
const durationHints = computed(() => {
  if (!props.task) return [5, 15, 30, 60]
  
  const defaultDuration = DEFAULT_DURATIONS[props.task.type] || 15
  const hints = new Set([5, 10, 15, 30, 60, defaultDuration])
  
  return Array.from(hints).sort((a, b) => a - b).slice(0, 5)
})

const dialogTitle = computed(() => {
  if (!props.task) return 'Edit Duration'
  return `Edit Duration: ${props.task.type} - ${props.task.task}`
})

const taskIcon = computed(() => {
  if (!props.task) return 'fas fa-clock'
  return props.task.customIcon || INSTRUMENT_ICONS[props.task.type] || 'fas fa-cog'
})

const isValid = computed(() => {
  return editedDuration.value >= 1 && editedDuration.value <= 999
})

const durationDiff = computed(() => {
  return editedDuration.value - originalDuration.value
})

const durationDiffClass = computed(() => {
  if (durationDiff.value > 0) return 'increase'
  if (durationDiff.value < 0) return 'decrease'
  return ''
})

const durationDiffText = computed(() => {
  const diff = durationDiff.value
  if (diff > 0) return `+${diff}min`
  if (diff < 0) return `${diff}min`
  return 'no change'
})

// Initialize duration when dialog opens
watch(() => props.visible, (newVal) => {
  if (newVal && props.task) {
    originalDuration.value = props.duration ?? props.task.duration
    editedDuration.value = originalDuration.value
  }
})

const handleSave = () => {
  if (isValid.value) {
    emit('save', editedDuration.value)
    dialogVisible.value = false
  }
}

const handleClose = () => {
  emit('cancel')
  dialogVisible.value = false
}
</script>

<style scoped>
.duration-editor {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.task-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-color);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.preview-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--card-bg);
  border-radius: 0.5rem;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.preview-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-light);
  font-size: 1rem;
}

.preview-info p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.duration-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.duration-input-group label {
  font-weight: 500;
  color: var(--text-light);
  font-size: 0.875rem;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number__increase),
:deep(.el-input-number__decrease) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-light);
}

:deep(.el-input-number__increase:hover),
:deep(.el-input-number__decrease:hover) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.duration-hints {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.hint-btn {
  font-size: 0.875rem;
}

.duration-comparison {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--bg-color);
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.comparison-label {
  color: var(--text-muted);
  font-weight: 500;
}

.original-duration {
  color: var(--text-muted);
  text-decoration: line-through;
}

.new-duration {
  color: var(--primary-color);
  font-weight: 600;
}

.duration-diff {
  font-weight: 500;
}

.duration-diff.increase {
  color: var(--warning-color);
}

.duration-diff.decrease {
  color: var(--success-color);
}

/* Dialog customization */
:deep(.duration-editor-dialog .el-dialog__header) {
  background-color: var(--section-bg);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

:deep(.duration-editor-dialog .el-dialog__title) {
  color: var(--text-light);
  font-size: 1.125rem;
}

:deep(.duration-editor-dialog .el-dialog__body) {
  background-color: var(--card-bg);
  padding: 1.5rem;
}

:deep(.duration-editor-dialog .el-dialog__footer) {
  background-color: var(--card-bg);
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}
</style>