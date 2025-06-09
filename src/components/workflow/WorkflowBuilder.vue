<template>
  <div class="workflow-builder">
    <div v-for="workflow in workflows" :key="workflow.id" class="workflow-section workflow-container" :data-workflow-id="workflow.id">
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
        <div v-for="lane in workflow.lanes" :key="lane.id" class="labware-lane workflow-lane" :data-lane-id="lane.id">
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
              class="remove-lane-btn-top" 
              @click="removeLane(workflow, lane)" 
              v-if="workflow.lanes.length > 1"
              title="Remove lane"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <div 
            class="lane-steps"
            @dragover="handleDragOver($event, workflow, lane)"
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, inject } from 'vue'
import type { Workflow, Lane, Step, DragItem } from '@/types/workflow'
import WorkflowStep from './WorkflowStep.vue'

interface Props {
  workflows: Workflow[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:workflows': [workflows: Workflow[]]
  'step-edited': [step: Step]
  'workflows-changed': []
}>()

// Inject drag handlers from parent
const dragState = inject<any>('dragState')
const dragHandlers = inject<any>('dragHandlers')

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
const handleDragOver = (event: DragEvent, workflow: Workflow, lane: Lane) => {
  if (!dragHandlers) return
  dragHandlers.handleDragOver(event, workflow.id, lane.id)
}

const handleDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  const relatedTarget = event.relatedTarget as HTMLElement
  
  // Only remove if truly leaving the container
  if (target && (!relatedTarget || !target.contains(relatedTarget))) {
    target.classList.remove('drag-over')
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove())
  }
}

const handleDrop = (event: DragEvent, workflow: Workflow, lane: Lane) => {
  if (!dragHandlers) return
  dragHandlers.handleDrop(event, workflow.id, lane.id)
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
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  background-color: var(--card-bg);
  border-radius: var(--radius-md);
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
  position: relative;
}

.lane-name-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.lane-steps {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  min-height: 60px;
  padding: 0.5rem;
  padding-right: 1rem; /* Extra padding for better scroll UX */
  background-color: var(--bg-color);
  border: 2px dashed var(--border-color);
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) var(--bg-light);
  /* Ensure workflow steps don't shrink */
  align-items: stretch;
  /* Enable touch scrolling on mobile */
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
}

/* Webkit scrollbar styling for better appearance */
.lane-steps::-webkit-scrollbar {
  height: 6px;
}

.lane-steps::-webkit-scrollbar-track {
  background: var(--bg-light);
  border-radius: 3px;
}

.lane-steps::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
  opacity: 0.7;
}

.lane-steps::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
  opacity: 1;
}

/* Scroll indicators for overflow content */
.labware-lane {
  position: relative;
}

.labware-lane::before,
.labware-lane::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 40px;
  background: linear-gradient(90deg, rgba(255,255,255,0.8), transparent);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.labware-lane::before {
  left: 0;
  background: linear-gradient(90deg, var(--card-bg) 0%, transparent 100%);
  border-radius: 0 20px 20px 0;
}

.labware-lane::after {
  right: 0;
  background: linear-gradient(270deg, var(--card-bg) 0%, transparent 100%);
  border-radius: 20px 0 0 20px;
}

/* Show scroll indicators when content overflows */
.labware-lane:hover::before,
.labware-lane:hover::after {
  opacity: 0.7;
}

/* Smooth workflow step sizing for horizontal layout */
.lane-steps .workflow-step {
  flex-shrink: 0;
  min-width: 120px;
  max-width: 200px;
}

/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .lane-steps {
    padding: 0.4rem;
    gap: 0.4rem;
    /* Enhanced mobile scrolling */
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
  }
  
  .lane-steps .workflow-step {
    min-width: 100px;
    max-width: 160px;
    font-size: 0.85rem;
    /* Add scroll snap for better mobile UX */
    scroll-snap-align: start;
  }
  
  .lane-steps::-webkit-scrollbar {
    height: 4px;
  }
  
  /* More prominent scroll indicators on mobile */
  .labware-lane::before,
  .labware-lane::after {
    width: 15px;
    height: 30px;
  }
  
  /* Make workflow lanes more touch-friendly */
  .labware-lane {
    margin: 0.5rem 0;
  }
  
  /* Ensure mobile scrolling momentum */
  .lane-steps {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
}

/* Enhanced empty lane styling */
.empty-lane-hint {
  color: var(--text-faded);
  font-style: italic;
  font-size: 0.875rem;
  padding: 1rem;
  text-align: center;
  min-width: 200px;
  flex-shrink: 0;
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

.remove-lane-btn-top {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: var(--error-color);
  color: white;
  border: none;
  border-radius: 20%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.remove-lane-btn-top:hover {
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

/* Drop indicator styles moved to parent component */

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