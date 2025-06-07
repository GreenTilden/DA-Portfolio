<template>
  <div class="workflow-builder">
    <div v-for="workflow in workflows" :key="workflow.id" class="workflow-section">
      <div class="workflow-header">
        <div class="workflow-name-container">
          <h4 v-if="!workflow.isEditingName" @click="startEditingWorkflowName(workflow)">
            {{ workflow.name }}
            <i class="fas fa-pen edit-icon"></i>
          </h4>
          <div v-else class="edit-name-container">
            <input 
              type="text" 
              v-model="workflow.editName" 
              @keyup.enter="saveWorkflowName(workflow)"
              @keyup.esc="cancelEditWorkflowName(workflow)"
              @blur="saveWorkflowName(workflow)"
              ref="workflowNameInput"
              class="edit-name-input"
            />
            <div class="edit-actions">
              <button @click="saveWorkflowName(workflow)" class="edit-action-btn save-btn">
                <i class="fas fa-check"></i>
              </button>
              <button @click="cancelEditWorkflowName(workflow)" class="edit-action-btn cancel-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="workflow-controls">
          <el-tag :type="getWorkflowTagType(workflow.priority)" size="small">
            Priority {{ workflow.priority }}
          </el-tag>
          <button class="add-lane-btn" @click="addNewLane(workflow)">
            <i class="fas fa-plus"></i> Add Lane
          </button>
        </div>
      </div>
      
      <div class="workflow-lanes">
        <div v-for="lane in workflow.lanes" :key="lane.id" class="labware-lane">
          <div class="lane-header">
            <div class="lane-name-container">
              <span v-if="!lane.isEditingName" @click="startEditingLaneName(lane)">
                <i class="fas fa-flask"></i>
                {{ lane.name }}
                <i class="fas fa-pen edit-icon"></i>
              </span>
              <div v-else class="edit-name-container">
                <input 
                  type="text" 
                  v-model="lane.editName" 
                  @keyup.enter="saveLaneName(lane)"
                  @keyup.esc="cancelEditLaneName(lane)"
                  @blur="saveLaneName(lane)"
                  ref="laneNameInput"
                  class="edit-name-input"
                />
                <div class="edit-actions">
                  <button @click="saveLaneName(lane)" class="edit-action-btn save-btn">
                    <i class="fas fa-check"></i>
                  </button>
                  <button @click="cancelEditLaneName(lane)" class="edit-action-btn cancel-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            <button 
              class="remove-lane-btn" 
              @click="removeLane(workflow, lane)" 
              v-if="workflow.lanes.length > 1"
              title="Remove lane"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <div 
            class="lane-steps"
            @dragover="handleDragOver"
            @drop="handleDrop($event, workflow, lane)"
            @dragleave="handleDragLeave"
          >
            <WorkflowStep
              v-for="(step, stepIndex) in lane.steps"
              :key="step.id"
              :step="step"
              :stepIndex="stepIndex"
              :workflowId="workflow.id"
              :laneId="lane.id"
              @remove="removeStep(workflow.id, lane.id, stepIndex)"
              @edit-duration="$emit('step-edited', step)"
              @drag-start="handleStepDragStart"
            />
            <div class="empty-lane-hint" v-if="lane.steps.length === 0">
              Drag instruments here to add steps
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Workflow, Lane, Step, DragItem } from '@/types/workflow'
import { useDragDrop } from '@/composables/useDragDrop'
import WorkflowStep from './WorkflowStep.vue'

interface Props {
  workflows: Workflow[]
  dragItem?: DragItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:workflows': [workflows: Workflow[]]
  'step-edited': [step: Step]
  'workflows-changed': []
}>()

const { 
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragOverWithIndicator,
  removeDropIndicators,
  extractSourceInfo,
  moveStep
} = useDragDrop()

// Name editing refs
const workflowNameInput = ref<HTMLInputElement[]>([])
const laneNameInput = ref<HTMLInputElement[]>([])

// Get workflow tag type based on priority
const getWorkflowTagType = (priority: number): string => {
  return priority === 1 ? 'danger' : priority === 2 ? 'warning' : 'info'
}

// Workflow name editing
const startEditingWorkflowName = async (workflow: Workflow) => {
  props.workflows.forEach(w => {
    w.isEditingName = false
  })
  
  workflow.isEditingName = true
  workflow.editName = workflow.name
  
  await nextTick()
  const input = workflowNameInput.value[0]
  if (input) {
    input.focus()
    input.select()
  }
}

const saveWorkflowName = (workflow: Workflow) => {
  if (workflow.editName && workflow.editName.trim() !== '') {
    workflow.name = workflow.editName.trim()
  }
  workflow.isEditingName = false
  emit('workflows-changed')
}

const cancelEditWorkflowName = (workflow: Workflow) => {
  workflow.isEditingName = false
}

// Lane name editing
const startEditingLaneName = async (lane: Lane) => {
  props.workflows.forEach(w => {
    w.lanes.forEach(l => {
      l.isEditingName = false
    })
  })
  
  lane.isEditingName = true
  lane.editName = lane.name
  
  await nextTick()
  const input = laneNameInput.value[0]
  if (input) {
    input.focus()
    input.select()
  }
}

const saveLaneName = (lane: Lane) => {
  if (lane.editName && lane.editName.trim() !== '') {
    lane.name = lane.editName.trim()
  }
  lane.isEditingName = false
  emit('workflows-changed')
}

const cancelEditLaneName = (lane: Lane) => {
  lane.isEditingName = false
}

// Lane management
const addNewLane = (workflow: Workflow) => {
  const newLaneId = `lane-${workflow.id}-${Date.now()}`
  const newLane: Lane = {
    id: newLaneId,
    name: `New Lane ${workflow.lanes.length + 1}`,
    isEditingName: false,
    editName: '',
    steps: []
  }
  
  workflow.lanes.push(newLane)
  emit('workflows-changed')
  
  // Start editing the name of the new lane
  nextTick(() => {
    startEditingLaneName(newLane)
  })
}

const removeLane = (workflow: Workflow, lane: Lane) => {
  if (workflow.lanes.length <= 1) return
  
  const laneIndex = workflow.lanes.findIndex(l => l.id === lane.id)
  if (laneIndex !== -1) {
    workflow.lanes.splice(laneIndex, 1)
    emit('workflows-changed')
  }
}

// Step management
const removeStep = (workflowId: string, laneId: string, stepIndex: number) => {
  const workflow = props.workflows.find(w => w.id === workflowId)
  if (!workflow) return
  
  const lane = workflow.lanes.find(l => l.id === laneId)
  if (!lane) return
  
  lane.steps.splice(stepIndex, 1)
  emit('workflows-changed')
}

// Drag and drop handlers
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  const target = event.currentTarget as HTMLElement
  if (target && !target.classList.contains('drag-over')) {
    target.classList.add('drag-over')
  }
  onDragOverWithIndicator(event, '.workflow-step')
}

const handleDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  
  // Only remove if truly leaving the container
  if (target && (!relatedTarget || !target.contains(relatedTarget))) {
    target.classList.remove('drag-over')
    removeDropIndicators()
  }
}

const handleDrop = (event: DragEvent, workflow: Workflow, lane: Lane) => {
  event.preventDefault()
  event.stopPropagation()
  
  // Clean up drag over state
  const target = event.currentTarget as HTMLElement
  if (target) {
    target.classList.remove('drag-over')
  }
  
  // Get the drop position BEFORE removing indicators
  const indicator = target.querySelector('.drop-indicator')
  let insertIndex = -1
  
  if (indicator) {
    const steps = Array.from(target.querySelectorAll('.workflow-step'))
    // Find the index where the indicator is positioned
    for (let i = 0; i < steps.length; i++) {
      if (indicator.compareDocumentPosition(steps[i]) & Node.DOCUMENT_POSITION_FOLLOWING) {
        // Indicator comes before this step
        insertIndex = i
        break
      }
    }
    if (insertIndex === -1) {
      // Indicator is after all steps
      insertIndex = steps.length
    }
  }
  
  // NOW clean up all drag indicators
  removeDropIndicators()
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over')
  })
  
  // Get drag data - try multiple formats
  let dragData = event.dataTransfer?.getData('application/json') || 
                 event.dataTransfer?.getData('text/plain')
  
  if (!dragData) {
    console.error('No drag data available')
    return
  }
  
  let draggedItem
  try {
    draggedItem = JSON.parse(dragData)
  } catch (e) {
    console.error('Failed to parse drag data:', e, dragData)
    return
  }
  
  // If it's an existing step being moved, handle reordering
  if (draggedItem.isExistingStep) {
    const sourceInfo = extractSourceInfo(draggedItem)
    if (!sourceInfo) {
      console.error('Invalid source information for existing step')
      return
    }
    
    // If no specific insert position, append to end
    if (insertIndex === -1) {
      insertIndex = lane.steps.length
    }
    
    // Use the moveStep helper to reorder
    const success = moveStep(
      props.workflows,
      sourceInfo,
      workflow.id,
      lane.id,
      insertIndex
    )
    
    if (success) {
      emit('workflows-changed')
    }
    return
  }
  
  // Create a new step (for dragging from instrument palette)
  const newStep: Step = {
    id: `${lane.id}-step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: draggedItem.type,
    task: draggedItem.task || draggedItem.type,
    duration: draggedItem.duration || 15,
    customIcon: draggedItem.customIcon
  }
  
  // Insert at the determined position
  if (insertIndex >= 0 && insertIndex < lane.steps.length) {
    lane.steps.splice(insertIndex, 0, newStep)
  } else {
    lane.steps.push(newStep)
  }
  
  emit('workflows-changed')
}

const handleStepDragStart = (event: DragEvent, step: Step) => {
  // This will be handled by the WorkflowStep component
  // But we can add any additional logic here if needed
}
</script>

<style scoped>
.workflow-builder {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.workflow-section {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  flex-shrink: 0;
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.workflow-header h4 {
  margin: 0;
  color: var(--text-light);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.workflow-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-lane-btn {
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-lane-btn:hover {
  background-color: #0e9f6e;
  transform: translateY(-1px);
}

.workflow-lanes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.labware-lane {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.lane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--secondary-color);
  font-weight: 500;
}

.lane-name-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.lane-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 60px;
  padding: 0.5rem;
  background-color: var(--bg-color);
  border: 2px dashed var(--border-color);
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
}

.lane-steps.drag-over {
  background-color: rgba(74, 144, 226, 0.1);
  border-color: var(--primary-color);
  border-width: 2px;
  border-style: solid;
}


.lane-steps::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  pointer-events: none;
  transition: all 0.2s ease;
}

.lane-steps.drag-over::before {
  background: radial-gradient(
    ellipse at center,
    rgba(74, 144, 226, 0.1) 0%,
    transparent 70%
  );
}

.empty-lane-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-muted);
  font-size: 0.875rem;
  font-style: italic;
  pointer-events: none;
}

.remove-lane-btn {
  background-color: var(--error-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.remove-lane-btn:hover {
  background-color: #dc2626;
  transform: scale(1.1);
}

/* Name editing styles */
.edit-icon {
  font-size: 0.75rem;
  margin-left: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: var(--primary-color);
}

.workflow-header h4:hover .edit-icon,
.lane-name-container:hover .edit-icon {
  opacity: 1;
}

.edit-name-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-name-input {
  background-color: var(--bg-color);
  border: 1px solid var(--primary-color);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  color: var(--text-light);
  width: 200px;
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
}

.edit-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.save-btn {
  background-color: var(--success-color);
  color: white;
}

.save-btn:hover {
  background-color: #0e9f6e;
}

.cancel-btn {
  background-color: var(--error-color);
  color: white;
}

.cancel-btn:hover {
  background-color: #dc2626;
}

/* Drop indicator - base styles */
:deep(.drop-indicator) {
  width: 4px;
  height: 50px; /* Taller for better visibility */
  border-radius: 2px;
  margin: 0 8px;
  animation: pulse 1s infinite;
  position: relative;
}

/* Drop indicator for adding new steps (blue) */
:deep(.drop-indicator-add) {
  background-color: #4a90e2;
  box-shadow: 0 0 10px #4a90e2, 0 0 20px #4a90e2, 0 0 30px rgba(74, 144, 226, 0.5);
}

:deep(.drop-indicator-add)::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #4a90e2;
}

:deep(.drop-indicator-add)::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #4a90e2;
}

/* Drop indicator for moving existing steps (green) */
:deep(.drop-indicator-move) {
  background-color: #10b981;
  box-shadow: 0 0 10px #10b981, 0 0 20px #10b981, 0 0 30px rgba(16, 185, 129, 0.5);
}

:deep(.drop-indicator-move)::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #10b981;
}

:deep(.drop-indicator-move)::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid #10b981;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Responsive */
@media (max-width: 768px) {
  .workflow-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .workflow-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .edit-name-input {
    width: 150px;
  }

@keyframes pulse {
  0%, 100% { 
    opacity: 0.8; 
    transform: scaleX(1);
  }
  50% { 
    opacity: 1; 
    transform: scaleX(1.5);
  }


}
}
</style>