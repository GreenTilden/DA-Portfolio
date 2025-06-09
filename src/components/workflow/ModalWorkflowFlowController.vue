<template>
  <el-dialog
    v-model="dialogVisible"
    :title="''"
    :width="dynamicModalWidth"
    class="workflow-flow-modal"
    :close-on-click-modal="false"
    :show-close="false"
    destroy-on-close
  >
    <!-- Modal content with smooth transitions -->
    <div class="modal-content">
      <transition name="step-slide" mode="out-in">
        <!-- Step 1: Workflow Selection -->
        <div v-if="currentStep === 'workflow-selection'" key="workflow-selection" class="step-content">
          <div class="step-header">
            <div class="step-icon">
              <i class="fas fa-project-diagram"></i>
            </div>
            <div class="step-info">
              <h3>Select Workflow</h3>
              <p>Choose an existing workflow or create a new one</p>
            </div>
          </div>
          <div class="step-body">
            <slot name="workflow-selection" :on-select="handleWorkflowSelect">
              <div class="placeholder-content">
                <i class="fas fa-project-diagram"></i>
                <p>Workflow selection content goes here</p>
              </div>
            </slot>
          </div>
        </div>

        <!-- Step 2: Workflow Builder (Combined Lane Selection + Editing) -->
        <div v-else-if="currentStep === 'lane-selection'" key="workflow-builder" class="step-content">
          <div class="workflow-builder-header">
            <div class="workflow-info">
              <div class="workflow-icon">
                <i class="fas fa-code-branch"></i>
              </div>
              <div class="workflow-details">
                <h3>{{ selectedWorkflow?.name || 'Workflow' }}</h3>
                <div class="workflow-summary">
                  <span class="lane-count">
                    <i class="fas fa-road"></i>
                    {{ selectedWorkflow?.lanes.length || 0 }} {{ (selectedWorkflow?.lanes.length || 0) === 1 ? 'lane' : 'lanes' }}
                  </span>
                  <span class="instrument-count">
                    <i class="fas fa-layer-group"></i>
                    {{ getTotalInstruments() }} {{ getTotalInstruments() === 1 ? 'instrument' : 'instruments' }}
                  </span>
                  <el-button type="primary" size="small" @click="handleAddLane">
                    <el-icon><Plus /></el-icon>
                    Add Lane
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <div class="step-body">
            <!-- Condensed Workflow Overview using Element Plus -->
            <div class="workflow-overview">
              <el-scrollbar v-if="selectedWorkflow?.lanes?.length" class="lanes-scrollbar">
                <div class="lanes-container">
                  <draggable
                    v-model="selectedWorkflow.lanes"
                    :animation="200"
                    handle=".lane-drag-handle"
                    @change="handleLaneReorder"
                    item-key="id"
                  >
                  <template #item="{ element: lane }">
                    <el-card 
                      class="lane-card" 
                      shadow="hover"
                    >
                    <!-- Card Header -->
                    <template #header>
                      <div class="lane-card-header">
                        <el-icon class="lane-drag-handle"><More /></el-icon>
                        <span class="lane-name">{{ lane.name }}</span>
                        <div class="lane-actions">
                          <el-button 
                            type="danger" 
                            :icon="Delete" 
                            size="small" 
                            circle 
                            @click="handleDeleteLane(lane.id)"
                          />
                        </div>
                      </div>
                    </template>
                    
                    <!-- Lane Stats -->
                    <div class="lane-stats">
                      <el-tag size="small" type="info">
                        <el-icon><List /></el-icon>
                        {{ lane.steps.length }} steps
                      </el-tag>
                      <el-tag size="small" type="warning">
                        <el-icon><Timer /></el-icon>
                        {{ getLaneDuration(lane) }}min
                      </el-tag>
                    </div>
                    
                    <!-- Steps List -->
                    <div class="steps-container" @click="handleLaneSelect(lane.id)">
                      <el-scrollbar v-if="lane.steps.length" max-height="300px">
                        <draggable 
                          v-model="lane.steps"
                          class="steps-list"
                          :animation="200"
                          handle=".drag-handle"
                          @change="() => handleStepReorder(lane.id)"
                          item-key="id"
                        >
                          <template #item="{ element: step, index: stepIndex }">
                            <div 
                              class="step-item"
                            >
                              <el-icon class="drag-handle"><Rank /></el-icon>
                              <el-avatar 
                                :size="32" 
                                :style="{ backgroundColor: getStepColor(step.type) }"
                              >
                                <el-icon><component :is="getStepIconComponent(step.type)" /></el-icon>
                              </el-avatar>
                              <div class="step-content">
                                <div class="step-header">
                                  <span class="step-type">{{ step.type }}</span>
                                  <el-tag size="small" round>{{ stepIndex + 1 }}</el-tag>
                                </div>
                                <div class="step-details">
                                  <span class="step-task">{{ step.task }}</span>
                                  <span class="step-duration">{{ step.duration }}min</span>
                                </div>
                              </div>
                            </div>
                          </template>
                        </draggable>
                      </el-scrollbar>
                      
                      <!-- Empty State -->
                      <el-empty 
                        v-else
                        :image-size="60"
                        description="No steps added"
                      >
                        <el-button 
                          type="primary" 
                          size="small"
                          @click="handleLaneSelect(lane.id)"
                        >
                          Add Steps
                        </el-button>
                      </el-empty>
                    </div>
                    </el-card>
                  </template>
                  </draggable>
                </div>
              </el-scrollbar>
              
              <!-- Empty Workflow State -->
              <el-empty 
                v-else
                :image-size="120"
                description="No lanes in this workflow yet"
              >
                <el-button 
                  type="primary" 
                  :icon="Plus"
                  @click="handleAddLane"
                >
                  Add First Lane
                </el-button>
              </el-empty>
            </div>
          </div>
        </div>

        <!-- Step 3: Multi-Lane Editor -->
        <div v-else-if="currentStep === 'multi-lane-editor'" key="multi-lane-editor" class="step-content">
          <div class="multi-lane-header">
            <div class="workflow-info">
              <div class="workflow-icon">
                <i class="fas fa-code-branch"></i>
              </div>
              <div class="workflow-details">
                <h3>{{ selectedWorkflow?.name || 'Workflow' }} - All Lanes</h3>
                <div class="workflow-summary">
                  <span class="lane-count">
                    <i class="fas fa-road"></i>
                    {{ selectedWorkflow?.lanes.length || 0 }} {{ (selectedWorkflow?.lanes.length || 0) === 1 ? 'lane' : 'lanes' }}
                  </span>
                  <span class="instrument-count">
                    <i class="fas fa-layer-group"></i>
                    {{ getTotalInstruments() }} {{ getTotalInstruments() === 1 ? 'instrument' : 'instruments' }}
                  </span>
                  <el-button @click="goBackToWorkflow">
                    <el-icon><ArrowLeft /></el-icon>
                    Back to Overview
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          <div class="step-body">
            <slot 
              name="multi-lane-editor" 
              :workflow-id="selectedWorkflowId"
              :on-lane-click="handleLaneSelect"
              :on-complete="handleComplete"
            >
              <div class="placeholder-content">
                <i class="fas fa-layer-group"></i>
                <p>Multi-lane editor content goes here</p>
                <p class="subtitle">Workflow: {{ selectedWorkflowId }}</p>
              </div>
            </slot>
          </div>
        </div>

        <!-- Step 4: Lane Editor -->
        <div v-else-if="currentStep === 'lane-editor'" key="lane-editor" class="step-content">
          <div class="lane-editor-header">
            <div class="lane-info">
              <div class="breadcrumb">
                <span class="workflow-name">{{ selectedWorkflow?.name || 'Workflow' }}</span>
                <i class="fas fa-chevron-right"></i>
                <span class="lane-name">{{ selectedLane?.name || 'Lane' }}</span>
              </div>
              <div class="lane-stats">
                <span class="step-count">
                  <i class="fas fa-tasks"></i>
                  {{ selectedLane?.steps.length || 0 }} steps
                </span>
                <span class="duration-total">
                  <i class="fas fa-clock"></i>
                  {{ getLaneDuration() }}min total
                </span>
              </div>
            </div>
            <el-button @click="goBackToWorkflow">
              <el-icon><ArrowLeft /></el-icon>
              Back to Workflow
            </el-button>
          </div>
          <div class="step-body">
            <slot 
              name="lane-editor" 
              :workflow-id="selectedWorkflowId"
              :lane-id="selectedLaneId"
              :pending-task="pendingTask"
              :opened-from-f-a-b="openedFromFAB"
              :on-complete="handleComplete"
            >
              <div class="placeholder-content">
                <i class="fas fa-edit"></i>
                <p>Lane editor content goes here</p>
                <p class="subtitle">Workflow: {{ selectedWorkflowId }}</p>
                <p class="subtitle">Lane: {{ selectedLaneId }}</p>
                <div v-if="pendingTask" class="pending-task-info">
                  <strong>Adding task:</strong> {{ pendingTask.task }}
                </div>
              </div>
            </slot>
          </div>
        </div>
      </transition>
    </div>

    <!-- Modal footer with navigation -->
    <template #footer>
      <div class="modal-footer">
        <!-- Close button -->
        <el-button @click="handleClose" type="primary">
          {{ currentStep === 'lane-editor' ? 'Done' : 'Close' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { 
  Delete, 
  More, 
  List, 
  Timer, 
  Plus,
  Setting,
  Monitor,
  MagicStick,
  RefreshRight,
  Brush,
  Eleme,
  Rank,
  ArrowLeft
} from '@element-plus/icons-vue'
import { useModalWorkflowEditor } from '@/composables/useModalWorkflowEditor'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { DEFAULT_DURATIONS } from '@/constants/instruments'
import type { Lane } from '@/types/workflow'

// Use the modal workflow editor composable
const {
  isModalOpen,
  currentStep,
  selectedWorkflowId,
  selectedLaneId,
  pendingTask,
  openedFromFAB,
  goToLaneSelection,
  goToLaneEditor,
  closeModal,
  completeWorkflow
} = useModalWorkflowEditor()

const { workflows, updateWorkflows } = useWorkflowState()

// Computed properties for UI
const dialogVisible = computed({
  get: () => isModalOpen.value,
  set: (value) => {
    if (!value) {
      closeModal()
    }
  }
})

const steps = ['workflow-selection', 'lane-selection', 'multi-lane-editor', 'lane-editor'] as const

const currentStepIndex = computed(() => {
  return steps.indexOf(currentStep.value)
})

// Check if we're in workflow-builder mode (which is actually lane-selection)
const isWorkflowBuilder = computed(() => {
  return currentStep.value === 'lane-selection'
})

// Calculate dynamic modal width based on number of lanes
const dynamicModalWidth = computed(() => {
  // Base width for workflow selection and lane editor steps
  const baseWidth = 700
  
  // For workflow overview (lane-selection step), calculate based on lane count
  if (currentStep.value === 'lane-selection' && selectedWorkflow.value?.lanes?.length) {
    const laneCount = selectedWorkflow.value.lanes.length
    const laneCardWidth = 340 // Each lane card width (measured actual width)
    const gapWidth = 20 // Gap between cards
    const containerPadding = 20 // Padding inside lanes-container (left + right)
    const modalPadding = 48 // Modal dialog content padding (left + right)
    const borderSpacing = 4 // Additional border/spacing buffer
    const safetyBuffer = 20 // Extra buffer to ensure no cutoff
    
    // Calculate total content width needed
    const contentWidth = (laneCount * laneCardWidth) + 
                        ((laneCount - 1) * gapWidth) + 
                        containerPadding + 
                        modalPadding + 
                        borderSpacing + 
                        safetyBuffer
    
    // Get viewport width to ensure modal doesn't exceed screen
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const maxModalWidth = Math.min(viewportWidth * 0.9, 1800) // Max 90% of viewport or 1800px
    
    // Use content width but cap at max width
    const calculatedWidth = Math.min(contentWidth, maxModalWidth)
    const finalWidth = Math.max(calculatedWidth, baseWidth)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('ModalWorkflowFlowController - dynamicModalWidth calculation:', {
        currentStep: currentStep.value,
        selectedWorkflowId: selectedWorkflowId.value,
        laneCount,
        laneCardWidth,
        gapWidth,
        containerPadding,
        modalPadding,
        borderSpacing,
        safetyBuffer,
        contentWidth,
        viewportWidth,
        maxModalWidth,
        calculatedWidth,
        finalWidth,
        workflowName: selectedWorkflow.value?.name
      })
    }
    
    return `${finalWidth}px`
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('ModalWorkflowFlowController - using base width:', {
      currentStep: currentStep.value,
      selectedWorkflowId: selectedWorkflowId.value,
      hasLanes: !!selectedWorkflow.value?.lanes?.length
    })
  }
  
  // Default width for other steps
  return `${baseWidth}px`
})

// Watch for modal state changes to debug width calculation
watch([isModalOpen, currentStep, selectedWorkflowId], ([isOpen, step, workflowId]) => {
  if (isOpen && process.env.NODE_ENV === 'development') {
    console.log('ModalWorkflowFlowController - modal opened:', {
      isOpen,
      step,
      workflowId,
      calculatedWidth: dynamicModalWidth.value
    })
  }
}, { immediate: false })

// Get the selected workflow object
const selectedWorkflow = computed(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('ModalWorkflowFlowController - selectedWorkflowId:', selectedWorkflowId.value)
    console.log('ModalWorkflowFlowController - workflows:', workflows.value)
    console.log('ModalWorkflowFlowController - workflows length:', workflows.value?.length)
  }
  
  if (!selectedWorkflowId.value) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ModalWorkflowFlowController - No selectedWorkflowId')
    }
    return undefined
  }
  
  const workflow = workflows.value.find(w => w.id === selectedWorkflowId.value)
  if (process.env.NODE_ENV === 'development') {
    console.log('ModalWorkflowFlowController - selectedWorkflow:', workflow)
    console.log('ModalWorkflowFlowController - selectedWorkflow lanes:', workflow?.lanes?.length)
    
    // Additional debugging for lanes data
    if (workflow?.lanes) {
      console.log('ModalWorkflowFlowController - lanes details:', workflow.lanes.map(lane => ({
        id: lane.id,
        name: lane.name,
        stepsCount: lane.steps?.length || 0,
        steps: lane.steps?.map(step => ({ type: step.type, task: step.task })) || []
      })))
    }
  }
  
  return workflow
})

// Get the selected lane object
const selectedLane = computed(() => {
  if (!selectedWorkflow.value || !selectedLaneId.value) return null
  return selectedWorkflow.value.lanes.find(l => l.id === selectedLaneId.value) || null
})

// Get workflow number (for display)
const getWorkflowNumber = (): string => {
  if (!selectedWorkflow.value) return '1'
  const index = workflows.value.findIndex(w => w.id === selectedWorkflow.value!.id)
  return (index + 1).toString()
}

// Get total unique instruments across all lanes
const getTotalInstruments = (): number => {
  if (!selectedWorkflow.value) return 0
  const allInstruments = new Set<string>()
  selectedWorkflow.value.lanes.forEach(lane => {
    lane.steps.forEach(step => {
      allInstruments.add(step.type)
    })
  })
  return allInstruments.size
}

// Get lane duration for any lane
const getLaneDuration = (lane?: Lane): number => {
  if (!lane) {
    if (!selectedLane.value) return 0
    lane = selectedLane.value
  }
  const total = lane.steps.reduce((sum, step) => {
    return sum + (step.duration || DEFAULT_DURATIONS[step.type as keyof typeof DEFAULT_DURATIONS] || 5)
  }, 0)
  return Math.round(total)
}

// Get unique instruments in a lane
const getLaneInstruments = (lane: Lane): number => {
  const instruments = new Set<string>()
  lane.steps.forEach(step => {
    instruments.add(step.type)
  })
  return instruments.size
}

// Get step icon component for Element Plus
const getStepIconComponent = (stepType: string) => {
  const iconMap: Record<string, any> = {
    'Liquid Handler': Eleme,
    'Plate Reader': Monitor,
    'Incubator': Setting,
    'Centrifuge': RefreshRight,
    'Washer': Brush,
    'Dispenser': MagicStick
  }
  return iconMap[stepType] || Setting
}

// Get step color for avatars
const getStepColor = (stepType: string): string => {
  const colorMap: Record<string, string> = {
    'Liquid Handler': '#409eff',
    'Plate Reader': '#67c23a',
    'Incubator': '#e6a23c',
    'Centrifuge': '#f56c6c',
    'Washer': '#909399',
    'Dispenser': '#9c27b0'
  }
  return colorMap[stepType] || '#409eff'
}

// Legacy icon helper (for backward compatibility)
const getStepIcon = (step: any): string => {
  if (step.customIcon) return step.customIcon
  const iconMap: Record<string, string> = {
    'Liquid Handler': 'fas fa-flask',
    'Plate Reader': 'fas fa-microscope',
    'Incubator': 'fas fa-thermometer-half',
    'Centrifuge': 'fas fa-redo-alt',
    'Washer': 'fas fa-shower',
    'Dispenser': 'fas fa-tint'
  }
  return iconMap[step.type] || 'fas fa-cog'
}

// Event handlers
const handleWorkflowSelect = (workflowId: string): void => {
  // Go directly to workflow builder instead of lane selection
  goToLaneSelection(workflowId) // This will be renamed to goToWorkflowBuilder in composable
}

const handleLaneSelect = (laneId: string): void => {
  goToLaneEditor(laneId)
}

const handleAddLane = (): void => {
  if (!selectedWorkflow.value || !selectedWorkflowId.value) return
  
  const newLane: Lane = {
    id: `lane-${Date.now()}`,
    name: `Lane ${selectedWorkflow.value.lanes.length + 1}`,
    isEditingName: false,
    editName: '',
    steps: []
  }
  
  const updatedWorkflows = workflows.value.map(w => 
    w.id === selectedWorkflowId.value 
      ? { ...w, lanes: [...w.lanes, newLane] }
      : w
  )
  
  updateWorkflows(updatedWorkflows)
}

const goBackToWorkflow = (): void => {
  // Go back to workflow builder instead of lane selection
  if (selectedWorkflowId.value) {
    goToLaneSelection(selectedWorkflowId.value)
  }
}

const handleBack = (): void => {
  // Implementation for going back in the modal flow
  if (currentStep.value === 'lane-editor' && selectedWorkflowId.value) {
    goToLaneSelection(selectedWorkflowId.value)
  }
}

const handleClose = (): void => {
  closeModal()
}

const handleComplete = (): void => {
  completeWorkflow()
}

// Lane management
const handleDeleteLane = (laneId: string): void => {
  if (!selectedWorkflow.value) return
  
  if (confirm('Are you sure you want to delete this lane and all its steps?')) {
    const updatedWorkflows = workflows.value.map(w => 
      w.id === selectedWorkflowId.value 
        ? { ...w, lanes: w.lanes.filter(l => l.id !== laneId) }
        : w
    )
    updateWorkflows(updatedWorkflows)
  }
}

// Handle step reorder
const handleStepReorder = (laneId: string): void => {
  // The draggable component with :list binding automatically updates the array
  // We just need to trigger a save to persist the changes
  if (selectedWorkflow.value && selectedWorkflowId.value) {
    // Force update by creating a new workflows array
    const updatedWorkflows = workflows.value.map(w => 
      w.id === selectedWorkflowId.value ? { ...w } : w
    )
    updateWorkflows(updatedWorkflows)
  }
}

// Handle lane reorder
const handleLaneReorder = (): void => {
  // The draggable component with :list binding automatically updates the array
  // We just need to trigger a save to persist the changes
  if (selectedWorkflow.value && selectedWorkflowId.value) {
    if (process.env.NODE_ENV === 'development') {
      console.log('ModalWorkflowFlowController - handleLaneReorder called')
      console.log('ModalWorkflowFlowController - current lanes:', selectedWorkflow.value.lanes)
    }
    
    // Force update by creating a new workflows array
    const updatedWorkflows = workflows.value.map(w => 
      w.id === selectedWorkflowId.value ? { ...w } : w
    )
    updateWorkflows(updatedWorkflows)
  }
}
</script>

<style scoped>
.workflow-flow-modal {
  --step-color: var(--primary-color);
  --step-bg: var(--card-bg);
}

.workflow-flow-modal .el-dialog {
  max-width: none !important;
  margin: 5vh auto;
}

.modal-content {
  min-height: 400px;
  padding: 0;
  overflow: hidden;
}

.step-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 0 1.5rem;
  background: linear-gradient(135deg, var(--background-alt) 0%, var(--section-bg) 100%);
  border-bottom: 1px solid var(--border-light);
}

.step-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.step-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-light);
}

.step-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.step-body {
  flex: 1;
  padding: 0 1.5rem 1.5rem 1.5rem;
  overflow-y: auto;
}

/* Step transition animations */
.step-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.98);
}

.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px) scale(0.98);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  background-color: var(--background-alt);
  border-radius: 8px;
  border: 2px dashed var(--border-color);
}

.placeholder-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  opacity: 0.5;
}

.placeholder-content p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.placeholder-content .subtitle {
  font-size: 0.875rem;
  color: var(--text-light);
}

.pending-task-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Workflow Builder Header */
.workflow-builder-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--background-alt) 0%, var(--section-bg) 100%);
  border-bottom: 1px solid var(--border-light);
}

.workflow-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.workflow-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.workflow-details {
  flex: 1;
}

.workflow-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-light);
}

.workflow-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.lane-count,
.instrument-count {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.lane-count i,
.instrument-count i {
  color: var(--primary-color);
  font-size: 0.75rem;
}

.add-lane-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-lane-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Lane Editor Header */
.lane-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--background-alt) 0%, var(--section-bg) 100%);
  border-bottom: 1px solid var(--border-light);
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

.back-to-workflow-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.back-to-workflow-btn:hover {
  background: var(--hover-bg);
  color: var(--text-light);
  border-color: var(--primary-color);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 0;
}

/* Workflow Overview using Element Plus */
.workflow-overview {
  min-height: 400px;
  width: 100%;
}

.lanes-scrollbar {
  height: 420px;
  width: 100%;
}

.lanes-container {
  display: flex;
  gap: 20px;
  padding: 10px;
  width: max-content;
}

.lane-card {
  height: 400px;
  display: flex;
  flex-direction: column;
  min-width: 340px;
  width: 340px;
  flex-shrink: 0;
  flex-grow: 0;
}

.lane-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.lane-card.sortable-ghost {
  opacity: 0.5;
  background: var(--el-color-primary-light-9);
}

.lane-card.sortable-drag {
  background: var(--el-color-primary-light-8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Lane Card Header */
.lane-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lane-drag-handle {
  cursor: grab;
  color: var(--el-text-color-placeholder);
  font-size: 16px;
  transition: color 0.2s ease;
}

.lane-drag-handle:hover {
  color: var(--el-color-primary);
}

.lane-drag-handle:active {
  cursor: grabbing;
}

.lane-name {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  min-width: 0;
}

.lane-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* Lane Stats */
.lane-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.lane-stats .el-tag {
  font-size: 11px;
}

/* Steps Container */
.steps-container {
  flex: 1;
  min-height: 0;
  cursor: pointer;
  position: relative;
}

.steps-container:hover {
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: move;
}

.step-item:hover {
  background: var(--el-fill-color-light);
  transform: translateY(-1px);
}

.step-item.sortable-ghost {
  opacity: 0.5;
  background: var(--el-color-primary-light-9);
}

.step-item.sortable-drag {
  background: var(--el-color-primary-light-8);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.drag-handle {
  cursor: grab;
  color: var(--el-text-color-placeholder);
  font-size: 16px;
  transition: color 0.2s ease;
}

.drag-handle:hover {
  color: var(--el-color-primary);
}

.drag-handle:active {
  cursor: grabbing;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.step-type {
  font-weight: 600;
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.step-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-task {
  font-size: 11px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.step-duration {
  font-size: 10px;
  color: var(--el-color-warning);
  font-weight: 500;
}

/* Element Plus component customizations */
.workflow-overview .el-empty {
  padding: 60px 20px;
}

.workflow-overview .el-card__header {
  padding: 12px 16px;
}

.workflow-overview .el-scrollbar__view {
  padding: 4px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .workflow-flow-modal {
    width: 95vw !important;
    max-width: none !important;
  }
  
  .lanes-container {
    flex-direction: column;
    width: 100%;
    min-width: unset;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .step-indicator {
    order: -1;
  }
  
  .lane-card {
    height: auto;
    min-height: 300px;
  }
  
  .lane-card-header {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .lane-stats {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .step-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .step-header {
    width: 100%;
  }
  
  .step-details {
    width: 100%;
  }
  
  .drag-handle {
    display: none;
  }
  
  .lane-drag-handle {
    display: none;
  }
}
</style>