<template>
  <div class="instrument-palette">
    <div class="palette-header">
      <h4>Instrument Palette</h4>
      <p class="palette-instructions">
        Drag instrument tasks to workflow lanes or double-click to add to the selected lane
      </p>
    </div>
    
    <!-- Custom Task Creator -->
    <div class="custom-task-section">
      <InstrumentDrawer
        title="Create Custom Task"
        icon="fas fa-plus-circle"
        :items="[customTask]"
        :default-open="false"
        @toggle="showCustomTaskForm = $event"
      >
        <template #default>
          <div class="custom-task-form">
            <div class="form-row">
              <div class="form-group">
                <label>Instrument Type</label>
                <select v-model="customTask.type" class="form-control">
                  <option 
                    v-for="(tasks, instrument) in instruments" 
                    :key="instrument" 
                    :value="instrument"
                  >
                    {{ instrument }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Task Name</label>
                <input 
                  type="text" 
                  v-model="customTask.task" 
                  class="form-control" 
                  placeholder="Enter task name"
                  @keyup.enter="handleAddCustomTask"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Duration (minutes)</label>
                <el-input-number 
                  v-model="customTask.duration" 
                  :min="1" 
                  :max="999"
                  size="small"
                />
              </div>
              <div class="form-group">
                <label>Custom Icon</label>
                <el-select 
                  v-model="customTask.customIcon" 
                  placeholder="Use default"
                  size="small"
                  clearable
                >
                  <el-option
                    v-for="icon in availableIcons"
                    :key="icon.class"
                    :label="icon.name"
                    :value="icon.class"
                  >
                    <span style="display: flex; align-items: center; gap: 8px;">
                      <i :class="icon.class"></i>
                      {{ icon.name }}
                    </span>
                  </el-option>
                </el-select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group icon-preview">
                <label>Preview</label>
                <TaskCard
                  :task="customTaskPreview"
                  :is-custom="true"
                  :is-draggable="false"
                  :show-edit-button="false"
                />
              </div>
            </div>
            
            <div class="form-actions">
              <el-button 
                type="primary" 
                size="small"
                @click="handleAddCustomTask"
                :disabled="!isCustomTaskValid"
              >
                <i class="fas fa-plus"></i> Add to Palette
              </el-button>
              <el-button 
                size="small"
                @click="resetCustomTaskForm"
              >
                Reset
              </el-button>
            </div>
          </div>
        </template>
      </InstrumentDrawer>
    </div>
    
    <!-- Instrument Task Drawers -->
    <div class="instrument-drawers">
      <InstrumentDrawer
        v-for="(tasks, instrument) in instruments"
        :key="instrument"
        :title="instrument"
        :icon="getInstrumentIcon(instrument)"
        :items="getCombinedTasksForInstrument(instrument)"
        :default-open="instrument === 'Liquid Handler'"
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
import { ref, reactive, computed } from 'vue'
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

.palette-header h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-light);
  font-size: 1.125rem;
}

.palette-instructions {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
  font-style: italic;
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

/* Instrument Drawers */
.instrument-drawers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.instrument-drawer-item {
  background-color: var(--card-bg);
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style>