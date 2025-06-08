<template>
  <div class="instrument-palette">
    <div class="palette-header">
      <div class="header-content">
        <h4>Instrument Palette</h4>
        <p class="palette-instructions">
          Drag instrument tasks to workflow lanes
        </p>
      </div>
      
      <!-- Inline Custom Task Creator -->
      <div class="custom-task-inline">
        <div class="custom-task-toggle">
          <el-button 
            size="small" 
            type="primary" 
            @click="showCustomTaskForm = !showCustomTaskForm"
            :class="{ 'active': showCustomTaskForm }"
          >
            <i class="fas fa-plus"></i> Create Custom
          </el-button>
        </div>
        
        <transition name="slide-down">
          <div v-if="showCustomTaskForm" class="custom-task-form-inline">
            <div class="inline-form-row">
              <select v-model="customTask.type" class="inline-select">
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
                class="inline-input" 
                placeholder="Task name"
                @keyup.enter="handleAddCustomTask"
              />
              
              <el-input-number 
                v-model="customTask.duration" 
                :min="1" 
                :max="999"
                size="small"
                placeholder="Duration"
                class="inline-duration"
              />
              
              <el-button 
                type="primary" 
                size="small"
                @click="handleAddCustomTask"
                :disabled="!isCustomTaskValid"
              >
                Add
              </el-button>
            </div>
          </div>
        </transition>
      </div>
    </div>
    
    <!-- Instrument Task Drawers -->
    <div class="instrument-drawers">
      <InstrumentDrawer
        v-for="(tasks, instrument) in instruments"
        :key="instrument"
        ref="instrumentDrawers"
        :title="instrument"
        :icon="getInstrumentIcon(instrument)"
        :items="getCombinedTasksForInstrument(instrument)"
        :default-open="instrument === ''"
        class="instrument-drawer-item"
      >
        <template #default="{ items }">
          <div class="tasks-grid">
            <!-- Standard Tasks -->
            <TaskCard
              v-for="(task, index) in getStandardTasks(instrument)"
              :key="`${instrument}-${task}-${index}`"
              :task="{
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
              v-for="customTask in customTasksForInstrument[instrument]"
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
        </template>
      </InstrumentDrawer>
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
import { ref, reactive, computed, shallowRef } from 'vue'
import type { InstrumentTask, CustomTask, DragItem } from '@/types/workflow'
import { INSTRUMENTS, DEFAULT_DURATIONS, INSTRUMENT_ICONS } from '@/constants/instruments'
import { AVAILABLE_ICONS } from '@/constants/icons'
import InstrumentDrawer from '@/components/InstrumentDrawer.vue'
import TaskCard from '@/components/TaskCard.vue'
import DurationEditor from '@/components/DurationEditor.vue'
import { useDragDrop } from '@/composables/useDragDrop'

interface Props {
  customTasks: CustomTask[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'task-created': [task: Omit<CustomTask, 'id'>]
  'task-edited': [task: CustomTask]
  'task-removed': [task: CustomTask]
  'drag-start': [event: DragEvent, item: DragItem]
}>()

// State
const showCustomTaskForm = ref(false)
const showDurationEditor = ref(false)
const editingTask = ref<InstrumentTask | null>(null)
const editingDuration = ref<number>(15)
const instrumentDrawers = shallowRef<any[]>([])

// Custom task form
const customTask = reactive({
  type: 'Liquid Handler',
  task: '',
  duration: 15,
  customIcon: ''
})

// Use drag and drop composable
const { onDragStart } = useDragDrop()

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

const handleDragStart = (event: DragEvent, task: InstrumentTask) => {
  onDragStart(event, task as DragItem, false)
  emit('drag-start', event, task as DragItem)
  
  // Close the drawer that contains this task
  const drawerIndex = Object.keys(instruments).findIndex(inst => inst === task.type)
  if (drawerIndex !== -1 && instrumentDrawers.value[drawerIndex]) {
    instrumentDrawers.value[drawerIndex].close()
  }
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
.instrument-palette {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.palette-header {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: var(--section-bg);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.palette-header h4 {
  margin: 0;
  color: var(--text-light);
  font-size: 1.125rem;
}

.palette-instructions {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
  font-style: italic;
}

/* Inline Custom Task Creator */
.custom-task-inline {
  width: 100%;
}

.custom-task-toggle {
  text-align: right;
}

.custom-task-toggle .el-button.active {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
}

.custom-task-form-inline {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: rgba(var(--primary-color-rgb), 0.05);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: 0.375rem;
}

.inline-form-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.inline-select,
.inline-input {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  padding: 0.375rem 0.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.inline-select {
  min-width: 120px;
}

.inline-input {
  flex: 1;
  min-width: 100px;
}

.inline-duration {
  width: 80px;
}

.inline-select:focus,
.inline-input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  transform-origin: top;
}

.slide-down-enter-from {
  opacity: 0;
  transform: scaleY(0);
}

.slide-down-leave-to {
  opacity: 0;
  transform: scaleY(0);
}

/* Custom Task Section */
.custom-task-section {
  margin-bottom: 0.5rem;
}

.custom-task-form {
  padding: 1rem;
  background-color: var(--card-bg);
  border-radius: 0.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  color: var(--text-light);
  font-weight: 500;
}

.form-control {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  padding: 0.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
  width: 100%;
}

.form-control:focus {
  border-color: var(--primary-color);
  outline: none;
}

.icon-preview {
  flex: 2;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem; /* Reduced padding */
  background-color: var(--section-bg);
  cursor: pointer;
  transition: background-color 0.2s ease;
  user-select: none;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Reduced gap */
  color: var(--text-light);
  font-weight: 500;
  font-size: 0.875rem; /* Smaller font */
  flex: 1;
  min-width: 0;
}

.drawer-title i {
  font-size: 0.875rem; /* Smaller icon */
  color: var(--primary-color);
}



/* Instrument Drawers */
.instrument-drawers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.instrument-drawer-item {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.tasks-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem;
}

/* Element Plus component styling */
:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select-dropdown__item) {
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .instrument-drawers {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .instrument-drawers {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }

  /* Mobile inline custom task form */
  .inline-form-row {
    flex-direction: column;
    gap: 0.375rem;
  }

  .inline-select,
  .inline-input,
  .inline-duration {
    width: 100%;
    min-width: auto;
  }

  .custom-task-toggle {
    text-align: center;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .palette-header {
    padding: 0.5rem;
  }
}
</style>