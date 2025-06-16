<template>
  <div 
    class="workflow-step"
    :class="{ 
      'liquid-handler': step.type === 'Liquid Handler',
      'connected': isConnectedLiquidHandler,
      'dragging': isDragging 
    }"
    :data-step-id="step.id"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="step-icon">
      <i :class="iconClass"></i>
    </div>
    <div class="step-content">
      <span class="step-name">{{ step.task || step.type }}</span>
      <span class="step-duration">{{ step.duration }}min</span>
    </div>
    <div class="step-actions">
      <el-button
        class="action-btn edit-btn"
        type="primary"
        size="small"
        circle
        @click.stop="$emit('edit-duration', step)"
        title="Edit duration"
      >
        <i class="fas fa-clock"></i>
      </el-button>
      <el-button
        class="action-btn remove-btn"
        type="danger"
        size="small"
        circle
        @click.stop="$emit('remove')"
        title="Remove step"
      >
        <i class="fas fa-times"></i>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { Step } from '@/types/workflow'
import { INSTRUMENT_ICONS } from '@/constants/instruments'

interface Props {
  step: Step
  stepIndex: number
  workflowId?: string
  laneId?: string
}

const isConnectedLiquidHandler = computed(() => {
  return props.step.type === 'Liquid Handler' && 
         props.step.task.toLowerCase().includes('transfer')
})

const props = defineProps<Props>()

const emit = defineEmits<{
  'remove': []
  'edit-duration': [step: Step]
  'drag-start': [event: DragEvent, step: Step]
}>()

const isDragging = ref(false)

// Inject drag and touch handlers from parent
const dragHandlers = inject<any>('dragHandlers')
const touchHandlers = inject<any>('touchHandlers')

const iconClass = computed(() => {
  return props.step.customIcon || INSTRUMENT_ICONS[props.step.type] || 'fas fa-cog'
})

const handleDragStart = (event: DragEvent) => {
  if (!event.dataTransfer || !dragHandlers) return
  
  isDragging.value = true
  
  const dragData = {
    ...props.step,
    isExistingStep: true,
    sourceWorkflowId: props.workflowId,
    sourceLaneId: props.laneId,
    sourceIndex: props.stepIndex
  }
  
  // Set drag data with multiple formats for better compatibility
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('application/json', JSON.stringify(dragData))
  event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
  
  // Use injected drag handler
  dragHandlers.handleDragStart(dragData, event.target as HTMLElement)
  
  emit('drag-start', event, props.step)
}

const handleDragEnd = () => {
  isDragging.value = false
}

// Touch event handlers using unified system
const handleTouchStart = (event: TouchEvent) => {
  if (!touchHandlers) {
    console.warn('Touch handlers not available for workflow step')
    return
  }
  if (!dragHandlers) {
    console.warn('Drag handlers not available for workflow step')
    return
  }
  
  isDragging.value = true
  
  const dragData = {
    ...props.step,
    isExistingStep: true,
    sourceWorkflowId: props.workflowId,
    sourceLaneId: props.laneId,
    sourceIndex: props.stepIndex
  }
  
  touchHandlers.handleTouchStart(event, dragData, event.currentTarget as HTMLElement)
}

const handleTouchMove = (event: TouchEvent) => {
  if (!touchHandlers) return
  touchHandlers.handleTouchMove(event)
}

const handleTouchEnd = (event: TouchEvent) => {
  if (!touchHandlers) return
  touchHandlers.handleTouchEnd(event)
  isDragging.value = false
}
</script>

<style scoped>
.workflow-step {
  background-color: var(--primary-color);
  color: white;
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  cursor: move;
  position: relative;
  min-width: 120px;
  transition: all 0.2s ease;
  touch-action: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.workflow-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.workflow-step.dragging {
  opacity: 0.5;
  cursor: grabbing;
  transform: scale(0.95);
}

/* Mobile touch feedback */
@media (max-width: 768px) {
  .workflow-step {
    /* Add subtle touch feedback */
    transition: all 0.2s ease, background-color 0.1s ease;
  }
  
  .workflow-step:active {
    background-color: var(--primary-dark);
    transform: scale(0.98);
  }
  
  /* Visual cue for potential drag */
  .workflow-step::after {
    content: '';
    position: absolute;
    top: 2px;
    right: 2px;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .workflow-step:active::after {
    opacity: 1;
  }
}

.workflow-step.liquid-handler {
  background-color: var(--secondary-color);
}

.workflow-step.liquid-handler::after {
  content: '';
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background-color: var(--warning-color);
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.workflow-step.liquid-handler.connected::after {
  opacity: 1;
}

.step-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.step-name {
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-duration {
  font-size: 0.75rem;
  opacity: 0.9;
}

.step-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.workflow-step:hover .step-actions {
  opacity: 1;
}

.action-btn {
  width: 20px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

.remove-btn:hover {
  background-color: var(--error-color);
}

/* Responsive */
@media (max-width: 768px) {
  .workflow-step {
    min-width: 100px;
    padding: 0.4rem 0.6rem;
  }
  
  .step-icon {
    font-size: 0.875rem;
  }
  
  .step-name {
    font-size: 0.8rem;
  }
  
  .step-duration {
    font-size: 0.7rem;
  }
}
</style>