<template>
  <div class="floating-instrument-palette">
    <!-- Floating Palette Header -->
    <div class="floating-palette-header">
      <div class="header-main">
        <div class="header-title">
          <i class="fas fa-toolbox"></i>
          <span>Instrument Palette</span>
        </div>
        <button 
          class="custom-task-toggle-btn"
          @click="showCustomTaskForm = !showCustomTaskForm"
          :class="{ 'active': showCustomTaskForm }"
        >
          <i class="fas fa-plus-circle"></i>
          <span>Custom</span>
        </button>
      </div>
      
      <!-- Custom Task Form -->
      <transition name="slide-down">
        <div v-if="showCustomTaskForm" class="custom-task-form">
          <div class="form-row">
            <select v-model="customTask.type" class="form-select">
              <option 
                v-for="(tasks, instrument) in instruments" 
                :key="instrument" 
                :value="instrument"
              >
                {{ instrument }}
              </option>
            </select>
            
            <input 
              type="text" 
              v-model="customTask.task" 
              class="form-input" 
              placeholder="Task name"
              @keyup.enter="handleAddCustomTask"
            />
            
            <el-input-number 
              v-model="customTask.duration" 
              :min="1" 
              :max="999"
              size="small"
              class="form-duration"
            />
            
            <button 
              class="add-btn"
              @click="handleAddCustomTask"
              :disabled="!isCustomTaskValid"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- Horizontal Instrument Row -->
    <div class="instruments-row">
      <div 
        v-for="(tasks, instrument) in instruments"
        :key="instrument"
        class="instrument-icon-container"
        @click="toggleInstrumentDrawer(instrument)"
        :class="{ 'active': activeInstrument === instrument }"
      >
        <div class="instrument-icon">
          <i :class="getInstrumentIcon(instrument)"></i>
        </div>
        <span class="instrument-label">{{ instrument }}</span>
        <div v-if="getCombinedTasksForInstrument(instrument).length > 0" class="task-count">
          {{ getCombinedTasksForInstrument(instrument).length }}
        </div>
      </div>
    </div>
    
    <!-- Vertical Task Drawer -->
    <transition name="slide-up">
      <div v-if="activeInstrument" class="vertical-task-drawer">
        <div class="drawer-header">
          <h3>{{ activeInstrument }} Tasks</h3>
          <button class="close-drawer-btn" @click="activeInstrument = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="tasks-list">
          <!-- Standard Tasks -->
          <TaskCard
            v-for="(task, index) in getStandardTasks(activeInstrument)"
            :key="`${activeInstrument}-${task}-${index}`"
            :task="{
              type: activeInstrument,
              task: task,
              duration: defaultDurations[activeInstrument]
            }"
            :is-custom="false"
            :is-draggable="true"
            :show-edit-button="false"
            @drag-start="handleDragStart"
            @edit-duration="handleEditDuration"
          />
          
          <!-- Custom Tasks -->
          <TaskCard
            v-for="customTask in customTasksForInstrument[activeInstrument] || []"
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
    </transition>
    
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
import { ref, reactive, computed, shallowRef } from 'vue'
import type { InstrumentTask, CustomTask, DragItem } from '@/types/workflow'
import { INSTRUMENTS, DEFAULT_DURATIONS, INSTRUMENT_ICONS } from '@/constants/instruments'
import { AVAILABLE_ICONS } from '@/constants/icons'
import InstrumentDrawer from '@/components/InstrumentDrawer.vue'
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
const availableIcons = AVAILABLE_ICONS

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

const customTaskPreview = computed(() => ({
  type: customTask.type,
  task: customTask.task || 'Task Name',
  duration: customTask.duration,
  customIcon: customTask.customIcon || undefined
}))

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

const getStandardTasks = (instrument: string): string[] => {
  return instruments[instrument as keyof typeof instruments] || []
}

const getCombinedTasksForInstrument = (instrument: string): any[] => {
  const standardTasks = getStandardTasks(instrument).map(task => ({
    type: instrument,
    task,
    duration: defaultDurations[instrument],
    isCustom: false
  }))
  
  const customTasks = customTasksForInstrument.value[instrument] || []
  
  return [...standardTasks, ...customTasks]
}

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
/* Floating Palette Container */
.floating-instrument-palette {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--section-bg);
  overflow: hidden;
}

/* Floating Palette Header */
.floating-palette-header {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-lg);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-color);
  font-weight: 600;
  font-size: 1.125rem;
}

.header-title i {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.custom-task-toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-faded);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-task-toggle-btn:hover {
  background: var(--hover-bg);
  color: var(--text-color);
  border-color: var(--primary-color);
}

.custom-task-toggle-btn.active {
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

/* Custom Task Form */
.custom-task-form {
  padding: var(--spacing-md);
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.05);
  border: 1px solid rgba(var(--primary-color-rgb, 59, 130, 246), 0.2);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-sm);
}

.form-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.form-select,
.form-input {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm);
  color: var(--text-color);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-select {
  min-width: 120px;
}

.form-input {
  flex: 1;
  min-width: 100px;
}

.form-duration {
  width: 80px;
}

.form-select:focus,
.form-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 59, 130, 246), 0.2);
}

.add-btn {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: var(--button-text-dark);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Horizontal Instruments Row */
.instruments-row {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  overflow-x: auto;
  border-bottom: 1px solid var(--border-color);
}

.instrument-icon-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  min-width: 80px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.instrument-icon-container:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.instrument-icon-container.active {
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.instrument-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--section-bg);
  border-radius: var(--radius-md);
  font-size: 1.25rem;
  color: var(--primary-color);
}

.instrument-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-color);
  text-align: center;
  line-height: 1.2;
}

.task-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary-color);
  color: var(--button-text-dark);
  font-size: 0.625rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* Vertical Task Drawer */
.vertical-task-drawer {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  overflow: hidden;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--card-bg);
}

.drawer-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.close-drawer-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-faded);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-drawer-btn:hover {
  background: var(--error-color, #ef4444);
  color: white;
  border-color: var(--error-color, #ef4444);
}

.tasks-list {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow-y: auto;
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Element Plus Overrides */
:deep(.el-input-number) {
  width: 80px;
}

:deep(.el-input-number .el-input__inner) {
  border-radius: var(--radius-sm) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-input-number .el-input__inner:focus) {
  border-color: var(--primary-color) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .floating-palette-header {
    padding: var(--spacing-md);
  }

  .header-main {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .form-row {
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .form-select,
  .form-input,
  .form-duration {
    width: 100%;
    min-width: auto;
  }

  .instruments-row {
    padding: var(--spacing-md);
    gap: var(--spacing-xs);
  }

  .instrument-icon-container {
    min-width: 60px;
    padding: var(--spacing-sm);
  }

  .instrument-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .instrument-label {
    font-size: 0.625rem;
  }

  .custom-task-toggle-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>