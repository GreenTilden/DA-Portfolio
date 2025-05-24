<template>
  <div 
    class="workflow-step"
    :class="{ 
      'liquid-handler': step.type === 'Liquid Handler',
      'dragging': isDragging 
    }"
    :data-step-id="step.id"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="step-icon">
      <i :class="iconClass"></i>
    </div>
    <div class="step-content">
      <span class="step-name">{{ step.task || step.type }}</span>
      <span class="step-duration">{{ step.duration }}min</span>
    </div>
    <div class="step-actions">
      <button 
        class="action-btn edit-btn"
        @click.stop="$emit('edit-duration', step)"
        title="Edit duration"
      >
        <i class="fas fa-clock"></i>
      </button>
      <button 
        class="action-btn remove-btn"
        @click.stop="$emit('remove')"
        title="Remove step"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Step } from '@/types/workflow'
import { INSTRUMENT_ICONS } from '@/constants/instruments'

interface Props {
  step: Step
  stepIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'remove': []
  'edit-duration': [step: Step]
  'drag-start': [event: DragEvent, step: Step]
}>()

const isDragging = ref(false)

const iconClass = computed(() => {
  return props.step.customIcon || INSTRUMENT_ICONS[props.step.type] || 'fas fa-cog'
})

const handleDragStart = (event: DragEvent) => {
  isDragging.value = true
  emit('drag-start', event, props.step)
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', JSON.stringify({
      ...props.step,
      isExistingStep: true
    }))
  }
}

const handleDragEnd = () => {
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
}

.workflow-step.liquid-handler {
  background-color: var(--secondary-color);
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