<template>
  <div class="lane-select-modal">
    <!-- Workflow Info Header -->
    <div class="workflow-info-header">
      <div class="workflow-summary">
        <div class="workflow-icon">
          <i class="fas fa-project-diagram"></i>
        </div>
        <div class="workflow-details">
          <h3>{{ selectedWorkflow?.name }}</h3>
          <p class="workflow-meta">
            Priority {{ selectedWorkflow?.priority }} • 
            {{ selectedWorkflow?.lanes.length }} {{ selectedWorkflow?.lanes.length === 1 ? 'lane' : 'lanes' }}
          </p>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="workflow-actions">
        <button 
          class="action-button secondary"
          @click="handleAddLane"
          title="Add new lane"
        >
          <i class="fas fa-plus"></i>
          <span class="button-text">Add Lane</span>
        </button>
      </div>
    </div>

    <!-- Lanes Grid - Side by Side -->
    <div class="lanes-container">
      <div class="lanes-grid">
        <div 
          v-for="lane in selectedWorkflow?.lanes" 
          :key="lane.id"
          class="lane-card"
          @click="handleSelectLane(lane.id)"
        >
          <!-- Lane Header -->
          <div class="lane-header">
            <div class="lane-info">
              <h4 class="lane-name">{{ lane.name }}</h4>
              <div class="lane-stats">
                <span class="step-count">
                  <i class="fas fa-tasks"></i>
                  {{ lane.steps.length }} {{ lane.steps.length === 1 ? 'step' : 'steps' }}
                </span>
                <span class="duration-estimate">
                  <i class="fas fa-clock"></i>
                  {{ getLaneDuration(lane) }}min
                </span>
              </div>
            </div>
            
            <!-- Lane Actions -->
            <div class="lane-actions" @click.stop>
              <button 
                class="action-btn"
                @click="handleEditLaneName(lane)"
                title="Rename lane"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="action-btn delete"
                @click="handleDeleteLane(lane.id)"
                title="Delete lane"
                :disabled="(selectedWorkflow?.lanes?.length || 0) <= 1"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- Steps Preview -->
          <div class="steps-container">
            <div v-if="lane.steps.length === 0" class="empty-lane">
              <div class="empty-icon">
                <i class="fas fa-plus-circle"></i>
              </div>
              <p>Empty lane - click to add steps</p>
            </div>
            
            <div v-else class="steps-preview">
              <div 
                v-for="(step, index) in lane.steps" 
                :key="step.id"
                class="step-card"
                :class="{ 'highlighted': index === 0 }"
              >
                <div class="step-icon">
                  <i :class="getStepIcon(step)"></i>
                </div>
                <div class="step-content">
                  <div class="step-header">
                    <span class="step-type">{{ step.type }}</span>
                    <span class="step-duration">{{ step.duration }}min</span>
                  </div>
                  <div class="step-task">{{ step.task }}</div>
                </div>
              </div>
            </div>

            <!-- Add Step Indicator -->
            <div v-if="pendingTask" class="pending-task-indicator">
              <div class="pending-icon">
                <i class="fas fa-plus"></i>
              </div>
              <div class="pending-content">
                <div class="pending-header">
                  <span class="pending-type">{{ pendingTask.type }}</span>
                  <span class="pending-duration">{{ pendingTask.duration }}min</span>
                </div>
                <div class="pending-task">{{ pendingTask.task }}</div>
              </div>
              <div class="pending-badge">NEW</div>
            </div>
          </div>

          <!-- Lane Summary -->
          <div class="lane-summary">
            <div class="summary-stats">
              <div class="stat-item">
                <i class="fas fa-layer-group"></i>
                <span>{{ getUniqueInstruments(lane).length }} instruments</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-chart-line"></i>
                <span>{{ getComplexityScore(lane) }}% complexity</span>
              </div>
            </div>
            
            <div class="select-indicator">
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State for No Lanes -->
    <div v-if="!selectedWorkflow?.lanes.length" class="empty-workflow">
      <div class="empty-icon">
        <i class="fas fa-road"></i>
      </div>
      <h3>No Lanes in Workflow</h3>
      <p>This workflow doesn't have any lanes yet. Add your first lane to get started.</p>
      <button class="action-button primary" @click="handleAddLane">
        <i class="fas fa-plus"></i>
        Add First Lane
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Workflow, Lane, Step } from '@/types/workflow'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { INSTRUMENT_ICONS, DEFAULT_DURATIONS } from '@/constants/instruments'

interface Props {
  onSelect: (laneId: string) => void
  workflowId: string | null
  pendingTask?: Step | null
}

const props = defineProps<Props>()

const { workflows, updateWorkflows } = useWorkflowState()

// Get selected workflow
const selectedWorkflow = computed(() => {
  return workflows.value.find(w => w.id === props.workflowId)
})

// Select lane
const handleSelectLane = (laneId: string) => {
  props.onSelect(laneId)
}

// Add new lane
const handleAddLane = () => {
  if (!selectedWorkflow.value) return
  
  const newLane: Lane = {
    id: `lane-${Date.now()}`,
    name: `Lane ${selectedWorkflow.value.lanes.length + 1}`,
    isEditingName: false,
    editName: '',
    steps: []
  }
  
  const updatedWorkflows = workflows.value.map(w => 
    w.id === props.workflowId 
      ? { ...w, lanes: [...w.lanes, newLane] }
      : w
  )
  
  updateWorkflows(updatedWorkflows)
  
  // Auto-select the new lane
  props.onSelect(newLane.id)
}

// Edit lane name
const handleEditLaneName = (lane: Lane) => {
  const newName = prompt('Enter new lane name:', lane.name)
  if (newName && newName.trim() !== lane.name) {
    const updatedWorkflows = workflows.value.map(w => 
      w.id === props.workflowId 
        ? {
            ...w, 
            lanes: w.lanes.map(l => 
              l.id === lane.id ? { ...l, name: newName.trim() } : l
            )
          }
        : w
    )
    updateWorkflows(updatedWorkflows)
  }
}

// Delete lane
const handleDeleteLane = (laneId: string) => {
  if (!selectedWorkflow.value || selectedWorkflow.value.lanes.length <= 1) return
  
  if (confirm('Are you sure you want to delete this lane and all its steps?')) {
    const updatedWorkflows = workflows.value.map(w => 
      w.id === props.workflowId 
        ? { ...w, lanes: w.lanes.filter(l => l.id !== laneId) }
        : w
    )
    updateWorkflows(updatedWorkflows)
  }
}

// Helper functions
const getStepIcon = (step: Step) => {
  if (step.customIcon) return step.customIcon
  return INSTRUMENT_ICONS[step.type] || 'fas fa-cog'
}

const getLaneDuration = (lane: Lane) => {
  const totalMinutes = lane.steps.reduce((total, step) => {
    return total + (step.duration || DEFAULT_DURATIONS[step.type] || 5)
  }, 0)
  return Math.round(totalMinutes)
}

const getUniqueInstruments = (lane: Lane) => {
  const instruments = new Set(lane.steps.map(step => step.type))
  return Array.from(instruments)
}

const getComplexityScore = (lane: Lane) => {
  if (lane.steps.length === 0) return 0
  
  const uniqueInstruments = getUniqueInstruments(lane).length
  const stepCount = lane.steps.length
  const avgDuration = getLaneDuration(lane) / stepCount
  
  // Simple complexity scoring based on variety and duration
  const complexity = Math.min(100, (uniqueInstruments * 20) + (stepCount * 5) + (avgDuration * 2))
  return Math.round(complexity)
}
</script>

<style scoped>
.lane-select-modal {
  padding: 1rem 0;
}

.workflow-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--card-bg);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.workflow-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.workflow-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  font-size: 1.25rem;
}

.workflow-details h3 {
  margin: 0 0 0.25rem 0;
  color: var(--text-light);
  font-size: 1.25rem;
  font-weight: 600;
}

.workflow-meta {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.workflow-actions {
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

.action-button:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
}

.action-button.secondary {
  background: transparent;
}

.action-button.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.lanes-container {
  max-height: 60vh;
  overflow-y: auto;
}

.lanes-grid {
  display: flex;
  gap: 1rem;
  align-items: stretch;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.lane-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  max-height: 400px;
  min-width: 280px;
  flex: 0 0 auto;
}

.lane-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.lane-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.lane-info {
  flex: 1;
}

.lane-name {
  margin: 0 0 0.5rem 0;
  color: var(--text-light);
  font-size: 1.125rem;
  font-weight: 600;
}

.lane-stats {
  display: flex;
  gap: 1rem;
}

.step-count,
.duration-estimate {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.step-count i,
.duration-estimate i {
  color: var(--primary-color);
}

.lane-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.action-btn:hover:not(:disabled) {
  background: var(--hover-bg);
  color: var(--text-light);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.steps-container {
  margin-bottom: 1rem;
}

.empty-lane {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  background: var(--background-alt);
  border: 2px dashed var(--border-color);
  border-radius: 8px;
}

.empty-lane .empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-lane p {
  margin: 0;
  font-size: 0.875rem;
}

.steps-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--background-alt);
  border-radius: 8px;
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.step-card.highlighted {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
}

.step-icon {
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

.step-content {
  flex: 1;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.step-type {
  font-weight: 500;
  color: var(--text-light);
  font-size: 0.875rem;
}

.step-duration {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.step-task {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.pending-task-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: 8px;
  margin-top: 0.5rem;
  position: relative;
}

.pending-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 0.875rem;
}

.pending-content {
  flex: 1;
}

.pending-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.pending-type {
  font-weight: 500;
  font-size: 0.875rem;
}

.pending-duration {
  font-size: 0.75rem;
  opacity: 0.9;
}

.pending-task {
  font-size: 0.75rem;
  opacity: 0.9;
}

.pending-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
}

.lane-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-light);
}

.summary-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-item i {
  color: var(--primary-color);
}

.select-indicator {
  color: var(--primary-color);
  font-size: 1rem;
}

.empty-workflow {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-workflow .empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-workflow h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-light);
  font-size: 1.25rem;
}

.empty-workflow p {
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .workflow-info-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .workflow-summary {
    justify-content: center;
  }
  
  .workflow-actions {
    justify-content: center;
  }
  
  .lane-header {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .lane-actions {
    align-self: flex-end;
  }
  
  .lane-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .lanes-grid {
    flex-direction: column;
    overflow-x: visible;
  }
  
  .lane-card {
    min-height: 250px;
    max-height: none;
    min-width: unset;
    flex: 1 1 auto;
  }
}
</style>