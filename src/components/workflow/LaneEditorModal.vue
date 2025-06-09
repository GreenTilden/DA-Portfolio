<template>
  <div class="lane-editor-modal">
    <!-- Editor Header -->
    <div class="editor-header">
      <div class="lane-info">
        <div class="breadcrumb">
          <span class="workflow-name">{{ selectedWorkflow?.name }}</span>
          <i class="fas fa-chevron-right"></i>
          <span class="lane-name">{{ selectedLane?.name }}</span>
        </div>
        <div class="lane-stats">
          <span class="step-count">
            <i class="fas fa-tasks"></i>
            {{ selectedLane?.steps.length || 0 }} steps
          </span>
          <span class="duration-total">
            <i class="fas fa-clock"></i>
            {{ getTotalDuration() }}min total
          </span>
        </div>
      </div>
      
      <div class="editor-actions">
        <button 
          class="action-button secondary"
          @click="handleClearLane"
          :disabled="!selectedLane?.steps.length"
        >
          <i class="fas fa-trash"></i>
          <span class="button-text">Clear Lane</span>
        </button>
        
        <button 
          class="action-button primary"
          @click="handleRenameLane"
        >
          <i class="fas fa-edit"></i>
          <span class="button-text">Rename</span>
        </button>
      </div>
    </div>

    <!-- Mobile Notice -->
    <div v-if="isMobile" class="mobile-notice">
      <i class="fas fa-mobile-alt"></i>
      <span>Tap and hold to drag steps • Use position controls for precise placement</span>
    </div>

    <!-- Pending Task Indicator -->
    <div v-if="pendingTask && openedFromFAB" class="pending-task-banner">
      <div class="pending-icon">
        <i :class="getStepIcon(pendingTask)"></i>
      </div>
      <div class="pending-content">
        <div class="pending-header">
          <strong>Adding: {{ pendingTask.type }}</strong>
          <span class="pending-duration">{{ pendingTask.duration }}min</span>
        </div>
        <div class="pending-task-name">{{ pendingTask.task }}</div>
      </div>
      <div class="pending-actions">
        <button class="quick-add-button" @click="handleQuickAdd">
          <i class="fas fa-plus"></i>
          Add to End
        </button>
      </div>
    </div>

    <!-- Steps Editor -->
    <div class="steps-editor-container">
      <div v-if="!selectedLane?.steps.length && !pendingTask" class="empty-lane-editor">
        <div class="empty-icon">
          <i class="fas fa-plus-circle"></i>
        </div>
        <h3>Empty Lane</h3>
        <p>This lane has no steps yet. Use the instrument palette to add your first step.</p>
        <button class="action-button primary" @click="showInstrumentPalette = true">
          <i class="fas fa-toolbox"></i>
          Open Instrument Palette
        </button>
      </div>

      <div v-else class="steps-editor">
        <!-- Unified Vertical Drag-to-Sort Interface -->
        <div class="steps-list-container">
          <div 
            class="lane-steps vertical-sortable"
            :data-workflow-id="workflowId"
            :data-lane-id="laneId"
            @dragover="handleDragOver"
            @drop="handleDrop"
            @dragleave="handleDragLeave"
          >
            <transition-group name="step-reorder" tag="div" class="steps-list">
              <div 
                v-for="(step, index) in selectedLane.steps" 
                :key="step.id"
                class="step-item"
                :class="{ 
                  'dragging': dragState.draggedStep?.id === step.id,
                  'drag-over': dragState.dragOverIndex === index,
                  'is-mobile': isMobile
                }"
                draggable="true"
                @dragstart="handleStepDragStart($event, step, index)"
                @dragend="handleDragEnd"
                @touchstart="handleTouchStart($event, step, index)"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
              >
                <!-- Drag Handle -->
                <div class="drag-handle" :class="{ 'mobile': isMobile }">
                  <div class="drag-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                  <div class="step-number">{{ index + 1 }}</div>
                </div>
                
                <!-- Step Content -->
                <div class="step-content-wrapper">
                  <StepCard 
                    :step="step"
                    :index="index"
                    :is-editable="true"
                    :is-mobile="isMobile"
                    @edit="handleEditStep"
                    @delete="handleDeleteStep"
                    @duration-change="handleStepDurationChange"
                  />
                </div>
                
                <!-- Position Controls (Mobile) -->
                <div v-if="isMobile" class="position-controls">
                  <button 
                    class="position-btn up"
                    @click="handleMoveStepUp(index)"
                    :disabled="index === 0"
                    title="Move up"
                  >
                    <i class="fas fa-chevron-up"></i>
                  </button>
                  <button 
                    class="position-btn down"
                    @click="handleMoveStepDown(index)"
                    :disabled="index === selectedLane.steps.length - 1"
                    title="Move down"
                  >
                    <i class="fas fa-chevron-down"></i>
                  </button>
                </div>
              </div>
            </transition-group>
            
            <!-- Drop Zone Indicators -->
            <div 
              v-for="index in selectedLane.steps.length + 1" 
              :key="`drop-${index - 1}`"
              class="drop-zone"
              :class="{ 'active': dragState.showDropZone && dragState.dropIndex === index - 1 }"
              :data-drop-index="index - 1"
              @dragover.prevent="handleDropZoneOver($event, index - 1)"
              @drop="handleDropZoneDrop($event, index - 1)"
            >
              <div class="drop-indicator">
                <i class="fas fa-plus"></i>
                <span>Drop here</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step Detail Editor -->
    <StepDetailEditor
      v-if="editingStep"
      :step="editingStep"
      :visible="!!editingStep"
      @save="handleSaveStepEdit"
      @cancel="editingStep = null"
    />

    <!-- Instrument Palette Modal -->
    <InstrumentPaletteModal
      v-if="showInstrumentPalette"
      :visible="showInstrumentPalette"
      @close="showInstrumentPalette = false"
      @select="handleInstrumentSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import type { Workflow, Lane, Step } from '@/types/workflow'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { useDragDrop } from '@/composables/useDragDrop'
import { useTouchDragDrop } from '@/composables/useTouchDragDrop'
import { INSTRUMENT_ICONS, DEFAULT_DURATIONS } from '@/constants/instruments'

// Import components (these would need to be created)
import StepCard from '../StepCard.vue'
// import StepDetailEditor from './StepDetailEditor.vue'
// import InstrumentPaletteModal from './InstrumentPaletteModal.vue'

interface Props {
  workflowId: string | null
  laneId: string | null
  pendingTask: Step | null
  openedFromFAB: boolean
  onComplete: () => void
}

const props = defineProps<Props>()

const { workflows, updateWorkflows } = useWorkflowState()
const { setDragData, getDragData } = useDragDrop()

// Reactive state
const editingStep = ref<Step | null>(null)
const showInstrumentPalette = ref(false)
const isMobile = ref(false)

// Drag state
const dragState = reactive({
  isDragging: false,
  draggedStep: null as Step | null,
  draggedIndex: -1,
  dragOverIndex: -1,
  showDropZone: false,
  dropIndex: -1
})

// Touch drag drop setup
const dragHandlers = {
  handleDragOver: (event: any, workflowId: string, laneId: string) => {
    handleDragOver(event)
  },
  handleDrop: (event: any, workflowId: string, laneId: string) => {
    handleDrop(event)
  },
  handleDragEnd: () => {
    handleDragEnd()
  }
}

const { 
  touchState, 
  handleTouchStart: touchDragStart, 
  handleTouchMove: touchDragMove, 
  handleTouchEnd: touchDragEnd 
} = useTouchDragDrop(dragHandlers)

// Computed properties
const selectedWorkflow = computed(() => {
  return workflows.value.find(w => w.id === props.workflowId)
})

const selectedLane = computed(() => {
  return selectedWorkflow.value?.lanes.find(l => l.id === props.laneId)
})

// Lifecycle
onMounted(() => {
  // Detect mobile
  isMobile.value = window.innerWidth <= 768 || 'ontouchstart' in window
  
  // Handle window resize
  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768 || 'ontouchstart' in window
  }
  window.addEventListener('resize', handleResize)
  
  // Add pending task if opened from FAB
  if (props.pendingTask && props.openedFromFAB) {
    setTimeout(() => {
      // Auto-focus on the pending task banner
      const banner = document.querySelector('.pending-task-banner')
      banner?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {})
})

// Helper functions
const getStepIcon = (step: Step) => {
  if (step.customIcon) return step.customIcon
  return INSTRUMENT_ICONS[step.type] || 'fas fa-cog'
}

const getTotalDuration = () => {
  if (!selectedLane.value) return 0
  const total = selectedLane.value.steps.reduce((sum, step) => {
    return sum + (step.duration || DEFAULT_DURATIONS[step.type] || 5)
  }, 0)
  return Math.round(total)
}

const updateLaneSteps = (newSteps: Step[]) => {
  if (!selectedWorkflow.value || !selectedLane.value) return
  
  const updatedWorkflows = workflows.value.map(w => 
    w.id === props.workflowId 
      ? {
          ...w,
          lanes: w.lanes.map(l => 
            l.id === props.laneId 
              ? { ...l, steps: newSteps }
              : l
          )
        }
      : w
  )
  
  updateWorkflows(updatedWorkflows)
}

// Quick add pending task
const handleQuickAdd = () => {
  if (!props.pendingTask || !selectedLane.value) return
  
  const newSteps = [...selectedLane.value.steps, { ...props.pendingTask }]
  updateLaneSteps(newSteps)
  props.onComplete()
}

// Lane management
const handleRenameLane = () => {
  if (!selectedLane.value) return
  
  const newName = prompt('Enter new lane name:', selectedLane.value.name)
  if (newName && newName.trim() !== selectedLane.value.name) {
    const updatedWorkflows = workflows.value.map(w => 
      w.id === props.workflowId 
        ? {
            ...w,
            lanes: w.lanes.map(l => 
              l.id === props.laneId 
                ? { ...l, name: newName.trim() }
                : l
            )
          }
        : w
    )
    updateWorkflows(updatedWorkflows)
  }
}

const handleClearLane = () => {
  if (!selectedLane.value?.steps.length) return
  
  if (confirm('Are you sure you want to remove all steps from this lane?')) {
    updateLaneSteps([])
  }
}

// Step management
const handleEditStep = (step: Step) => {
  editingStep.value = { ...step }
}

const handleDeleteStep = (stepId: string) => {
  if (!selectedLane.value) return
  
  if (confirm('Are you sure you want to delete this step?')) {
    const newSteps = selectedLane.value.steps.filter(s => s.id !== stepId)
    updateLaneSteps(newSteps)
  }
}

const handleStepDurationChange = (stepId: string, newDuration: number) => {
  if (!selectedLane.value) return
  
  const newSteps = selectedLane.value.steps.map(s => 
    s.id === stepId ? { ...s, duration: newDuration } : s
  )
  updateLaneSteps(newSteps)
}

const handleSaveStepEdit = (updatedStep: Step) => {
  if (!selectedLane.value) return
  
  const newSteps = selectedLane.value.steps.map(s => 
    s.id === updatedStep.id ? updatedStep : s
  )
  updateLaneSteps(newSteps)
  editingStep.value = null
}

// Mobile step movement
const handleMoveStepUp = (index: number) => {
  if (!selectedLane.value || index <= 0) return
  
  const steps = [...selectedLane.value.steps]
  [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]]
  updateLaneSteps(steps)
}

const handleMoveStepDown = (index: number) => {
  if (!selectedLane.value || index >= selectedLane.value.steps.length - 1) return
  
  const steps = [...selectedLane.value.steps]
  [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]]
  updateLaneSteps(steps)
}

// Desktop drag and drop
const handleStepDragStart = (event: DragEvent, step: Step, index: number) => {
  if (!event.dataTransfer) return
  
  const dragItem = {
    ...step,
    isExistingStep: true,
    sourceWorkflowId: props.workflowId,
    sourceLaneId: props.laneId,
    sourceIndex: index
  }
  
  setDragData(event, dragItem)
  
  dragState.isDragging = true
  dragState.draggedStep = step
  dragState.draggedIndex = index
  
  event.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  dragState.showDropZone = true
  
  // Calculate drop index based on mouse position
  const container = event.currentTarget as HTMLElement
  const steps = container.querySelectorAll('.workflow-step')
  
  let dropIndex = steps.length
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as HTMLElement
    const rect = step.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    
    if (event.clientX < centerX) {
      dropIndex = i
      break
    }
  }
  
  dragState.dropIndex = dropIndex
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  const dragData = getDragData(event)
  if (!dragData || !selectedLane.value) return
  
  let newSteps = [...selectedLane.value.steps]
  
  // Handle internal reordering
  if (dragData.isExistingStep && 
      dragData.sourceWorkflowId === props.workflowId && 
      dragData.sourceLaneId === props.laneId) {
    
    // Remove from original position
    const [movedStep] = newSteps.splice(dragData.sourceIndex, 1)
    
    // Insert at new position
    const insertIndex = dragState.dropIndex > dragData.sourceIndex 
      ? dragState.dropIndex - 1 
      : dragState.dropIndex
    
    newSteps.splice(insertIndex, 0, movedStep)
  } else {
    // Handle external drop (from palette or other lane)
    const newStep: Step = {
      id: `step-${Date.now()}`,
      type: dragData.type,
      task: dragData.task,
      duration: dragData.duration,
      customIcon: dragData.customIcon
    }
    
    newSteps.splice(dragState.dropIndex, 0, newStep)
  }
  
  updateLaneSteps(newSteps)
  handleDragEnd()
}

const handleDragLeave = (event: DragEvent) => {
  // Only hide if actually leaving the container
  const related = event.relatedTarget as HTMLElement
  const container = event.currentTarget as HTMLElement
  
  if (!container.contains(related)) {
    dragState.showDropZone = false
  }
}

const handleDragEnd = () => {
  dragState.isDragging = false
  dragState.draggedStep = null
  dragState.draggedIndex = -1
  dragState.dragOverIndex = -1
  dragState.showDropZone = false
  dragState.dropIndex = -1
}

// Drop zone handlers for vertical interface
const handleDropZoneOver = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  dragState.showDropZone = true
  dragState.dropIndex = dropIndex
}

const handleDropZoneDrop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()
  
  const dragData = getDragData(event)
  if (!dragData || !selectedLane.value) return
  
  let newSteps = [...selectedLane.value.steps]
  
  // Handle internal reordering
  if (dragData.isExistingStep && 
      dragData.sourceWorkflowId === props.workflowId && 
      dragData.sourceLaneId === props.laneId) {
    
    // Remove from original position
    const [movedStep] = newSteps.splice(dragData.sourceIndex, 1)
    
    // Insert at new position
    const insertIndex = dropIndex > dragData.sourceIndex 
      ? dropIndex - 1 
      : dropIndex
    
    newSteps.splice(insertIndex, 0, movedStep)
  } else {
    // Handle external drop (from palette or other lane)
    const newStep: Step = {
      id: `step-${Date.now()}`,
      type: dragData.type,
      task: dragData.task,
      duration: dragData.duration,
      customIcon: dragData.customIcon
    }
    
    newSteps.splice(dropIndex, 0, newStep)
  }
  
  updateLaneSteps(newSteps)
  handleDragEnd()
}

// Touch drag and drop for mobile
const handleTouchStart = (event: TouchEvent, step: Step, index: number) => {
  const dragItem = {
    ...step,
    isExistingStep: true,
    sourceWorkflowId: props.workflowId,
    sourceLaneId: props.laneId,
    sourceIndex: index
  }
  
  touchDragStart(event, dragItem)
}

const handleTouchMove = (event: TouchEvent) => {
  touchDragMove(event)
}

const handleTouchEnd = (event: TouchEvent) => {
  const result = touchDragEnd(event)
  
  // Handle successful touch drop
  if (result && selectedLane.value) {
    // The touch system already handled the drop through dragHandlers
    // Just clean up any remaining state
    handleDragEnd()
  }
}

// Instrument selection
const handleInstrumentSelect = (instrument: any) => {
  if (!selectedLane.value) return
  
  const newStep: Step = {
    id: `step-${Date.now()}`,
    type: instrument.type,
    task: instrument.task,
    duration: instrument.duration || DEFAULT_DURATIONS[instrument.type] || 5,
    customIcon: instrument.customIcon
  }
  
  const newSteps = [...selectedLane.value.steps, newStep]
  updateLaneSteps(newSteps)
  showInstrumentPalette.value = false
}
</script>

<style scoped>
.lane-editor-modal {
  padding: 1rem 0;
  max-height: 70vh;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.lane-info {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.workflow-name {
  color: var(--text-light);
  font-weight: 500;
}

.lane-name {
  color: var(--primary-color);
  font-weight: 600;
}

.breadcrumb i {
  font-size: 0.75rem;
}

.lane-stats {
  display: flex;
  gap: 1rem;
}

.step-count,
.duration-total {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.step-count i,
.duration-total i {
  color: var(--primary-color);
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.action-button:hover:not(:disabled) {
  background: var(--hover-bg);
  border-color: var(--primary-color);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.secondary {
  background: transparent;
}

.action-button.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.mobile-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(var(--primary-color-rgb), 0.1);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.mobile-notice i {
  color: var(--primary-color);
}

.pending-task-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-md);
}

.pending-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1.25rem;
}

.pending-content {
  flex: 1;
}

.pending-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.pending-duration {
  font-size: 0.875rem;
  opacity: 0.9;
}

.pending-task-name {
  font-size: 0.875rem;
  opacity: 0.9;
}

.quick-add-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.quick-add-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Steps Editor */
.steps-editor-container {
  min-height: 300px;
  background: var(--background-alt);
  border-radius: 12px;
  padding: 1rem;
}

.empty-lane-editor {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
  background: var(--background-alt);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
}

.empty-lane-editor .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-lane-editor h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-light);
  font-size: 1.25rem;
}

.empty-lane-editor p {
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Vertical Drag-to-Sort Interface */
.steps-list-container {
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 1rem;
}

.lane-steps.vertical-sortable {
  position: relative;
  min-height: 200px;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--background-alt);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.2s ease;
  cursor: grab;
  position: relative;
}

.step-item:hover {
  border-color: var(--primary-color);
  background: var(--hover-bg);
}

.step-item:active {
  cursor: grabbing;
}

.step-item.dragging {
  opacity: 0.6;
  transform: scale(0.98);
  z-index: 10;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.step-item.drag-over {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
}

.step-item.is-mobile {
  padding: 1rem;
}

/* Drag Handle */
.drag-handle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  width: 48px;
  padding: 0.5rem;
  border-radius: 6px;
  background: var(--section-bg);
  cursor: grab;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  background: var(--primary-color);
  color: white;
}

.drag-handle.mobile {
  width: 56px;
  padding: 0.75rem;
}

.drag-dots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
  width: 12px;
  opacity: 0.6;
}

.drag-dots .dot {
  width: 3px;
  height: 3px;
  background: currentColor;
  border-radius: 50%;
}

.step-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border-radius: 50%;
  border: 1px solid var(--border-light);
}

.drag-handle:hover .step-number {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-color: transparent;
}

/* Step Content */
.step-content-wrapper {
  flex: 1;
  min-width: 0;
}

/* Position Controls (Mobile) */
.position-controls {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-shrink: 0;
}

.position-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.position-btn:active:not(:disabled) {
  transform: scale(0.9);
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.position-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Drop Zones */
.drop-zone {
  position: relative;
  min-height: 8px;
  margin: 0.25rem 0;
  opacity: 0;
  transition: all 0.2s ease;
}

.drop-zone.active {
  opacity: 1;
  min-height: 40px;
}

.drop-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
  border: 2px dashed var(--primary-color);
  border-radius: 6px;
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.drop-indicator i {
  font-size: 1rem;
}

/* Step Reorder Transitions */
.step-reorder-move {
  transition: transform 0.3s ease;
}

.step-reorder-enter-active {
  transition: all 0.3s ease;
}

.step-reorder-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  left: 0;
  right: 0;
}

.step-reorder-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.step-reorder-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .lane-editor-modal {
    max-height: 80vh;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .editor-actions {
    justify-content: center;
  }
  
  .pending-task-banner {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .lane-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .steps-list-container {
    padding: 0.75rem;
  }
  
  .step-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .step-item.is-mobile {
    padding: 1rem;
  }
  
  .drag-handle.mobile {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }
  
  .position-controls {
    flex-direction: row;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .position-btn {
    width: 40px;
    height: 40px;
  }
}

/* Drag and drop visual enhancements */
.lane-steps.drag-over {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
}

/* Touch drag feedback */
.touch-drag-clone {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

/* Animation keyframes */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(74, 144, 226, 0.6), 0 0 30px rgba(74, 144, 226, 0.4);
  }
  50% {
    box-shadow: 0 0 25px rgba(74, 144, 226, 0.8), 0 0 50px rgba(74, 144, 226, 0.6);
  }
}

/* Enhanced drop indicator styles */
.enhanced-drop-indicator {
  animation: pulseGlow 1.2s ease-in-out infinite;
}
</style>