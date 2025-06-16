<template>
  <div class="anchored-instrument-palette">
    <!-- Horizontal Instruments Row -->
    <div class="instruments-horizontal-row">
      <div 
        v-for="instrument in Object.keys(instruments)"
        :key="instrument"
        class="instrument-container"
        @click="toggleInstrumentDrawer(instrument)"
        :class="{ 'active': activeInstrument === instrument }"
      >
        <div class="instrument-card">
          <div class="instrument-icon">
            <i :class="getInstrumentIcon(instrument)"></i>
          </div>
          <span class="instrument-name">{{ instrument }}</span>
        </div>
        
        <!-- Vertical Task Drawer for this instrument -->
        <transition name="slide-down-drawer">
          <div v-if="activeInstrument === instrument" class="instrument-task-drawer">
            <div class="drawer-content">
              <div class="drawer-header">
                <h4>{{ instrument }}</h4>
                <el-button
                  class="close-btn"
                  type="danger"
                  size="small"
                  circle
                  @click.stop="activeInstrument = null"
                >
                  <i class="fas fa-times"></i>
                </el-button>
              </div>
              
              <div class="tasks-list">
                <!-- Standard Tasks -->
                <TaskCard
                  v-for="(task, index) in getStandardTasks(instrument)"
                  :key="`${instrument}-${task}-${index}`"
                  :task="{
                    id: `${instrument}-${task}-${index}`,
                    type: instrument,
                    task: task,
                    duration: defaultDurations[instrument]
                  }"
                  :is-custom="false"
                  :is-draggable="true"
                  :show-edit-button="false"
                  @drag-start="handleDragStart"
                  @edit-duration="handleEditDuration"
                />
                
                <!-- Custom Tasks -->
                <TaskCard
                  v-for="customTask in customTasksForInstrument[instrument] || []"
                  :key="customTask.id"
                  :task="customTask"
                  :is-custom="true"
                  :is-draggable="true"
                  :show-edit-button="true"
                  @drag-start="handleDragStart"
                  @edit-duration="handleEditDuration"
                  @remove="handleRemoveCustomTask"
                />
              </div>
            </div>
          </div>
        </transition>
      </div>
      
      <!-- Custom Task Button -->
      <div class="custom-task-container">
        <div 
          class="custom-task-card"
          @click="showCustomTaskForm = !showCustomTaskForm"
          :class="{ 'active': showCustomTaskForm }"
        >
          <div class="custom-task-icon">
            <i class="fas fa-plus-circle"></i>
          </div>
          <span class="custom-task-name">Custom</span>
        </div>
        
        <!-- Custom Task Form Drawer -->
        <transition name="slide-down-drawer">
          <div v-if="showCustomTaskForm" class="custom-task-drawer">
            <div class="drawer-content">
              <div class="drawer-header">
                <h4>Create Custom Task</h4>
                <el-button
                  class="close-btn"
                  type="danger"
                  size="small"
                  circle
                  @click.stop="showCustomTaskForm = false"
                >
                  <i class="fas fa-times"></i>
                </el-button>
              </div>
              
              <div class="custom-form">
                <div class="form-group">
                  <label>Instrument Type</label>
                  <el-select v-model="customTask.type" class="form-control" placeholder="Select instrument">
                    <el-option 
                      v-for="instrument in Object.keys(instruments)" 
                      :key="instrument" 
                      :value="instrument"
                      :label="instrument"
                    />
                  </el-select>
                </div>
                
                <div class="form-group">
                  <label>Task Name</label>
                  <el-input 
                    v-model="customTask.task" 
                    class="form-control" 
                    placeholder="Enter task name"
                    @keyup.enter="handleAddCustomTask"
                  />
                </div>
                
                <div class="form-group">
                  <label>Duration (minutes)</label>
                  <el-input-number 
                    v-model="customTask.duration" 
                    :min="1" 
                    :max="999"
                    size="small"
                    class="duration-input"
                  />
                </div>
                
                <el-button
                  class="create-btn"
                  type="primary"
                  @click="handleAddCustomTask"
                  :disabled="!isCustomTaskValid"
                >
                  <i class="fas fa-plus"></i>
                  Create Task
                </el-button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    
    <!-- Duration Editor Dialog -->
    <DurationEditor
      :visible="showDurationEditor"
      :task="editingTask"
      :duration="editingDuration"
      @update:visible="showDurationEditor = $event"
      @save="handleSaveDuration"
      @cancel="showDurationEditor = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { InstrumentTask, CustomTask, DragItem } from '@/types/workflow'
import { INSTRUMENTS, DEFAULT_DURATIONS, INSTRUMENT_ICONS } from '@/constants/instruments'
// Removed unused import AVAILABLE_ICONS
// Removed unused import InstrumentDrawer
import TaskCard from '@/components/TaskCard.vue'
import DurationEditor from '@/components/DurationEditor.vue'

interface Props {
  customTasks: CustomTask[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'task-created': [task: Omit<CustomTask, 'id'>]
  'task-edited': [task: CustomTask]
  'task-removed': [task: CustomTask]
  'drag-start': [event: DragEvent, item: DragItem]
  'task-dragged': []
}>()

// State
const showCustomTaskForm = ref(false)
const showDurationEditor = ref(false)
const editingTask = ref<InstrumentTask | null>(null)
const editingDuration = ref<number>(15)
const activeInstrument = ref<string | null>(null)

// Custom task form
const customTask = reactive({
  type: 'Liquid Handler',
  task: '',
  duration: 15,
  customIcon: ''
})

// Remove this line - no longer using composable

// Data
const instruments = INSTRUMENTS
const defaultDurations = DEFAULT_DURATIONS
// Removed unused availableIcons variable

// Computed
const isCustomTaskValid = computed(() => {
  return (
    customTask.type && 
    customTask.task && 
    customTask.task.trim() !== '' && 
    customTask.duration && 
    customTask.duration >= 1
  )
})

// Removed unused customTaskPreview computed property

const customTasksForInstrument = computed(() => {
  const grouped: Record<string, CustomTask[]> = {}
  
  Object.keys(instruments).forEach(instrument => {
    grouped[instrument] = props.customTasks.filter(
      task => task.type === instrument
    )
  })
  
  return grouped
})

// Methods
const getInstrumentIcon = (type: string): string => {
  return INSTRUMENT_ICONS[type] || 'fas fa-cog'
}

const getStandardTasks = (instrument: string): readonly string[] => {
  return instruments[instrument as keyof typeof instruments] || []
}

// Removed unused getCombinedTasksForInstrument function

const handleAddCustomTask = () => {
  if (!isCustomTaskValid.value) return
  
  emit('task-created', {
    type: customTask.type,
    task: customTask.task.trim(),
    duration: customTask.duration,
    customIcon: customTask.customIcon || undefined
  })
  
  // Reset form
  resetCustomTaskForm()
}

const resetCustomTaskForm = () => {
  customTask.task = ''
  customTask.duration = 15
  customTask.customIcon = ''
}

const toggleInstrumentDrawer = (instrument: string) => {
  if (activeInstrument.value === instrument) {
    activeInstrument.value = null
  } else {
    activeInstrument.value = instrument
  }
}

const handleDragStart = (event: DragEvent, task: InstrumentTask) => {
  // Just emit the event - parent will handle the drag state
  emit('drag-start', event, task as DragItem)
  
  // Close the vertical drawer when dragging starts
  activeInstrument.value = null
  
  // Also emit the task-dragged event to close the entire palette
  emit('task-dragged')
}

const handleEditDuration = (task: InstrumentTask) => {
  editingTask.value = task
  editingDuration.value = task.duration
  showDurationEditor.value = true
}

const handleSaveDuration = (duration: number) => {
  if (editingTask.value && 'id' in editingTask.value) {
    // It's a custom task
    emit('task-edited', {
      ...editingTask.value as CustomTask,
      duration
    })
  }
  showDurationEditor.value = false
}

const handleRemoveCustomTask = (task: CustomTask) => {
  emit('task-removed', task)
}
</script>

<style scoped>
/* Anchored Palette Container */
.anchored-instrument-palette {
  position: relative;
}

/* Horizontal Instruments Row */
.instruments-horizontal-row {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--section-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.instruments-horizontal-row::-webkit-scrollbar {
  display: none;
}

/* Instrument Containers */
.instrument-container,
.custom-task-container {
  position: relative;
  flex-shrink: 0;
}

.instrument-card,
.custom-task-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  min-width: 80px;
}

.instrument-card:hover,
.custom-task-card:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.instrument-container.active .instrument-card,
.custom-task-container .custom-task-card.active {
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.instrument-icon,
.custom-task-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--section-bg);
  border-radius: var(--radius-md);
  font-size: 1.25rem;
  color: var(--primary-color);
  transition: all 0.2s ease;
}

.instrument-name,
.custom-task-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-color);
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Task Drawers */
.instrument-task-drawer,
.custom-task-drawer {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: var(--spacing-sm);
}

.drawer-content {
  background: var(--section-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  min-width: 250px;
  max-height: 400px;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.drawer-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
}

.close-btn {
  min-width: 24px !important;
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
  font-size: 0.75rem;
}

.close-btn:deep(.el-button) {
  --el-button-bg-color: transparent;
  --el-button-border-color: var(--border-color);
  --el-button-text-color: var(--text-faded);
  --el-button-hover-bg-color: var(--error-color, #ef4444);
  --el-button-hover-border-color: var(--error-color, #ef4444);
  --el-button-hover-text-color: white;
}

.tasks-list {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 300px;
  overflow-y: auto;
}

/* Custom Task Form */
.custom-form {
  padding: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
}

/* Element Plus form control styling */
:deep(.form-control .el-input__inner),
:deep(.form-control .el-select__wrapper) {
  background: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
  font-size: 0.875rem;
}

:deep(.form-control .el-input__inner:focus),
:deep(.form-control .el-select__wrapper:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 59, 130, 246), 0.2);
}

:deep(.form-control .el-select__placeholder) {
  color: var(--text-muted);
}

.duration-input {
  width: 100%;
}

.create-btn {
  width: 100%;
  font-size: 0.875rem;
  font-weight: 500;
}

.create-btn i {
  margin-right: var(--spacing-xs);
}

.create-btn:deep(.el-button) {
  --el-button-bg-color: var(--primary-color);
  --el-button-text-color: var(--button-text-dark);
  --el-button-hover-bg-color: var(--primary-dark);
  --el-button-hover-text-color: var(--button-text-dark);
}

.create-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.create-btn:disabled {
  transform: none;
}

/* Drawer Animations */
.slide-down-drawer-enter-active,
.slide-down-drawer-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;
}

.slide-down-drawer-enter-from {
  opacity: 0;
  transform: translateY(-10px) scaleY(0.8);
}

.slide-down-drawer-leave-to {
  opacity: 0;
  transform: translateY(-10px) scaleY(0.8);
}

/* Element Plus Overrides */
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__inner) {
  border-radius: var(--radius-sm) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-input-number .el-input__inner:focus) {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 59, 130, 246), 0.2) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .instruments-horizontal-row {
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
  }

  .instrument-card,
  .custom-task-card {
    min-width: 60px;
    padding: var(--spacing-sm);
  }

  .instrument-icon,
  .custom-task-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .instrument-name,
  .custom-task-name {
    font-size: 0.625rem;
  }

  .drawer-content {
    min-width: 200px;
    max-height: 300px;
  }

  .tasks-list {
    max-height: 200px;
    padding: var(--spacing-sm);
  }

  .custom-form {
    padding: var(--spacing-sm);
  }

  .form-group {
    margin-bottom: var(--spacing-sm);
  }
}

/* Small Screen Adjustments */
@media (max-width: 480px) {
  .instruments-horizontal-row {
    flex-wrap: wrap;
    justify-content: center;
  }

  .instrument-task-drawer,
  .custom-task-drawer {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    z-index: 100;
    margin-top: 0;
  }

  .drawer-content {
    min-width: 280px;
    max-width: 90vw;
  }

  .slide-down-drawer-enter-from,
  .slide-down-drawer-leave-to {
    transform: translate(-50%, -50%) scale(0.9);
  }
}
</style>