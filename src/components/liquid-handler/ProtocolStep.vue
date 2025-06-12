<template>
  <div 
    class="protocol-step-card"
    :class="{ 
      'custom-step': step.source || step.destination,
      'dragging': isDragging,
      'active': isActive,
      'error': hasError,
      'warning': hasWarning
    }"
    :style="{ '--step-color': stepColor }"
    :draggable="isDraggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="$emit('step-clicked', step)"
  >
    <div class="step-icon">
      <i :class="iconClass"></i>
    </div>
    
    <div class="step-info">
      <div class="step-header">
        <span class="step-task">{{ step.task }}</span>
        <span class="step-index">#{{ stepIndex + 1 }}</span>
      </div>
      
      <!-- Transfer-specific info -->
      <div v-if="step.source || step.destination" class="transfer-info">
        <div v-if="step.source" class="transfer-detail">
          <i class="fas fa-arrow-right"></i>
          <span>{{ step.source }} → {{ step.destination || '?' }}</span>
        </div>
        <div v-if="step.volume" class="volume-info">
          <i class="fas fa-tint"></i>
          <span>{{ step.volume }}µL</span>
        </div>
      </div>
      
      <div class="step-duration">
        <i class="fas fa-clock"></i>
        <span>{{ step.duration }}min</span>
      </div>
    </div>
    
    <div class="step-actions">
      <button 
        v-if="showEditButton"
        class="action-btn edit-btn"
        @click.stop="$emit('edit-step', step)"
        title="Edit step"
      >
        <i class="fas fa-edit"></i>
      </button>
      
      <button 
        v-if="showRemoveButton"
        class="action-btn remove-btn"
        @click.stop="$emit('remove-step', step)"
        title="Remove step"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <!-- Validation indicators -->
    <div v-if="validationErrors.length > 0" class="validation-indicators">
      <el-tooltip
        v-for="error in validationErrors"
        :key="error.rule.id"
        :content="error.message"
        placement="top"
      >
        <div 
          class="validation-indicator"
          :class="error.type"
        >
          <i :class="error.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-exclamation-triangle'"></i>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LiquidHandlerStep, ValidationError } from '@/types/liquidHandler'
import { INSTRUMENT_ICONS, getInstrumentColor } from '@/constants/instruments'
import { useTheme } from '@/composables/useTheme'

interface Props {
  step: LiquidHandlerStep
  stepIndex: number
  isDraggable?: boolean
  isActive?: boolean
  showEditButton?: boolean
  showRemoveButton?: boolean
  validationErrors?: ValidationError[]
}

const props = withDefaults(defineProps<Props>(), {
  isDraggable: true,
  isActive: false,
  showEditButton: true,
  showRemoveButton: true,
  validationErrors: () => []
})

const emit = defineEmits<{
  'step-clicked': [step: LiquidHandlerStep]
  'edit-step': [step: LiquidHandlerStep]
  'remove-step': [step: LiquidHandlerStep]
  'drag-start': [event: DragEvent, step: LiquidHandlerStep]
}>()

const { currentTheme } = useTheme()
const isDragging = ref(false)

const iconClass = computed(() => {
  return INSTRUMENT_ICONS[props.step.type] || 'fas fa-cog'
})

const stepColor = computed(() => {
  if (props.step.color) return props.step.color
  return getInstrumentColor(props.step.type, currentTheme.value)
})

const hasError = computed(() => {
  return props.validationErrors.some(error => error.type === 'error')
})

const hasWarning = computed(() => {
  return props.validationErrors.some(error => error.type === 'warning')
})

const handleDragStart = (event: DragEvent) => {
  if (!props.isDraggable) return
  
  isDragging.value = true
  emit('drag-start', event, props.step)
  
  // Set drag data for reordering
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'protocol-step',
      stepId: props.step.id,
      stepIndex: props.stepIndex
    }))
  }
}

const handleDragEnd = () => {
  isDragging.value = false
}
</script>

<style scoped>
.protocol-step-card {
  background-color: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  position: relative;
  min-width: 200px;
  box-shadow: var(--shadow-sm);
  user-select: none;
}

.protocol-step-card:hover {
  border-color: var(--step-color, var(--primary-color));
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background-color: var(--hover-bg);
}

.protocol-step-card.active {
  border-color: var(--step-color, var(--primary-color));
  background-color: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
  box-shadow: var(--shadow-md);
}

.protocol-step-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: rotate(5deg);
}

.protocol-step-card.custom-step {
  border-style: solid;
  border-color: var(--step-color, var(--primary-color));
}

.protocol-step-card.error {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.1);
}

.protocol-step-card.warning {
  border-color: var(--warning-color);
  background-color: rgba(245, 158, 11, 0.1);
}

.step-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
  border-radius: var(--radius-md);
  font-size: 1.25rem;
  color: var(--step-color, var(--primary-color));
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.step-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-task {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-index {
  font-size: 0.75rem;
  color: var(--text-light);
  background: var(--section-bg);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.transfer-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.transfer-detail {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.transfer-detail i {
  color: var(--step-color, var(--primary-color));
  width: 10px;
}

.volume-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.volume-info i {
  color: var(--info-color);
  width: 10px;
}

.step-duration {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--step-color, var(--primary-color));
  font-weight: 500;
}

.step-duration i {
  width: 10px;
}

.step-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.protocol-step-card:hover .step-actions {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  padding: 0;
}

.edit-btn {
  background-color: var(--step-color, var(--primary-color));
  color: var(--button-text-dark);
}

.edit-btn:hover {
  background-color: var(--primary-dark);
  transform: scale(1.1);
}

.remove-btn {
  background-color: var(--error-color);
  color: var(--button-text-dark);
}

.remove-btn:hover {
  background-color: var(--error-color);
  transform: scale(1.1);
}

.validation-indicators {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  gap: 2px;
}

.validation-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  color: white;
  box-shadow: var(--shadow-sm);
}

.validation-indicator.error {
  background-color: var(--error-color);
}

.validation-indicator.warning {
  background-color: var(--warning-color);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .protocol-step-card {
    min-width: 160px;
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .step-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .step-task {
    font-size: 0.8rem;
  }
  
  .step-index,
  .transfer-detail,
  .volume-info,
  .step-duration {
    font-size: 0.7rem;
  }
  
  .step-actions {
    opacity: 1; /* Always show on mobile */
  }
}

/* Theme compatibility */
.protocol-step-card {
  --step-color: var(--primary-color);
}

/* Smooth theme transitions */
.protocol-step-card,
.protocol-step-card * {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease, 
              color 0.3s ease;
}
</style>