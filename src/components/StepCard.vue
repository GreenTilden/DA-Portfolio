<template>
  <div 
    class="step-card"
    :class="{ 
      'is-editable': isEditable,
      'is-mobile': isMobile,
      'is-dragging': isDragging,
      'is-selected': isSelected
    }"
  >
    <!-- Desktop Layout -->
    <div v-if="!isMobile" class="step-card-desktop">
      <div 
        class="step-icon"
        :style="{ 
          backgroundColor: instrumentColor, 
          color: instrumentTextColor 
        }"
      >
        <i :class="getStepIcon(step)"></i>
      </div>
      
      <div class="step-content">
        <div class="step-header">
          <span class="step-type">{{ step.type }}</span>
          <span class="step-index">#{{ index + 1 }}</span>
        </div>
        <div class="step-task">{{ step.task }}</div>
        <div class="step-duration">
          <i class="fas fa-clock"></i>
          <span>{{ step.duration }}min</span>
        </div>
      </div>
      
      <div v-if="isEditable" class="step-actions">
        <el-button
          class="action-btn"
          type="info"
          size="small"
          circle
          @click.stop="openFullEditor"
          title="Edit step"
        >
          <i class="fas fa-edit"></i>
        </el-button>
        <el-button
          class="action-btn delete"
          type="danger"
          size="small"
          circle
          @click.stop="$emit('delete', step.id)"
          title="Delete step"
        >
          <i class="fas fa-trash"></i>
        </el-button>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div v-else class="step-card-mobile">
      <div class="mobile-step-header">
        <div 
          class="step-icon"
          :style="{ 
            backgroundColor: instrumentColor, 
            color: instrumentTextColor 
          }"
        >
          <i :class="getStepIcon(step)"></i>
        </div>
        
        <div class="step-info">
          <div class="step-meta">
            <span class="step-type">{{ step.type }}</span>
            <span class="step-duration">{{ step.duration }}min</span>
          </div>
          <div class="step-task">{{ step.task }}</div>
        </div>
        
        <div 
          class="step-index-badge"
          :style="{ 
            backgroundColor: instrumentColor, 
            color: instrumentTextColor 
          }"
        >
          #{{ index + 1 }}
        </div>
      </div>
      
      <div v-if="isEditable" class="mobile-controls">
        <!-- Position Controls -->
        <div class="position-controls">
          <el-button
            class="position-btn"
            type="info"
            size="small"
            @click.stop="$emit('move-up')"
            :disabled="index === 0"
            title="Move up"
          >
            <i class="fas fa-chevron-up"></i>
          </el-button>
          <el-button
            class="position-btn"
            type="info"
            size="small"
            @click.stop="$emit('move-down')"
            title="Move down"
          >
            <i class="fas fa-chevron-down"></i>
          </el-button>
        </div>
        
        <!-- Action Controls -->
        <div class="action-controls">
          <el-button
            class="action-btn duration"
            type="primary"
            size="small"
            circle
            @click.stop="showDurationEditor = true"
            title="Edit duration"
          >
            <i class="fas fa-clock"></i>
          </el-button>
          <el-button
            class="action-btn edit"
            type="warning"
            size="small"
            circle
            @click.stop="openFullEditor"
            title="Edit step"
          >
            <i class="fas fa-edit"></i>
          </el-button>
          <el-button
            class="action-btn delete"
            type="danger"
            size="small"
            circle
            @click.stop="$emit('delete', step.id)"
            title="Delete step"
          >
            <i class="fas fa-trash"></i>
          </el-button>
        </div>
      </div>

      <!-- Quick Duration Editor -->
      <div v-if="showDurationEditor" class="duration-editor">
        <div class="duration-input-group">
          <label>Duration:</label>
          <el-input-number 
            v-model="editDuration"
            :min="1"
            :max="600"
            class="duration-input"
            size="small"
            @keyup.enter="saveDuration"
            @keyup.escape="cancelDuration"
          />
          <span>min</span>
        </div>
        <div class="duration-actions">
          <el-button
            class="duration-btn cancel"
            type="danger"
            size="small"
            circle
            @click="cancelDuration"
          >
            <i class="fas fa-times"></i>
          </el-button>
          <el-button
            class="duration-btn save"
            type="success"
            size="small"
            circle
            @click="saveDuration"
          >
            <i class="fas fa-check"></i>
          </el-button>
        </div>
      </div>
    </div>

    <!-- Inline Edit Mode -->
    <div v-if="showFullEditor" class="step-edit-mode">
      <div class="edit-overlay"></div>
      
      <div class="edit-content">
        <!-- Quick Task Edit -->
        <div class="edit-field">
          <el-input 
            v-model="editTask"
            class="edit-input task-input"
            placeholder="Task name"
            @keyup.enter="saveFullEdit"
            @keyup.escape="cancelFullEdit"
            ref="taskInput"
          />
        </div>
        
        <!-- Transfer Name (only for Liquid Handler Transfer) -->
        <div v-if="isLiquidHandlerTransfer" class="edit-field">
          <el-input 
            v-model="editTransferName"
            class="edit-input transfer-input"
            placeholder="Connection name"
            @keyup.enter="saveFullEdit"
            @keyup.escape="cancelFullEdit"
          />
        </div>
        
        <!-- Duration Edit -->
        <div class="edit-field duration-field">
          <el-input-number 
            v-model="editDuration"
            :min="1"
            :max="600"
            class="edit-input duration-input"
            size="small"
            @keyup.enter="saveFullEdit"
            @keyup.escape="cancelFullEdit"
          />
          <span class="duration-label">min</span>
        </div>
        
        <!-- Edit Actions -->
        <div class="edit-actions">
          <el-button
            class="edit-btn cancel"
            type="danger"
            size="small"
            circle
            @click="cancelFullEdit"
            title="Cancel"
          >
            <i class="fas fa-times"></i>
          </el-button>
          <el-button
            class="edit-btn save"
            type="success"
            size="small"
            circle
            @click="saveFullEdit"
            title="Save"
          >
            <i class="fas fa-check"></i>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { Step } from '@/types/workflow'
import { INSTRUMENT_ICONS, getInstrumentColor, getInstrumentTextColor } from '@/constants/instruments'
import { useTheme } from '@/composables/useTheme'

interface Props {
  step: Step
  index: number
  isEditable?: boolean
  isMobile?: boolean
  isDragging?: boolean
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditable: false,
  isMobile: false,
  isDragging: false,
  isSelected: false
})

const emit = defineEmits<{
  edit: [step: Step]
  delete: [stepId: string]
  'duration-change': [stepId: string, newDuration: number]
  'task-change': [stepId: string, newTask: string]
  'transfer-name-change': [stepId: string, transferName: string]
  'move-up': []
  'move-down': []
}>()

// Theme integration
const { currentTheme } = useTheme()

// Map application themes to instrument color schemes
const themeColorMapping = {
  'forest': 'naturals',
  'ocean': 'blues',
  'monochrome': 'monochrome',
  'purdue': 'default',
  'pacers': 'default'
} as const

// Reactive state
const showDurationEditor = ref(false)
const showFullEditor = ref(false)
const editDuration = ref(props.step.duration)
const editTask = ref(props.step.task)
const editTransferName = ref(props.step.transferName || '')

// Template refs
const taskInput = ref<HTMLInputElement>()

// Computed instrument colors
const instrumentColor = computed(() => {
  const colorScheme = themeColorMapping[currentTheme.value as keyof typeof themeColorMapping] || 'default'
  return getInstrumentColor(props.step.type, colorScheme)
})

const instrumentTextColor = computed(() => {
  const colorScheme = themeColorMapping[currentTheme.value as keyof typeof themeColorMapping] || 'default'
  return getInstrumentTextColor(props.step.type, colorScheme)
})

// Methods
const getStepIcon = (step: Step) => {
  if (step.customIcon) return step.customIcon
  return INSTRUMENT_ICONS[step.type] || 'fas fa-cog'
}

// Check if this is a liquid handler transfer task
const isLiquidHandlerTransfer = computed(() => {
  return props.step.type === 'Liquid Handler' && 
         props.step.task.toLowerCase().includes('transfer')
})

const saveDuration = () => {
  if (editDuration.value && editDuration.value !== props.step.duration) {
    emit('duration-change', props.step.id, editDuration.value)
  }
  showDurationEditor.value = false
}

const cancelDuration = () => {
  editDuration.value = props.step.duration
  showDurationEditor.value = false
}

const openFullEditor = async () => {
  editTask.value = props.step.task
  editTransferName.value = props.step.transferName || ''
  showFullEditor.value = true
  
  // Focus the task input after the popover appears
  await nextTick()
  taskInput.value?.focus()
}

const saveFullEdit = () => {
  if (editDuration.value !== props.step.duration) {
    emit('duration-change', props.step.id, editDuration.value)
  }
  
  if (editTask.value !== props.step.task) {
    emit('task-change', props.step.id, editTask.value)
  }
  
  if (isLiquidHandlerTransfer.value && editTransferName.value !== (props.step.transferName || '')) {
    emit('transfer-name-change', props.step.id, editTransferName.value)
  }
  
  showFullEditor.value = false
}

const cancelFullEdit = () => {
  editDuration.value = props.step.duration
  editTask.value = props.step.task
  editTransferName.value = props.step.transferName || ''
  showFullEditor.value = false
}
</script>

<style scoped>
.step-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  transform-origin: center;
}

.step-card.is-dragging {
  opacity: 0.6;
  transform: scale(0.98) rotate(1deg);
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.step-card.is-selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
  transform: scale(1.02);
}

.step-card:not(.is-dragging) {
  will-change: transform;
}

/* Desktop Layout */
.step-card-desktop {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.step-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 1.125rem;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.step-type {
  font-weight: 500;
  color: var(--text-light);
  font-size: 0.875rem;
}

.step-index {
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--background-alt);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.step-task {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 0.375rem;
  line-height: 1.2;
}

.step-duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.step-duration i {
  font-size: 0.625rem;
  color: var(--primary-color);
}

.step-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  font-size: 0.75rem;
}

/* Mobile Layout */
.step-card-mobile {
  padding: 0.75rem;
}

.mobile-step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.step-index-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.mobile-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-light);
}

.position-controls,
.action-controls {
  display: flex;
  gap: 0.25rem;
}

.position-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  font-size: 0.875rem;
}

.position-btn:active:not(:disabled) {
  transform: scale(0.9);
}

.action-btn.duration {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  border-color: rgba(var(--primary-color-rgb), 0.3);
}

.action-btn.edit {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}

/* Duration Editor */
.duration-editor {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--background-alt);
  border-radius: 6px;
  border: 1px solid var(--border-light);
}

.duration-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.duration-input-group label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Element Plus input theming */
:deep(.duration-input .el-input-number__decrease),
:deep(.duration-input .el-input-number__increase) {
  background: var(--background-alt);
  border-color: var(--border-light);
}

:deep(.duration-input .el-input__inner) {
  background: var(--card-bg);
  border-color: var(--border-light);
  color: var(--text-light);
  text-align: center;
}

.duration-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.duration-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  font-size: 0.875rem;
}

.duration-btn:active {
  transform: scale(0.95);
}

/* Inline Edit Mode */
.step-edit-mode {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 8px;
  overflow: hidden;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--primary-color-rgb), 0.1);
  backdrop-filter: blur(1px);
}

.edit-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.75rem;
  gap: 0.5rem;
  background: var(--card-bg);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
}

.edit-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-field.duration-field {
  justify-content: flex-start;
}

/* Element Plus input styling for edit mode */
:deep(.edit-input .el-input__inner) {
  background: var(--background-alt);
  border-color: var(--border-light);
  color: var(--text-light);
  font-size: 0.875rem;
}

:deep(.edit-input .el-input__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.task-input {
  font-weight: 500;
}

.transfer-input {
  font-size: 0.8125rem;
}

:deep(.duration-input) {
  width: 60px;
}

:deep(.duration-input .el-input__inner) {
  text-align: center;
}

.duration-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  min-width: 25px;
}

.edit-actions {
  display: flex;
  gap: 0.375rem;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.edit-btn {
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  font-size: 0.75rem;
}

/* Hover states for desktop */
@media (hover: hover) {
  .step-card:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  .step-card.is-editable:hover {
    border-color: var(--primary-color);
  }
}

/* Mobile-specific touch styles */
@media (max-width: 768px) {
  .step-card-desktop {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .step-actions {
    align-self: flex-end;
  }
  
  /* Mobile edit mode adjustments */
  .edit-content {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .edit-field {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .edit-field.duration-field {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }
  
  :deep(.edit-input .el-input__inner) {
    padding: 0.5rem;
    font-size: 1rem;
  }
  
  :deep(.duration-input) {
    width: 80px;
  }
}

/* Touch feedback */
.touch-device .step-card {
  -webkit-tap-highlight-color: transparent;
}

.touch-device .action-btn:active,
.touch-device .position-btn:active,
.touch-device .duration-btn:active {
  transform: scale(0.9);
}
</style>