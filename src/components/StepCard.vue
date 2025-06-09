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
        <button 
          class="action-btn"
          @click.stop="$emit('edit', step)"
          title="Edit step"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button 
          class="action-btn delete"
          @click.stop="$emit('delete', step.id)"
          title="Delete step"
        >
          <i class="fas fa-trash"></i>
        </button>
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
          <button 
            class="position-btn"
            @click.stop="$emit('move-up')"
            :disabled="index === 0"
            title="Move up"
          >
            <i class="fas fa-chevron-up"></i>
          </button>
          <button 
            class="position-btn"
            @click.stop="$emit('move-down')"
            title="Move down"
          >
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>
        
        <!-- Action Controls -->
        <div class="action-controls">
          <button 
            class="action-btn duration"
            @click.stop="showDurationEditor = true"
            title="Edit duration"
          >
            <i class="fas fa-clock"></i>
          </button>
          <button 
            class="action-btn edit"
            @click.stop="$emit('edit', step)"
            title="Edit step"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button 
            class="action-btn delete"
            @click.stop="$emit('delete', step.id)"
            title="Delete step"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Quick Duration Editor -->
      <div v-if="showDurationEditor" class="duration-editor">
        <div class="duration-input-group">
          <label>Duration:</label>
          <input 
            v-model.number="editDuration"
            type="number"
            min="1"
            max="600"
            class="duration-input"
            @keyup.enter="saveDuration"
            @keyup.escape="cancelDuration"
          />
          <span>min</span>
        </div>
        <div class="duration-actions">
          <button class="duration-btn cancel" @click="cancelDuration">
            <i class="fas fa-times"></i>
          </button>
          <button class="duration-btn save" @click="saveDuration">
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
const editDuration = ref(props.step.duration)

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
</script>

<style scoped>
.step-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.step-card.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.step-card.is-selected {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
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
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.action-btn:hover {
  background: var(--hover-bg);
  color: var(--text-light);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-alt);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.position-btn:active:not(:disabled) {
  transform: scale(0.9);
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.position-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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

.duration-input {
  flex: 1;
  padding: 0.375rem 0.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  color: var(--text-light);
  font-size: 0.875rem;
  text-align: center;
}

.duration-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.duration-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.duration-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.duration-btn.cancel {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.duration-btn.save {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.duration-btn:active {
  transform: scale(0.95);
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