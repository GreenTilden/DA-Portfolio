<template>
  <div class="protocol-builder">
    <!-- Protocol Builder Header -->
    <div class="builder-header">
      <div class="protocol-info">
        <h4>Protocol Builder</h4>
        <p class="subtitle">Drag instruments to build your liquid handling protocol</p>
      </div>
      
      <div class="builder-controls">
        <el-button 
          @click="$emit('undo')"
          :disabled="!canUndo"
          size="small"
          title="Undo (Ctrl+Z)"
        >
          <template #icon>
            <i class="fas fa-undo"></i>
          </template>
          Undo
        </el-button>
        
        <el-button 
          @click="$emit('redo')"
          :disabled="!canRedo"
          size="small"
          title="Redo (Ctrl+Y)"
        >
          <template #icon>
            <i class="fas fa-redo"></i>
          </template>
          Redo
        </el-button>
        
        <el-button 
          @click="clearProtocol"
          :disabled="protocol.steps.length === 0"
          size="small"
          type="danger"
        >
          <template #icon>
            <i class="fas fa-trash"></i>
          </template>
          Clear
        </el-button>
      </div>
    </div>

    <!-- Instrument Palette -->
    <div class="instrument-palette-section">
      <h5>Available Instruments</h5>
      <div class="instruments-horizontal-row">
        <!-- Liquid Handler Instruments Only -->
        <div 
          v-for="task in liquidHandlerTasks"
          :key="task"
          class="instrument-task-container"
          @click="showTaskDetails(task)"
        >
          <div 
            class="instrument-task-card"
            :draggable="true"
            @dragstart="handleTaskDragStart($event, task)"
            @dragend="handleTaskDragEnd"
          >
            <div class="task-icon">
              <i :class="getTaskIcon(task)"></i>
            </div>
            <span class="task-name">{{ task }}</span>
            <div class="task-duration">{{ getTaskDuration(task) }}min</div>
          </div>
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
        </div>
      </div>
    </div>

    <!-- Protocol Sequence -->
    <div class="protocol-sequence-section">
      <div class="sequence-header">
        <h5>Protocol Sequence</h5>
        <div class="sequence-stats">
          <el-tag type="info" size="small">
            {{ protocol.steps.length }} steps
          </el-tag>
          <el-tag type="success" size="small" v-if="totalDuration > 0">
            {{ totalDuration }}min total
          </el-tag>
          <el-tag type="warning" size="small" v-if="validationErrors.length > 0">
            {{ validationErrors.length }} issues
          </el-tag>
        </div>
      </div>
      
      <!-- Drop Zone -->
      <div 
        class="protocol-drop-zone"
        :class="{ 
          'drag-over': isDragOver,
          'empty': protocol.steps.length === 0 
        }"
        @drop="handleProtocolDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @dragenter.prevent
      >
        <!-- Empty State -->
        <div v-if="protocol.steps.length === 0" class="empty-protocol">
          <i class="fas fa-flask"></i>
          <p>Drag instruments here to start building your protocol</p>
        </div>
        
        <!-- Protocol Steps -->
        <div v-else class="protocol-steps">
          <ProtocolStep
            v-for="(step, index) in protocol.steps"
            :key="step.id"
            :step="step"
            :step-index="index"
            :is-active="activeStepIndex === index"
            :validation-errors="getStepValidationErrors(step.id)"
            :show-edit-button="true"
            :show-remove-button="true"
            @step-clicked="handleStepClick(index)"
            @edit-step="handleEditStep"
            @remove-step="handleRemoveStep"
            @drag-start="handleStepDragStart"
          />
        </div>
      </div>
    </div>

    <!-- Step Editor Modal -->
    <el-dialog 
      v-model="showStepEditor"
      title="Edit Protocol Step"
      width="500px"
      @close="resetStepEditor"
    >
      <div v-if="editingStep" class="step-editor-form">
        <div class="form-group">
          <label>Task Name</label>
          <el-input v-model="editingStep.task" placeholder="Enter task name" />
        </div>
        
        <div class="form-group">
          <label>Duration (minutes)</label>
          <el-input-number 
            v-model="editingStep.duration" 
            :min="1" 
            :max="999"
            size="default"
          />
        </div>
        
        <!-- Transfer-specific fields -->
        <div v-if="isTransferTask(editingStep.task)" class="transfer-fields">
          <div class="form-group">
            <label>Source Position</label>
            <el-select v-model="editingStep.source" placeholder="Select source">
              <el-option
                v-for="position in availablePositions"
                :key="position.id"
                :label="`${position.label} - ${position.labware?.name || 'Empty'}`"
                :value="position.id"
                :disabled="!position.labware"
              />
            </el-select>
          </div>
          
          <div class="form-group">
            <label>Destination Position</label>
            <el-select v-model="editingStep.destination" placeholder="Select destination">
              <el-option
                v-for="position in availablePositions"
                :key="position.id"
                :label="`${position.label} - ${position.labware?.name || 'Empty'}`"
                :value="position.id"
                :disabled="!position.labware"
              />
            </el-select>
          </div>
          
          <div class="form-group">
            <label>Volume (µL)</label>
            <el-input-number 
              v-model="editingStep.volume" 
              :min="1" 
              :max="10000"
              :step="10"
              size="default"
            />
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showStepEditor = false">Cancel</el-button>
          <el-button type="primary" @click="saveStepEdit">Save</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Custom Task Form Modal -->
    <el-dialog 
      v-model="showCustomTaskForm"
      title="Create Custom Task"
      width="400px"
    >
      <div class="custom-task-form">
        <div class="form-group">
          <label>Task Name</label>
          <el-input 
            v-model="customTask.task" 
            placeholder="Enter custom task name"
            @keyup.enter="addCustomTask"
          />
        </div>
        
        <div class="form-group">
          <label>Duration (minutes)</label>
          <el-input-number 
            v-model="customTask.duration" 
            :min="1" 
            :max="999"
            size="default"
          />
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCustomTaskForm = false">Cancel</el-button>
          <el-button 
            type="primary" 
            @click="addCustomTask"
            :disabled="!customTask.task.trim()"
          >
            Add Task
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElNotification } from 'element-plus'
import ProtocolStep from './ProtocolStep.vue'
import type { 
  LiquidHandlerStep, 
  ProtocolSequence, 
  DeckPosition, 
  ValidationError 
} from '@/types/liquidHandler'
import { INSTRUMENTS, DEFAULT_DURATIONS, INSTRUMENT_ICONS, getInstrumentColor } from '@/constants/instruments'
import { useTheme } from '@/composables/useTheme'

interface Props {
  protocol: ProtocolSequence
  deckPositions: DeckPosition[]
  validationErrors: ValidationError[]
  canUndo: boolean
  canRedo: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'add-step': [step: Omit<LiquidHandlerStep, 'id'>]
  'edit-step': [stepId: string, updates: Partial<LiquidHandlerStep>]
  'remove-step': [stepId: string]
  'move-step': [fromIndex: number, toIndex: number]
  'clear-protocol': []
  'undo': []
  'redo': []
  'step-selected': [stepIndex: number]
}>()

const { currentTheme } = useTheme()

// State
const isDragOver = ref(false)
const activeStepIndex = ref(-1)
const showStepEditor = ref(false)
const showCustomTaskForm = ref(false)
const editingStep = ref<LiquidHandlerStep | null>(null)
const editingStepId = ref<string | null>(null)

// Custom task form
const customTask = reactive({
  task: '',
  duration: 15
})

// Liquid Handler specific tasks
const liquidHandlerTasks = INSTRUMENTS['Liquid Handler'] || []

// Computed
const totalDuration = computed(() => {
  return props.protocol.steps.reduce((total, step) => total + step.duration, 0)
})

const availablePositions = computed(() => {
  return props.deckPositions.filter(pos => pos.labware !== null)
})

// Task-specific mappings
const TASK_ICONS: Record<string, string> = {
  'Prime Tips': 'fas fa-syringe',
  'Transfer': 'fas fa-exchange-alt',
  'Wash Tips': 'fas fa-tint',
  'Aspirate': 'fas fa-arrow-up',
  'Dispense': 'fas fa-arrow-down',
  'Mix': 'fas fa-sync'
}

const TASK_DURATIONS: Record<string, number> = {
  'Prime Tips': 3,
  'Transfer': 15,
  'Wash Tips': 8,
  'Aspirate': 5,
  'Dispense': 5,
  'Mix': 10
}

// Methods
const getTaskIcon = (task: string): string => {
  return TASK_ICONS[task] || INSTRUMENT_ICONS['Liquid Handler'] || 'fas fa-syringe'
}

const getTaskDuration = (task: string): number => {
  return TASK_DURATIONS[task] || DEFAULT_DURATIONS['Liquid Handler'] || 15
}

const isTransferTask = (task: string): boolean => {
  return task.toLowerCase().includes('transfer')
}

const showTaskDetails = (task: string) => {
  // Add task directly when clicked (alternative to drag)
  addTaskToProtocol(task)
}

const addTaskToProtocol = (task: string) => {
  const stepColor = getInstrumentColor('Liquid Handler', currentTheme.value)
  
  const newStep: Omit<LiquidHandlerStep, 'id'> = {
    type: 'Liquid Handler',
    task: task,
    duration: getTaskDuration(task),
    color: stepColor
  }
  
  // Add transfer-specific defaults
  if (isTransferTask(task) && availablePositions.value.length >= 2) {
    newStep.source = availablePositions.value[0]?.id
    newStep.destination = availablePositions.value[1]?.id
    newStep.volume = 100
  }
  
  emit('add-step', newStep)
  
  ElNotification({
    title: 'Step Added',
    message: `${task} added to protocol`,
    type: 'success'
  })
}

const handleTaskDragStart = (event: DragEvent, task: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'instrument-task',
      instrumentType: 'Liquid Handler',
      task: task
    }))
  }
}

const handleTaskDragEnd = () => {
  isDragOver.value = false
}

const handleProtocolDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const data = event.dataTransfer?.getData('text/plain')
  if (!data) return
  
  try {
    const dragData = JSON.parse(data)
    
    if (dragData.type === 'instrument-task') {
      addTaskToProtocol(dragData.task)
    } else if (dragData.type === 'protocol-step') {
      // Handle step reordering
      const dropIndex = getDropIndex(event)
      if (dropIndex !== dragData.stepIndex) {
        emit('move-step', dragData.stepIndex, dropIndex)
      }
    }
  } catch (error) {
    console.error('Error parsing drag data:', error)
  }
}

const getDropIndex = (event: DragEvent): number => {
  const dropZone = event.currentTarget as HTMLElement
  const steps = dropZone.querySelectorAll('.protocol-step-card')
  const y = event.clientY
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as HTMLElement
    const rect = step.getBoundingClientRect()
    if (y < rect.top + rect.height / 2) {
      return i
    }
  }
  
  return steps.length
}

const handleStepClick = (index: number) => {
  activeStepIndex.value = index
  emit('step-selected', index)
}

const handleEditStep = (step: LiquidHandlerStep) => {
  editingStep.value = { ...step }
  editingStepId.value = step.id
  showStepEditor.value = true
}

const handleRemoveStep = (step: LiquidHandlerStep) => {
  emit('remove-step', step.id)
  
  ElNotification({
    title: 'Step Removed',
    message: `${step.task} removed from protocol`,
    type: 'info'
  })
}

const handleStepDragStart = () => {
  // Handled by ProtocolStep component
}

const saveStepEdit = () => {
  if (editingStep.value && editingStepId.value) {
    emit('edit-step', editingStepId.value, editingStep.value)
    
    ElNotification({
      title: 'Step Updated',
      message: `${editingStep.value.task} updated successfully`,
      type: 'success'
    })
  }
  
  resetStepEditor()
}

const resetStepEditor = () => {
  showStepEditor.value = false
  editingStep.value = null
  editingStepId.value = null
}

const addCustomTask = () => {
  if (!customTask.task.trim()) return
  
  addTaskToProtocol(customTask.task.trim())
  
  // Reset form
  customTask.task = ''
  customTask.duration = 15
  showCustomTaskForm.value = false
}

const clearProtocol = () => {
  emit('clear-protocol')
  
  ElNotification({
    title: 'Protocol Cleared',
    message: 'All steps removed from protocol',
    type: 'warning'
  })
}

const getStepValidationErrors = (stepId: string): ValidationError[] => {
  return props.validationErrors.filter(error => error.stepId === stepId)
}
</script>

<style scoped>
.protocol-builder {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--section-bg);
  border-bottom: 1px solid var(--border-color);
}

.protocol-info h4 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.125rem;
  font-weight: 600;
}

.subtitle {
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.builder-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.instrument-palette-section {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.instrument-palette-section h5 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.instruments-horizontal-row {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding: var(--spacing-sm) 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.instruments-horizontal-row::-webkit-scrollbar {
  display: none;
}

.instrument-task-container,
.custom-task-container {
  flex-shrink: 0;
}

.instrument-task-card,
.custom-task-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  min-width: 80px;
}

.instrument-task-card:hover,
.custom-task-card:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.custom-task-card.active {
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.task-icon,
.custom-task-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--section-bg);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  color: var(--primary-color);
  transition: all 0.2s ease;
}

.task-name,
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

.task-duration {
  font-size: 0.625rem;
  color: var(--text-light);
  background: var(--section-bg);
  padding: 0.125rem 0.25rem;
  border-radius: var(--radius-xs);
}

.protocol-sequence-section {
  padding: var(--spacing-lg);
}

.sequence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.sequence-header h5 {
  margin: 0;
  color: var(--text-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.sequence-stats {
  display: flex;
  gap: var(--spacing-xs);
}

.protocol-drop-zone {
  min-height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
  position: relative;
}

.protocol-drop-zone.drag-over {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.05);
}

.protocol-drop-zone.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-protocol {
  text-align: center;
  color: var(--text-light);
}

.empty-protocol i {
  font-size: 3rem;
  color: var(--text-faded);
  margin-bottom: var(--spacing-md);
  display: block;
}

.empty-protocol p {
  margin: 0;
  font-size: 0.875rem;
}

.protocol-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.step-editor-form,
.custom-task-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
}

.transfer-fields {
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .builder-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .builder-controls {
    justify-content: center;
  }
  
  .sequence-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }
  
  .sequence-stats {
    justify-content: center;
  }
  
  .instrument-task-card,
  .custom-task-card {
    min-width: 60px;
    padding: var(--spacing-sm);
  }
  
  .task-icon,
  .custom-task-icon {
    width: 24px;
    height: 24px;
    font-size: 0.875rem;
  }
  
  .task-name,
  .custom-task-name {
    font-size: 0.625rem;
  }
}

/* Theme compatibility and smooth transitions */
.protocol-builder,
.protocol-builder * {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease, 
              color 0.3s ease;
}
</style>