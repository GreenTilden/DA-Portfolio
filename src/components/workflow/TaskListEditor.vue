<template>
  <div class="task-list-editor" :class="{ 'mobile-mode': isMobile }">
    <!-- Editor Controls -->
    <div class="editor-controls">
      <div class="control-group">
        <el-button
          class="control-btn"
          type="primary"
          @click="handleAddTask"
          :disabled="!canAddTask"
        >
          <i class="fas fa-plus"></i>
          <span>Add Task</span>
        </el-button>
        
        <el-button
          class="control-btn"
          type="danger"
          @click="handleClearAll"
          :disabled="tasks.length === 0"
        >
          <i class="fas fa-trash"></i>
          <span>Clear All</span>
        </el-button>
      </div>
      
      <div class="view-controls">
        <el-button
          class="view-btn"
          :type="viewMode === 'grid' ? 'primary' : 'info'"
          size="small"
          @click="viewMode = 'grid'"
          title="Grid view"
        >
          <i class="fas fa-th"></i>
        </el-button>
        <el-button
          class="view-btn"
          :type="viewMode === 'list' ? 'primary' : 'info'"
          size="small"
          @click="viewMode = 'list'"
          title="List view"
        >
          <i class="fas fa-list"></i>
        </el-button>
      </div>
    </div>

    <!-- Task List Container -->
    <div 
      class="task-list-container"
      :class="[viewMode]"
      ref="taskContainer"
    >
      <!-- Desktop: Horizontal scrolling with drag & drop -->
      <div 
        v-if="!isMobile"
        class="task-list horizontal"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @dragleave="handleDragLeave"
      >
        <TransitionGroup name="task-list" tag="div" class="task-items">
          <div 
            v-for="(task, index) in tasks" 
            :key="task.id"
            class="task-item"
            :class="{ 
              'dragging': dragState.draggedTask?.id === task.id,
              'drop-target': dragState.dropIndex === index
            }"
            draggable="true"
            @dragstart="handleDragStart($event, task, index)"
            @dragend="handleDragEnd"
          >
            <div class="task-card">
              <div class="task-header">
                <div class="task-icon">
                  <i :class="getTaskIcon(task)"></i>
                </div>
                <div class="task-actions">
                  <el-button
                    class="action-btn"
                    type="info"
                    size="small"
                    circle
                    @click="handleEditTask(task)"
                    title="Edit task"
                  >
                    <i class="fas fa-edit"></i>
                  </el-button>
                  <el-button
                    class="action-btn delete"
                    type="danger"
                    size="small"
                    circle
                    @click="handleDeleteTask(task.id)"
                    title="Delete task"
                  >
                    <i class="fas fa-times"></i>
                  </el-button>
                </div>
              </div>
              
              <div class="task-content">
                <div class="task-type">{{ task.type }}</div>
                <div class="task-name">{{ task.task }}</div>
                <div class="task-duration">
                  <i class="fas fa-clock"></i>
                  {{ task.duration }}min
                </div>
              </div>
              
              <div class="task-index">{{ index + 1 }}</div>
            </div>
          </div>
        </TransitionGroup>
        
        <!-- Drop indicator -->
        <div 
          v-if="dragState.isDragging" 
          class="drop-indicator"
          :style="{ left: `${dragState.indicatorPosition}px` }"
        ></div>
        
        <!-- Empty state -->
        <div v-if="tasks.length === 0" class="empty-tasks">
          <i class="fas fa-clipboard-list"></i>
          <p>No tasks yet. Drag instruments here or click "Add Task"</p>
        </div>
      </div>

      <!-- Mobile: Vertical list with arrow controls -->
      <div 
        v-else
        class="task-list vertical"
        ref="mobileTaskList"
      >
        <TransitionGroup name="task-list-mobile" tag="div" class="task-items-mobile">
          <div 
            v-for="(task, index) in tasks" 
            :key="task.id"
            class="task-item-mobile"
            :class="{ 'selected': selectedTaskId === task.id }"
            @click="selectedTaskId = task.id"
            @touchstart="handleTouchStart($event, task, index)"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <div class="task-card-mobile">
              <!-- Drag handle -->
              <div class="drag-handle">
                <i class="fas fa-grip-vertical"></i>
              </div>
              
              <!-- Task info -->
              <div class="task-info">
                <div class="task-header-mobile">
                  <i :class="getTaskIcon(task)"></i>
                  <span class="task-type">{{ task.type }}</span>
                  <span class="task-duration">{{ task.duration }}min</span>
                </div>
                <div class="task-name">{{ task.task }}</div>
              </div>
              
              <!-- Position controls -->
              <div class="position-controls">
                <el-button
                  class="position-btn"
                  type="info"
                  size="small"
                  @click.stop="handleMoveUp(index)"
                  :disabled="index === 0"
                  title="Move up"
                >
                  <i class="fas fa-chevron-up"></i>
                </el-button>
                <el-button
                  class="position-btn"
                  type="info"
                  size="small"
                  @click.stop="handleMoveDown(index)"
                  :disabled="index === tasks.length - 1"
                  title="Move down"
                >
                  <i class="fas fa-chevron-down"></i>
                </el-button>
              </div>
              
              <!-- Actions -->
              <div class="task-actions-mobile">
                <el-button
                  class="action-btn"
                  type="info"
                  size="small"
                  circle
                  @click.stop="handleEditTask(task)"
                >
                  <i class="fas fa-edit"></i>
                </el-button>
                <el-button
                  class="action-btn delete"
                  type="danger"
                  size="small"
                  circle
                  @click.stop="handleDeleteTask(task.id)"
                >
                  <i class="fas fa-times"></i>
                </el-button>
              </div>
            </div>
          </div>
        </TransitionGroup>
        
        <!-- Empty state -->
        <div v-if="tasks.length === 0" class="empty-tasks-mobile">
          <i class="fas fa-clipboard-list"></i>
          <p>No tasks yet</p>
          <el-button
            class="add-first-task"
            type="primary"
            @click="handleAddTask"
          >
            <i class="fas fa-plus"></i>
            Add First Task
          </el-button>
        </div>
      </div>
    </div>

    <!-- Scroll Controls (Desktop) -->
    <div v-if="!isMobile && showScrollControls" class="scroll-controls">
      <el-button
        class="scroll-btn left"
        type="info"
        circle
        @click="scrollLeft"
        :disabled="!canScrollLeft"
      >
        <i class="fas fa-chevron-left"></i>
      </el-button>
      <el-button
        class="scroll-btn right"
        type="info"
        circle
        @click="scrollRight"
        :disabled="!canScrollRight"
      >
        <i class="fas fa-chevron-right"></i>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import type { Step } from '@/types/workflow'
import { useDragDrop } from '@/composables/useDragDrop'
import { useTouchDragDrop } from '@/composables/useTouchDragDrop'
import { INSTRUMENT_ICONS } from '@/constants/instruments'

interface Props {
  tasks: Step[]
  canAddTask?: boolean
  onTasksChange: (tasks: Step[]) => void
  onAddTask?: () => void
  onEditTask?: (task: Step) => void
}

const props = withDefaults(defineProps<Props>(), {
  canAddTask: true
})

// Removed unused emit

// Refs
const taskContainer = ref<HTMLElement | null>(null)
const mobileTaskList = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const selectedTaskId = ref<string | null>(null)
const showScrollControls = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// Drag state
const dragState = reactive({
  isDragging: false,
  draggedTask: null as Step | null,
  draggedIndex: -1,
  dropIndex: -1,
  indicatorPosition: 0
})

// Touch drag setup
const { setDragData, getDragData } = useDragDrop()
const dragHandlers = {
  handleDragOver: (event: any) => handleDragOver(event),
  handleDrop: (event: any) => handleDrop(event),
  handleDragEnd: () => handleDragEnd()
}

const { 
  handleTouchStart: touchDragStart, 
  handleTouchMove: touchDragMove, 
  handleTouchEnd: touchDragEnd 
} = useTouchDragDrop(dragHandlers)

// Lifecycle
onMounted(() => {
  // Detect mobile
  isMobile.value = window.innerWidth <= 768 || 'ontouchstart' in window
  
  // Handle resize
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768 || 'ontouchstart' in window
    checkScrollability()
  }
  
  window.addEventListener('resize', handleResize)
  
  // Check scrollability for desktop
  if (!isMobile.value && taskContainer.value) {
    checkScrollability()
    taskContainer.value.addEventListener('scroll', checkScrollability)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {})
  if (taskContainer.value) {
    taskContainer.value.removeEventListener('scroll', checkScrollability)
  }
})

// Watch for task changes to update scrollability
watch(() => props.tasks, () => {
  setTimeout(checkScrollability, 100)
}, { deep: true })

// Methods
const getTaskIcon = (task: Step) => {
  if (task.customIcon) return task.customIcon
  return INSTRUMENT_ICONS[task.type] || 'fas fa-cog'
}

const handleAddTask = () => {
  if (props.onAddTask) {
    props.onAddTask()
  }
}

const handleEditTask = (task: Step) => {
  if (props.onEditTask) {
    props.onEditTask(task)
  }
}

const handleDeleteTask = (taskId: string) => {
  if (confirm('Are you sure you want to delete this task?')) {
    const newTasks = props.tasks.filter(t => t.id !== taskId)
    props.onTasksChange(newTasks)
  }
}

const handleClearAll = () => {
  if (confirm('Are you sure you want to remove all tasks?')) {
    props.onTasksChange([])
  }
}

// Desktop drag & drop
const handleDragStart = (event: DragEvent, task: Step, index: number) => {
  if (!event.dataTransfer) return
  
  dragState.isDragging = true
  dragState.draggedTask = task
  dragState.draggedIndex = index
  
  const dragData = {
    ...task,
    isExistingStep: true,
    sourceIndex: index
  }
  
  setDragData(event, dragData)
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  
  if (!taskContainer.value) return
  
  const container = taskContainer.value.querySelector('.task-items')
  if (!container) return
  
  const items = Array.from(container.querySelectorAll('.task-item'))
  const containerRect = container.getBoundingClientRect()
  
  // Find drop position
  let dropIndex = items.length
  let indicatorPosition = 0
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as HTMLElement
    const rect = item.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    
    if (event.clientX < centerX) {
      dropIndex = i
      indicatorPosition = rect.left - containerRect.left - 3
      break
    }
  }
  
  // If dropping at end
  if (dropIndex === items.length && items.length > 0) {
    const lastItem = items[items.length - 1] as HTMLElement
    const rect = lastItem.getBoundingClientRect()
    indicatorPosition = rect.right - containerRect.left + 3
  }
  
  dragState.dropIndex = dropIndex
  dragState.indicatorPosition = indicatorPosition
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  const dragData = getDragData(event)
  if (!dragData) return
  
  let newTasks = [...props.tasks]
  
  // Handle internal reordering
  if (dragData.isExistingStep && dragData.sourceIndex !== undefined) {
    const [movedTask] = newTasks.splice(dragData.sourceIndex, 1)
    
    const insertIndex = dragState.dropIndex > dragData.sourceIndex 
      ? dragState.dropIndex - 1 
      : dragState.dropIndex
    
    newTasks.splice(insertIndex, 0, movedTask)
  } else {
    // Handle external drop (new task)
    const newTask: Step = {
      id: `task-${Date.now()}`,
      type: dragData.type,
      task: dragData.task,
      duration: dragData.duration,
      customIcon: dragData.customIcon
    }
    
    newTasks.splice(dragState.dropIndex, 0, newTask)
  }
  
  props.onTasksChange(newTasks)
  handleDragEnd()
}

const handleDragLeave = (event: DragEvent) => {
  const related = event.relatedTarget as HTMLElement
  const container = event.currentTarget as HTMLElement
  
  if (!container.contains(related)) {
    dragState.dropIndex = -1
    dragState.indicatorPosition = 0
  }
}

const handleDragEnd = () => {
  dragState.isDragging = false
  dragState.draggedTask = null
  dragState.draggedIndex = -1
  dragState.dropIndex = -1
  dragState.indicatorPosition = 0
}

// Mobile position controls
const handleMoveUp = (index: number) => {
  if (index === 0) return
  
  const newTasks = [...props.tasks]
  ;[newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]]
  props.onTasksChange(newTasks)
}

const handleMoveDown = (index: number) => {
  if (index === props.tasks.length - 1) return
  
  const newTasks = [...props.tasks]
  ;[newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]]
  props.onTasksChange(newTasks)
}

// Touch drag for mobile
const handleTouchStart = (event: TouchEvent, task: Step, index: number) => {
  const dragItem = {
    ...task,
    isExistingStep: true,
    sourceIndex: index
  }
  
  touchDragStart(event, dragItem)
}

const handleTouchMove = (event: TouchEvent) => {
  touchDragMove(event)
}

const handleTouchEnd = (event: TouchEvent) => {
  const result = touchDragEnd(event)
  
  if (result) {
    // Touch system handles the drop
    handleDragEnd()
  }
}

// Scroll controls
const checkScrollability = () => {
  if (!taskContainer.value) return
  
  const container = taskContainer.value.querySelector('.task-list.horizontal')
  if (!container) return
  
  const scrollable = container.scrollWidth > container.clientWidth
  showScrollControls.value = scrollable
  
  if (scrollable) {
    canScrollLeft.value = container.scrollLeft > 0
    canScrollRight.value = container.scrollLeft < (container.scrollWidth - container.clientWidth)
  }
}

const scrollLeft = () => {
  if (!taskContainer.value) return
  
  const container = taskContainer.value.querySelector('.task-list.horizontal')
  if (!container) return
  
  container.scrollBy({ left: -200, behavior: 'smooth' })
}

const scrollRight = () => {
  if (!taskContainer.value) return
  
  const container = taskContainer.value.querySelector('.task-list.horizontal')
  if (!container) return
  
  container.scrollBy({ left: 200, behavior: 'smooth' })
}
</script>

<style scoped>
.task-list-editor {
  position: relative;
}

.editor-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.control-group {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  font-size: 0.875rem;
}

.control-btn i {
  margin-right: 0.25rem;
}

.control-btn span {
  margin-left: 0.125rem;
}

.view-controls {
  display: flex;
  gap: 0.25rem;
  background: var(--background-alt);
  padding: 0.25rem;
  border-radius: 6px;
}

.view-btn {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
}

.task-list-container {
  position: relative;
  background: var(--background-alt);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  min-height: 150px;
  overflow: hidden;
}

.task-list.horizontal {
  padding: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.task-items {
  display: inline-flex;
  gap: 0.75rem;
  align-items: center;
  min-height: 120px;
}

.task-item {
  flex-shrink: 0;
  transition: all 0.2s ease;
  cursor: grab;
}

.task-item:active {
  cursor: grabbing;
}

.task-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.task-item.drop-target {
  transform: translateX(10px);
}

.task-card {
  width: 140px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  position: relative;
  transition: all 0.2s ease;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.task-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  min-width: 24px !important;
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
  font-size: 0.625rem;
}

.task-content {
  text-align: left;
}

.task-type {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.task-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  white-space: normal;
  line-height: 1.2;
}

.task-duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.task-duration i {
  font-size: 0.625rem;
}

.task-index {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-alt);
  border-radius: 50%;
  font-size: 0.625rem;
  color: var(--text-muted);
  font-weight: 600;
}

.drop-indicator {
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  width: 4px;
  background: var(--primary-color);
  border-radius: 2px;
  transition: left 0.2s ease;
  pointer-events: none;
  z-index: 10;
}

.empty-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
  text-align: center;
}

.empty-tasks i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-tasks p {
  margin: 0;
  font-size: 0.875rem;
}

/* Mobile styles */
.task-list.vertical {
  padding: 0.75rem;
}

.task-items-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item-mobile {
  transition: all 0.2s ease;
}

.task-item-mobile.selected {
  transform: scale(0.98);
}

.task-card-mobile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.task-card-mobile:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.drag-handle {
  color: var(--text-muted);
  cursor: grab;
  padding: 0.25rem;
}

.drag-handle:active {
  cursor: grabbing;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-header-mobile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.task-header-mobile i {
  color: var(--primary-color);
}

.task-header-mobile .task-type {
  font-weight: 500;
  color: var(--text-light);
}

.task-header-mobile .task-duration {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.position-controls {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.position-btn {
  min-width: 28px !important;
  width: 28px !important;
  height: 24px !important;
  padding: 0 !important;
  font-size: 0.75rem;
}

.task-actions-mobile {
  display: flex;
  gap: 0.25rem;
}

.empty-tasks-mobile {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
}

.empty-tasks-mobile i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.empty-tasks-mobile p {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

.add-first-task {
  font-size: 0.875rem;
}

.add-first-task i {
  margin-right: 0.375rem;
}

.add-first-task:hover {
  transform: translateY(-1px);
}

/* Scroll controls */
.scroll-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.scroll-btn {
  pointer-events: auto;
  box-shadow: var(--shadow-md);
}

/* View mode variations */
.task-list-container.list .task-items {
  flex-direction: column;
  align-items: stretch;
}

.task-list-container.list .task-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.task-list-container.list .task-header {
  margin-bottom: 0;
}

.task-list-container.list .task-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.task-list-container.list .task-name {
  margin-bottom: 0;
}

/* Animations */
.task-list-move,
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s ease;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-list-mobile-move,
.task-list-mobile-enter-active,
.task-list-mobile-leave-active {
  transition: all 0.3s ease;
}

.task-list-mobile-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.task-list-mobile-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .editor-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    justify-content: center;
  }
  
  .view-controls {
    justify-content: center;
  }
}
</style>