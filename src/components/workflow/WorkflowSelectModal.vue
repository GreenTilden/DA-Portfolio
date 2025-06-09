<template>
  <div class="workflow-select-modal">
    <!-- Create New Workflow Button -->
    <div class="create-workflow-section">
      <button class="create-workflow-button" @click="handleCreateWorkflow">
        <div class="create-icon">
          <i class="fas fa-plus"></i>
        </div>
        <div class="create-text">
          <h3>Create New Workflow</h3>
          <p>Start with a blank workflow</p>
        </div>
      </button>
    </div>

    <!-- Existing Workflows Grid -->
    <div v-if="workflows.length > 0" class="workflows-section">
      <h3 class="section-title">
        <i class="fas fa-project-diagram"></i>
        Existing Workflows ({{ workflows.length }})
      </h3>
      
      <div class="workflows-grid">
        <div 
          v-for="workflow in workflows" 
          :key="workflow.id"
          class="workflow-card"
          @click="handleSelectWorkflow(workflow.id)"
        >
          <!-- Workflow Header -->
          <div class="workflow-header">
            <div class="workflow-info">
              <h4 class="workflow-name">{{ workflow.name }}</h4>
              <div class="workflow-meta">
                <span class="lane-count">
                  <i class="fas fa-road"></i>
                  {{ workflow.lanes.length }} {{ workflow.lanes.length === 1 ? 'lane' : 'lanes' }}
                </span>
                <span class="priority-badge" :class="getPriorityClass(workflow.priority)">
                  Priority {{ workflow.priority }}
                </span>
              </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="workflow-actions" @click.stop>
              <button 
                class="action-btn"
                @click="handleEditWorkflowName(workflow)"
                title="Rename workflow"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="action-btn delete"
                @click="handleDeleteWorkflow(workflow.id)"
                title="Delete workflow"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- Workflow Preview -->
          <div class="workflow-preview">
            <div 
              v-for="lane in workflow.lanes.slice(0, 3)" 
              :key="lane.id"
              class="lane-preview"
            >
              <div class="lane-header">
                <span class="lane-name">{{ lane.name }}</span>
                <span class="step-count">{{ lane.steps.length }} steps</span>
              </div>
              <div class="steps-preview">
                <div 
                  v-for="step in lane.steps.slice(0, 4)" 
                  :key="step.id"
                  class="step-mini"
                  :title="`${step.type}: ${step.task}`"
                >
                  <i :class="getStepIcon(step.type)"></i>
                </div>
                <div v-if="lane.steps.length > 4" class="step-mini more">
                  +{{ lane.steps.length - 4 }}
                </div>
              </div>
            </div>
            
            <!-- Show more lanes indicator -->
            <div v-if="workflow.lanes.length > 3" class="more-lanes">
              <i class="fas fa-ellipsis-h"></i>
              +{{ workflow.lanes.length - 3 }} more {{ workflow.lanes.length - 3 === 1 ? 'lane' : 'lanes' }}
            </div>
          </div>

          <!-- Workflow Stats -->
          <div class="workflow-stats">
            <div class="stat-item">
              <i class="fas fa-tasks"></i>
              <span>{{ getTotalSteps(workflow) }} tasks</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>{{ getEstimatedDuration(workflow) }}min</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-clipboard-list"></i>
      </div>
      <h3>No Workflows Yet</h3>
      <p>Create your first workflow to get started with laboratory automation optimization</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Workflow } from '@/types/workflow'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { INSTRUMENT_ICONS, DEFAULT_DURATIONS } from '@/constants/instruments'

interface Props {
  onSelect: (workflowId: string) => void
}

const props = defineProps<Props>()

const { workflows, updateWorkflows } = useWorkflowState()

// Create new workflow
const handleCreateWorkflow = () => {
  const newWorkflow: Workflow = {
    id: `workflow-${Date.now()}`,
    name: `Workflow ${workflows.value.length + 1}`,
    priority: workflows.value.length + 1,
    isEditingName: false,
    editName: '',
    lanes: [{
      id: `lane-${Date.now()}`,
      name: 'Lane 1',
      isEditingName: false,
      editName: '',
      steps: []
    }]
  }
  
  const updatedWorkflows = [...workflows.value, newWorkflow]
  updateWorkflows(updatedWorkflows)
  props.onSelect(newWorkflow.id)
}

// Select existing workflow
const handleSelectWorkflow = (workflowId: string) => {
  props.onSelect(workflowId)
}

// Edit workflow name
const handleEditWorkflowName = (workflow: Workflow) => {
  const newName = prompt('Enter new workflow name:', workflow.name)
  if (newName && newName.trim() !== workflow.name) {
    const updatedWorkflows = workflows.value.map(w => 
      w.id === workflow.id ? { ...w, name: newName.trim() } : w
    )
    updateWorkflows(updatedWorkflows)
  }
}

// Delete workflow
const handleDeleteWorkflow = (workflowId: string) => {
  if (confirm('Are you sure you want to delete this workflow?')) {
    const updatedWorkflows = workflows.value.filter(w => w.id !== workflowId)
    updateWorkflows(updatedWorkflows)
  }
}

// Helper functions
const getStepIcon = (type: string) => {
  return INSTRUMENT_ICONS[type] || 'fas fa-cog'
}

const getPriorityClass = (priority: number) => {
  if (priority <= 2) return 'high'
  if (priority <= 4) return 'medium'
  return 'low'
}

const getTotalSteps = (workflow: Workflow) => {
  return workflow.lanes.reduce((total, lane) => total + lane.steps.length, 0)
}

const getEstimatedDuration = (workflow: Workflow) => {
  const totalMinutes = workflow.lanes.reduce((total, lane) => {
    return total + lane.steps.reduce((laneTotal, step) => {
      return laneTotal + (step.duration || DEFAULT_DURATIONS[step.type] || 5)
    }, 0)
  }, 0)
  return Math.round(totalMinutes)
}
</script>

<style scoped>
.workflow-select-modal {
  padding: 1rem 0;
}

.create-workflow-section {
  margin-bottom: 2rem;
}

.create-workflow-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-md);
}

.create-workflow-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.create-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 1.5rem;
}

.create-text {
  text-align: left;
}

.create-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.create-text p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.875rem;
}

.workflows-section {
  margin-top: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  color: var(--text-light);
  font-size: 1.125rem;
  font-weight: 500;
}

.section-title i {
  color: var(--primary-color);
}

.workflows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.workflow-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.workflow-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.workflow-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.workflow-info {
  flex: 1;
}

.workflow-name {
  margin: 0 0 0.5rem 0;
  color: var(--text-light);
  font-size: 1.125rem;
  font-weight: 600;
}

.workflow-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.lane-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.priority-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.priority-badge.high {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.priority-badge.medium {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.priority-badge.low {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.workflow-actions {
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

.action-btn:hover {
  background: var(--hover-bg);
  color: var(--text-light);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.workflow-preview {
  margin-bottom: 1rem;
}

.lane-preview {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: var(--background-alt);
  border-radius: 6px;
  border: 1px solid var(--border-light);
}

.lane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.lane-name {
  font-weight: 500;
  color: var(--text-light);
  font-size: 0.875rem;
}

.step-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.steps-preview {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.step-mini {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 0.625rem;
}

.step-mini.more {
  background: var(--text-muted);
  font-size: 0.5rem;
  font-weight: 500;
}

.more-lanes {
  text-align: center;
  padding: 0.5rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  border-top: 1px solid var(--border-light);
  margin-top: 0.5rem;
}

.workflow-stats {
  display: flex;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-light);
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

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-light);
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .workflows-grid {
    grid-template-columns: 1fr;
  }
  
  .create-workflow-button {
    padding: 1rem;
  }
  
  .create-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .workflow-card {
    padding: 1rem;
  }
  
  .workflow-actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
}
</style>