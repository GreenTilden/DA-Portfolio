<template>
  <div 
    class="task-card"
    :class="{ 
      'custom-card': isCustom,
      'dragging': isDragging 
    }"
    :draggable="isDraggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="task-icon">
      <i :class="iconClass"></i>
    </div>
    <div class="task-info">
      <span class="task-type">{{ task.type }}</span>
      <span class="task-name">{{ task.task }}</span>
      <span class="task-duration">{{ task.duration }}min</span>
    </div>
    <div class="task-actions">
      <button 
        v-if="showEditButton"
        class="action-btn edit-btn"
        @click.stop="$emit('edit-duration', task)"
        title="Edit duration"
      >
        <i class="fas fa-clock"></i>
      </button>
      <button 
        v-if="isCustom"
        class="action-btn remove-btn"
        @click.stop="$emit('remove', task)"
        title="Remove custom task"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { InstrumentTask } from '@/types/workflow'
import { INSTRUMENT_ICONS } from '@/constants/instruments'

interface Props {
  task: InstrumentTask
  isCustom?: boolean
  isDraggable?: boolean
  showEditButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCustom: false,
  isDraggable: true,
  showEditButton: true
})

const emit = defineEmits<{
  'edit-duration': [task: InstrumentTask]
  'remove': [task: InstrumentTask]
  'drag-start': [event: DragEvent, task: InstrumentTask]
}>()

const isDragging = ref(false)

const iconClass = computed(() => {
  return props.task.customIcon || INSTRUMENT_ICONS[props.task.type] || 'fas fa-cog'
})

const handleDragStart = (event: DragEvent) => {
  if (!props.isDraggable) return
  
  isDragging.value = true
  emit('drag-start', event, props.task)
  
  // Set drag image opacity
  if (event.dataTransfer) {
    const dragImage = event.target as HTMLElement
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setDragImage(dragImage, dragImage.offsetWidth / 2, dragImage.offsetHeight / 2)
  }
}

const handleDragEnd = () => {
  isDragging.value = false
}
</script>

<style scoped>
.task-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: grab;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  min-width: 140px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.task-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.task-card.custom-card {
  border-style: dashed;
  border-color: var(--primary-color);
  background-color: var(--section-bg);
}

.task-icon {
  font-size: 1.25rem;
  color: var(--primary-color);
  width: 30px;
  text-align: center;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.task-type {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-name {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-duration {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
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
  background-color: var(--primary-color);
  color: white;
}

.edit-btn:hover {
  background-color: var(--primary-dark);
  transform: scale(1.1);
}

.remove-btn {
  background-color: var(--error-color);
  color: white;
}

.remove-btn:hover {
  background-color: #dc2626;
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .task-card {
    min-width: 120px;
    padding: 0.5rem;
  }
  
  .task-icon {
    font-size: 1rem;
    width: 24px;
  }
  
  .task-type {
    font-size: 0.8rem;
  }
  
  .task-name,
  .task-duration {
    font-size: 0.7rem;
  }
}
</style>