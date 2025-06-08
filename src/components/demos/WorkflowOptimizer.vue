<template>
  <div class="workflow-optimizer">
    <!-- Professional Header -->
    <header class="optimizer-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="header-text">
            <h1>Workflow Optimizer</h1>
            <p class="header-subtitle">Optimize laboratory automation workflows for maximum efficiency</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-button secondary" @click="toggleInstructions">
            <i class="fas fa-question-circle"></i>
            <span class="button-text">Help</span>
          </button>
          <button class="action-button secondary" @click="showInstrumentConfig = true">
            <i class="fas fa-cog"></i>
            <span class="button-text">Configure</span>
          </button>
          <button class="action-button primary" @click="handleOptimizeSchedule" :disabled="isOptimizing || workflows.length === 0">
            <i :class="isOptimizing ? 'fas fa-spinner fa-spin' : 'fas fa-magic'"></i>
            <span class="button-text">{{ isOptimizing ? 'Optimizing...' : 'Optimize' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Instructions Overlay -->
    <transition name="slide-fade">
      <!-- Instructions positioning fix -->
      <div v-if="showInstructions" class="instructions-backdrop" @click="showInstructions = false">
        <div class="instructions-overlay">
        <div class="instructions-card">
          <h2><i class="fas fa-graduation-cap"></i> Getting Started</h2>
          
          <div class="instruction-steps">
            <div class="instruction-step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Build Workflows</h3>
                <p>Drag instruments from the palette to create workflow steps. Each workflow represents a laboratory process.</p>
              </div>
            </div>
            
            <div class="instruction-step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Configure Resources</h3>
                <p>Set the number of available instruments to match your lab setup. This affects scheduling constraints.</p>
              </div>
            </div>
            
            <div class="instruction-step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Optimize Schedule</h3>
                <p>Click optimize to generate an efficient schedule that minimizes conflicts and maximizes throughput.</p>
              </div>
            </div>
          </div>
          
          <div class="feature-grid">
            <div class="feature-card">
              <i class="fas fa-arrows-alt feature-icon"></i>
              <h4>Drag & Drop</h4>
              <p>Intuitive workflow building</p>
            </div>
            <div class="feature-card">
              <i class="fas fa-chart-line feature-icon"></i>
              <h4>Smart Scheduling</h4>
              <p>AI-powered optimization</p>
            </div>
            <div class="feature-card">
              <i class="fas fa-exclamation-triangle feature-icon"></i>
              <h4>Conflict Detection</h4>
              <p>Identify bottlenecks</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </transition>

    <!-- Modern Tab Navigation -->
    <nav class="tab-navigation">
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'builder' }"
        @click="activeTab = 'builder'"
      >
        <i class="fas fa-tools"></i>
        <span>Workflow Builder</span>
        <div class="tab-indicator"></div>
      </button>
      <button 
        class="tab-button"
        :class="{ active: activeTab === 'results' }"
        @click="activeTab = 'results'"
      >
        <i class="fas fa-chart-gantt"></i>
        <span>Schedule Results</span>
        <div class="tab-indicator"></div>
      </button>
    </nav>

    <!-- Tab Content Container -->
    <div class="tab-content-container">
      <!-- Builder Tab -->
      <transition name="tab-fade" mode="out-in">
        <div v-if="activeTab === 'builder'" key="builder" class="tab-content builder-tab">
          <!-- Empty State -->
          <div v-if="workflows.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h3>No Workflows Yet</h3>
            <p>Start by dragging instruments from the palette to create your first workflow</p>
            <button class="action-button primary" @click="addNewWorkflow">
              <i class="fas fa-plus"></i> Create Workflow
            </button>
          </div>

          <!-- Workflow Builder Content -->
          <div v-else class="builder-content">
            <!-- Floating Instrument Palette Toggle -->
            <button 
              class="palette-toggle-fab"
              @click="isPaletteOpen = !isPaletteOpen"
              :class="{ 'active': isPaletteOpen }"
            >
              <i class="fas fa-toolbox"></i>
            </button>

            <!-- Main Workflows Section -->
            <section class="builder-section workflows-section-full">
              <div class="section-header">
                <h2><i class="fas fa-project-diagram"></i> Active Workflows</h2>
                <div class="section-actions">
                  <button class="icon-button" @click="addNewWorkflow">
                    <i class="fas fa-plus"></i>
                  </button>
                  <button class="icon-button" @click="handleResetWorkflows">
                    <i class="fas fa-undo"></i>
                  </button>
                </div>
              </div>
              <WorkflowBuilder
                :workflows="workflows"
                @update:workflows="updateWorkflows"
                @step-edited="handleStepEdited"
                @workflows-changed="handleWorkflowsChanged"
              />
            </section>
          </div>

          <!-- Instrument Modal -->
          <transition name="bubble-pop">
            <div v-if="isPaletteOpen" class="modal-backdrop" @click="isPaletteOpen = false">
              <div class="instrument-modal" @click.stop>
                <div class="modal-header">
                  <h3><i class="fas fa-toolbox"></i> Instruments</h3>
                  <button class="close-btn" @click="isPaletteOpen = false">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="modal-content">
                  <div class="instruments-grid">
                    <div 
                      v-for="(tasks, instrument) in INSTRUMENTS"
                      :key="instrument"
                      class="instrument-item"
                      @click="openTaskModal(instrument)"
                    >
                      <div class="instrument-icon">
                        <i :class="getInstrumentIcon(instrument)"></i>
                      </div>
                      <span class="instrument-name">{{ instrument }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- Task Modal -->
          <transition name="bubble-pop">
            <div v-if="selectedInstrument" class="modal-backdrop" @click="closeTaskModal">
              <div class="task-modal" @click.stop>
                <div class="modal-header">
                  <h3>
                    <i :class="getInstrumentIcon(selectedInstrument)"></i> 
                    {{ selectedInstrument }} Tasks
                  </h3>
                  <button class="close-btn" @click="closeTaskModal">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="modal-content">
                  <div class="tasks-grid">
                    <div 
                      v-for="task in INSTRUMENTS[selectedInstrument]"
                      :key="`${selectedInstrument}-${task}`"
                      class="task-item"
                      draggable="true"
                      @dragstart="handleTaskDragStart($event, selectedInstrument, task)"
                    >
                      <i :class="getInstrumentIcon(selectedInstrument)"></i>
                      <span>{{ task }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <!-- Connection Lines Canvas -->
          <svg class="connections-svg" ref="connectionsSvg"></svg>
        </div>

        <!-- Results Tab -->
        <div v-else-if="activeTab === 'results'" key="results" class="tab-content results-tab">
          <!-- Empty Results State -->
          <div v-if="schedule.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <h3>No Schedule Generated</h3>
            <p>Click the Optimize button to generate an optimized schedule for your workflows</p>
            <button class="action-button primary" @click="activeTab = 'builder'">
              <i class="fas fa-arrow-left"></i> Back to Builder
            </button>
          </div>

          <!-- Results Content -->
          <div v-else class="results-content">
            <!-- Metrics Dashboard -->
            <section class="metrics-section">
              <div class="section-header">
                <h2><i class="fas fa-chart-pie"></i> Performance Metrics</h2>
                <span class="section-subtitle">Key performance indicators</span>
              </div>
              <OptimizationMetrics
                :metrics="metrics"
                @metric-clicked="handleMetricClicked"
              />
            </section>

            <!-- Gantt Chart Section -->
            <section class="gantt-section">
              <div class="section-header">
                <h2><i class="fas fa-chart-gantt"></i> Schedule Timeline</h2>
                <span class="section-subtitle">Visual schedule representation</span>
              </div>
              <div class="gantt-wrapper">
                <GanttChart
                  :schedule="schedule"
                  :workflows="workflows"
                  @task-clicked="handleTaskClicked"
                />
              </div>
            </section>
          </div>
        </div>
      </transition>
    </div>

    <!-- Loading Overlay -->
    <transition name="fade">
      <div v-if="isOptimizing" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner">
            <i class="fas fa-cog fa-spin"></i>
          </div>
          <h3>Optimizing Schedule</h3>
          <p>Analyzing workflows and resource constraints...</p>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Instrument Configuration Modal -->
    <el-dialog 
      v-model="showInstrumentConfig" 
      :title="''"
      width="500px"
      class="config-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="dialog-header">
          <i class="fas fa-cog"></i>
          <h3>Instrument Configuration</h3>
        </div>
      </template>
      
      <div class="config-content">
        <p class="config-description">Set the number of available instances for each instrument type</p>
        <div class="config-grid">
          <div 
            v-for="(config, instrument) in instrumentConfig" 
            :key="instrument" 
            class="config-item"
          >
            <div class="config-icon">
              <i :class="getInstrumentIcon(instrument)"></i>
            </div>
            <div class="config-details">
              <span class="config-label">{{ instrument }}</span>
              <span class="config-sublabel">Available instances</span>
            </div>
            <el-input-number
              v-model="config.nests"
              :min="1"
              :max="10"
              :controls="true"
              size="default"
              class="config-input"
            />
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <button class="action-button secondary" @click="showInstrumentConfig = false">
            Cancel
          </button>
          <button class="action-button primary" @click="saveInstrumentConfig">
            <i class="fas fa-save"></i> Save Configuration
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Duration Editor -->
    <DurationEditor
      :visible="showStepDurationEditor"
      :task="editingStep"
      :duration="editingStep?.duration"
      @update:visible="showStepDurationEditor = $event"
      @save="handleSaveStepDuration"
      @cancel="showStepDurationEditor = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, reactive, provide } from 'vue'
import type { Workflow, Step, DragItem, ScheduledTask } from '@/types/workflow'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { useConnections } from '@/composables/useConnections'
import { useTheme } from '@/composables/useTheme'
import { useDragDrop } from '@/composables/useDragDrop'
import { createOptimizationEngine } from '@/utils/optimizationEngine'
import { INSTRUMENTS, INSTRUMENT_ICONS } from '@/constants/instruments'
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder.vue'
import GanttChart from '@/components/workflow/GanttChart.vue'
import OptimizationMetrics from '@/components/workflow/OptimizationMetrics.vue'
import DurationEditor from '@/components/DurationEditor.vue'

// Default workflows data
const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: 'workflow-a',
    name: 'Workflow A: Protein Binding',
    priority: 1,
    isEditingName: false,
    editName: '',
    lanes: [
      {
        id: 'lane-a1',
        name: 'Compound Plate',
        isEditingName: false,
        editName: '',
        steps: [
          { id: 'step-a1-1', type: 'Storage', task: 'Get', duration: 2 },
          { id: 'step-a1-2', type: 'Liquid Handler', task: 'Transfer', duration: 15 },
          { id: 'step-a1-3', type: 'Storage', task: 'Store', duration: 2 }
        ]
      },
      {
        id: 'lane-a2',
        name: 'Assay Plate',
        isEditingName: false,
        editName: '',
        steps: [
          { id: 'step-a2-1', type: 'Liquid Handler', task: 'Prep', duration: 5 },
          { id: 'step-a2-2', type: 'Incubator', task: 'Incubate', duration: 60 },
          { id: 'step-a2-3', type: 'Plate Reader', task: 'Read', duration: 4 },
          { id: 'step-a2-4', type: 'Storage', task: 'Store', duration: 2 }
        ]
      }
    ]
  },
  {
    id: 'workflow-b',
    name: 'Workflow B: Cell Viability',
    priority: 2,
    isEditingName: false,
    editName: '',
    lanes: [
      {
        id: 'lane-b1',
        name: 'Source Plate',
        isEditingName: false,
        editName: '',
        steps: [
          { id: 'step-b1-1', type: 'Storage', task: 'Get', duration: 2 },
          { id: 'step-b1-2', type: 'Bulk Dispenser', task: 'Dispense', duration: 12 },
          { id: 'step-b1-3', type: 'Storage', task: 'Store', duration: 2 }
        ]
      },
      {
        id: 'lane-b2',
        name: 'Read Plate',
        isEditingName: false,
        editName: '',
        steps: [
          { id: 'step-b2-1', type: 'Liquid Handler', task: 'Prep', duration: 3 },
          { id: 'step-b2-2', type: 'Plate Shaker', task: 'Shake', duration: 20 },
          { id: 'step-b2-3', type: 'Plate Reader', task: 'Read', duration: 4 },
          { id: 'step-b2-4', type: 'Storage', task: 'Store', duration: 2 }
        ]
      }
    ]
  },
  {
    id: 'workflow-c',
    name: 'Workflow C: QC Analysis',
    priority: 3,
    isEditingName: false,
    editName: '',
    lanes: [
      {
        id: 'lane-c1',
        name: 'Sample Plate',
        isEditingName: false,
        editName: '',
        steps: [
          { id: 'step-c1-1', type: 'Storage', task: 'Get', duration: 2 },
          { id: 'step-c1-2', type: 'Centrifuge', task: 'Centrifuge', duration: 12 },
          { id: 'step-c1-3', type: 'Plate Reader', task: 'Read', duration: 4 },
          { id: 'step-c1-4', type: 'Storage', task: 'Store', duration: 2 }
        ]
      }
    ]
  }
]

// Component state
const activeTab = ref<'builder' | 'results'>('builder')
const showInstructions = ref(false)
const showInstrumentConfig = ref(false)
const showStepDurationEditor = ref(false)
const editingStep = ref<Step | null>(null)
const connectionsSvg = ref<SVGSVGElement | null>(null)
const isPaletteOpen = ref(false)
const selectedInstrument = ref<string | null>(null)

// Centralized drag and drop state
const dragState = reactive({
  isDragging: false,
  draggedItem: null as DragItem | null,
  draggedElement: null as HTMLElement | null,
  dropTarget: null as { workflowId: string, laneId: string, index: number } | null,
  dragOverElement: null as HTMLElement | null
})

// Provide drag state to child components
provide('dragState', dragState)

// Use composables
const {
  workflows,
  customTasks,
  instrumentConfig,
  schedule,
  metrics,
  isOptimizing,
  saveState,
  loadState,
  addCustomTask,
  removeCustomTask,
  updateWorkflows,
  updateSchedule,
  updateMetrics,
  resetState
} = useWorkflowState()

const { updateSvgSize, drawConnections } = useConnections(connectionsSvg, workflows)
const { currentTheme, setTheme } = useTheme()
const { setDragData, getDragData } = useDragDrop()

// Drag and Drop Functions
const handleDragStart = (event: DragEvent, item: DragItem, element: HTMLElement) => {
  console.log('Drag started:', item)
  dragState.isDragging = true
  dragState.draggedItem = item
  dragState.draggedElement = element
  
  // Set drag data on the event
  setDragData(event, item)
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = item.isExistingStep ? 'move' : 'copy'
  }
}

const handleDragEnd = () => {
  // Clean up all drag state
  dragState.isDragging = false
  dragState.draggedItem = null
  dragState.draggedElement = null
  dragState.dropTarget = null
  dragState.dragOverElement = null
  
  // Remove all visual indicators
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over')
  })
  document.querySelectorAll('.drop-indicator').forEach(el => {
    el.remove()
  })
}

const handleDragOver = (event: DragEvent, workflowId: string, laneId: string) => {
  event.preventDefault()
  event.stopPropagation()
  
  const container = event.currentTarget as HTMLElement
  if (!container) return
  
  // Add visual feedback
  if (!container.classList.contains('drag-over')) {
    container.classList.add('drag-over')
  }
  
  // Update drag over element
  dragState.dragOverElement = container
  
  // Find drop position
  const steps = Array.from(container.querySelectorAll('.workflow-step'))
  const mouseX = event.clientX
  
  let insertIndex = steps.length // Default to end
  
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i] as HTMLElement
    const rect = step.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    
    if (mouseX < centerX) {
      insertIndex = i
      break
    }
  }
  
  // Update drop target
  dragState.dropTarget = { workflowId, laneId, index: insertIndex }
  
  // Show drop indicator
  updateDropIndicator(container, insertIndex)
}

const updateDropIndicator = (container: HTMLElement, index: number) => {
  // Remove existing indicators
  container.querySelectorAll('.drop-indicator').forEach(el => el.remove())
  
  // Create new indicator
  const indicator = document.createElement('div')
  indicator.className = dragState.draggedItem?.isExistingStep 
    ? 'drop-indicator drop-indicator-move' 
    : 'drop-indicator drop-indicator-add'
  
  const steps = container.querySelectorAll('.workflow-step')
  
  if (index < steps.length) {
    steps[index].before(indicator)
  } else if (steps.length > 0) {
    steps[steps.length - 1].after(indicator)
  } else {
    container.appendChild(indicator)
  }
}

const handleDrop = (event: DragEvent, workflowId: string, laneId: string) => {
  event.preventDefault()
  event.stopPropagation()
  
  const container = event.currentTarget as HTMLElement
  container.classList.remove('drag-over')
  
  // Get drag data from event
  const draggedItem = getDragData(event)
  if (!draggedItem || !dragState.dropTarget) return
  
  const targetWorkflow = workflows.value.find(w => w.id === workflowId)
  const targetLane = targetWorkflow?.lanes.find(l => l.id === laneId)
  
  if (!targetWorkflow || !targetLane) return
  
  if (draggedItem.isExistingStep) {
    // Moving existing step
    const sourceWorkflow = workflows.value.find(w => w.id === draggedItem.sourceWorkflowId)
    const sourceLane = sourceWorkflow?.lanes.find(l => l.id === draggedItem.sourceLaneId)
    
    if (!sourceWorkflow || !sourceLane) return
    
    // Remove from source
    const sourceIndex = draggedItem.sourceIndex ?? 0
    const [movedStep] = sourceLane.steps.splice(sourceIndex, 1)
    
    if (!movedStep) return
    
    // Adjust target index if moving within same lane
    let targetIndex = dragState.dropTarget.index
    if (sourceLane.id === targetLane.id && targetIndex > sourceIndex) {
      targetIndex--
    }
    
    // Insert at target
    targetLane.steps.splice(targetIndex, 0, movedStep)
  } else {
    // Adding new step from palette
    const newStep: Step = {
      id: `${laneId}-step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: draggedItem.type,
      task: draggedItem.task || draggedItem.type,
      duration: draggedItem.duration || 15,
      customIcon: draggedItem.customIcon
    }
    
    targetLane.steps.splice(dragState.dropTarget.index, 0, newStep)
  }
  
  saveState()
  nextTick(() => {
    drawConnections()
  })
  
  handleDragEnd()
}


// Instructions toggle functionality
const toggleInstructions = () => {
  showInstructions.value = !showInstructions.value
}

// Modal functionality
const openTaskModal = (instrument: string) => {
  selectedInstrument.value = instrument
}

const closeTaskModal = () => {
  selectedInstrument.value = null
}

const handleTaskDragStart = (event: DragEvent, instrument: string, task: string) => {
  const dragItem: DragItem = {
    type: instrument,
    task: task,
    duration: 15, // default duration
    isExistingStep: false
  }
  
  handleDragStart(event, dragItem, event.target as HTMLElement)
  
  // Close both modals when dragging starts
  isPaletteOpen.value = false
  selectedInstrument.value = null
}

// Initialize workflows
const initializeWorkflows = () => {
  if (workflows.value.length === 0) {
    workflows.value = JSON.parse(JSON.stringify(DEFAULT_WORKFLOWS))
  }
}

// Get instrument icon
const getInstrumentIcon = (instrument: string) => {
  return INSTRUMENT_ICONS[instrument] || 'fas fa-cog'
}

// Add new workflow
const addNewWorkflow = () => {
  const newWorkflow: Workflow = {
    id: `workflow-${Date.now()}`,
    name: `New Workflow ${workflows.value.length + 1}`,
    priority: workflows.value.length + 1,
    isEditingName: false,
    editName: '',
    lanes: [
      {
        id: `lane-${Date.now()}-1`,
        name: 'Lane 1',
        isEditingName: false,
        editName: '',
        steps: []
      }
    ]
  }
  workflows.value.push(newWorkflow)
  saveState()
}

// Optimization with loading state
const handleOptimizeSchedule = async () => {
  isOptimizing.value = true
  
  // Simulate progress for better UX
  await new Promise(resolve => setTimeout(resolve, 300))
  
  try {
    const engine = createOptimizationEngine(instrumentConfig.value)
    const { schedule: optimizedSchedule, metrics: calculatedMetrics } = 
      engine.optimizeSchedule(workflows.value)
    
    updateSchedule(optimizedSchedule)
    updateMetrics(calculatedMetrics)
    
    const validation = engine.validateSchedule(optimizedSchedule)
    if (!validation.isValid) {
      console.warn('Schedule validation errors:', validation.errors)
    }
    
    const bottlenecks = engine.getBottleneckAnalysis(optimizedSchedule)
    console.log('Bottleneck analysis:', bottlenecks)
    
    // Switch to results tab with delay for animation
    setTimeout(() => {
      activeTab.value = 'results'
    }, 500)
    
  } catch (error) {
    console.error('Optimization error:', error)
  } finally {
    setTimeout(() => {
      isOptimizing.value = false
    }, 1000)
  }
}

// Event handlers

// Provide drag functions to child components
provide('dragHandlers', {
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop
})

const handleWorkflowsChanged = () => {
  saveState()
  nextTick(() => {
    drawConnections()
  })
}

const handleStepEdited = (step: Step) => {
  editingStep.value = step
  showStepDurationEditor.value = true
}

const handleSaveStepDuration = (duration: number) => {
  if (!editingStep.value) return
  
  let stepFound = false
  workflows.value.forEach(workflow => {
    if (stepFound) return
    workflow.lanes.forEach(lane => {
      if (stepFound) return
      const stepIndex = lane.steps.findIndex(s => s.id === editingStep.value?.id)
      if (stepIndex !== -1) {
        lane.steps[stepIndex].duration = duration
        stepFound = true
      }
    })
  })
  
  if (stepFound) {
    saveState()
    if (schedule.value.length > 0) {
      handleOptimizeSchedule()
    }
  }
  
  showStepDurationEditor.value = false
  editingStep.value = null
}

const handleResetWorkflows = () => {
  workflows.value = JSON.parse(JSON.stringify(DEFAULT_WORKFLOWS))
  resetState()
  nextTick(() => {
    drawConnections()
  })
}

const saveInstrumentConfig = () => {
  showInstrumentConfig.value = false
  saveState()
  
  if (schedule.value.length > 0) {
    handleOptimizeSchedule()
  }
}

const handleTaskClicked = (task: ScheduledTask) => {
  console.log('Task clicked:', task)
}

const handleMetricClicked = (metric: string) => {
  console.log('Metric clicked:', metric)
}

// Lifecycle
onMounted(() => {
  loadState()
  initializeWorkflows()
  
  // Ensure theme is applied
  setTheme(currentTheme.value)
  
  nextTick(() => {
    updateSvgSize()
    drawConnections()
  })
  
  window.addEventListener('resize', updateSvgSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSvgSize)
})

// Watchers
watch(workflows, () => {
  if (activeTab.value === 'builder') {
    nextTick(() => {
      drawConnections()
    })
  }
}, { deep: true })

watch(activeTab, (newTab) => {
  if (newTab === 'builder') {
    nextTick(() => {
      updateSvgSize()
      drawConnections()
    })
  }
})
</script>

<style scoped>
/* Design System Variables */
:root {
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Base Component Styles */
.workflow-optimizer {
  min-height: 100vh;
  background: var(--bg-color);
  font-family: var(--font-sans);
  color: var(--text-color);
}

/* Professional Header */
.optimizer-header {
  background: var(--section-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-xl);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--button-text-dark);
  font-size: 1.5rem;
  box-shadow: var(--shadow-md);
}

.header-text h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.025em;
}

.header-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--text-faded);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

/* Modern Button Styles */
.action-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--button-text-dark);
  box-shadow: var(--shadow-md);
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.action-button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-button.secondary {
  background: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.action-button.secondary:hover {
  background: var(--hover-bg);
  border-color: var(--border-color);
  transform: translateY(-1px);
}

.icon-button {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.icon-button:hover {
  background: var(--hover-bg);
  border-color: var(--border-color);
  transform: translateY(-1px);
}

/* Instructions Overlay */
.instructions-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  cursor: pointer;
}

.instructions-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  backdrop-filter: blur(4px);
  pointer-events: none;
}

.instructions-card {
  background: var(--section-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: var(--spacing-2xl);
  pointer-events: auto;
}

.instructions-card h2 {
  margin: 0 0 var(--spacing-xl);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.instruction-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.instruction-step {
  display: flex;
  gap: var(--spacing-lg);
}

.step-number {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: var(--button-text-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
}

.step-content p {
  margin: 0;
  color: var(--text-faded);
  line-height: 1.6;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
}

.feature-icon {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.feature-card h4 {
  margin: 0 0 var(--spacing-xs);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.feature-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-faded);
}

/* Modern Tab Navigation */
.tab-navigation {
  background: var(--section-bg);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-lg) var(--spacing-2xl);
  display: flex;
  justify-content: center;
  gap: 8rem;
  position: sticky;
  top: 73px;
  z-index: 30;
  overflow: visible;
}

.tab-button {
  position: relative;
  background: none;
  border: none;
  padding: var(--spacing-lg) var(--spacing-xl);
  color: var(--text-faded);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all 0.2s ease;
  min-height: 48px;
  border-radius: 50px;
  overflow: visible;
}

.tab-button:hover {
  color: var(--text-color);
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.1);
}

.tab-button.active {
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb, 59, 130, 246), 0.15);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-color);
  border-radius: 4px 4px 0 0;
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.tab-button.active .tab-indicator {
  transform: scaleX(1);
}

/* Tab Content Container */
.tab-content-container {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: visible;
}

.tab-content {
  height: 100%;
  overflow-y: auto;
  background: var(--bg-color);
}

/* Builder Layout */
.builder-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  position: relative;
}

/* Section Styles */
.builder-section, .metrics-section, .gantt-section {
  background: var(--section-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.section-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--text-faded);
}

.section-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* Palette Section */
.palette-section {
  order: 1;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.palette-sidebar {
  position: relative;
  width: 100%;
  background: var(--section-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 20;
}

.palette-sidebar.collapsed {
  height: 60px;
  overflow: hidden;
}

.palette-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--primary-color);
  color: var(--button-text-dark);
  cursor: pointer;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
  overflow: hidden;
}

.palette-toggle:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.palette-toggle i:first-child {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.palette-toggle span {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
}

.toggle-icon {
  margin-left: auto;
  font-size: 0.875rem;
  transition: transform 0.2s ease;
}

.palette-content {
  padding: var(--spacing-md);
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.palette-header-compact {
  padding: 0 0 var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-md);
}

.palette-header-compact .section-subtitle {
  font-size: 0.75rem;
  color: var(--text-faded);
  text-align: center;
  font-style: italic;
}

/* Workflows Section Adjustments */
.workflows-section {
  order: 2;
  flex: 1;
  overflow-y: auto;
  min-height: 400px;
}

/* Palette Slide Animation */
.slide-palette-enter-active,
.slide-palette-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}

.slide-palette-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-palette-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Results Layout */
.results-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.gantt-wrapper {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  overflow-x: auto;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  text-align: center;
  min-height: 400px;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  background: var(--card-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  font-size: 2rem;
  color: var(--text-faded);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-sm);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.empty-state p {
  margin: 0 0 var(--spacing-xl);
  color: var(--text-faded);
  max-width: 400px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-lg);
  color: var(--primary-color);
  font-size: 3rem;
}

.loading-spinner i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-content h3 {
  margin: 0 0 var(--spacing-sm);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.loading-content p {
  margin: 0 0 var(--spacing-lg);
  color: var(--text-faded);
}

.loading-progress {
  width: 200px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* Configuration Dialog */
.config-dialog {
  border-radius: var(--radius-lg) !important;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.config-description {
  margin: 0 0 var(--spacing-lg);
  color: var(--text-faded);
}

.config-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.config-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.config-icon {
  width: 40px;
  height: 40px;
  background: var(--section-bg);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 1.25rem;
  border: 1px solid var(--border-color);
}

.config-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.config-label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}

.config-sublabel {
  font-size: 0.75rem;
  color: var(--text-faded);
}

.dialog-footer {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

/* Connections SVG */
.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

/* Drop indicators - global styles */
:deep(.drop-indicator) {
  width: 4px;
  height: 50px;
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

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.2s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-active {
  opacity: 0;
  transform: translateX(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .palette-section {
    order: 2;
    flex: 0 0 auto;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .workflows-section {
    order: 1;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
  
  .header-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
  }
  
  .header-actions .action-button.primary {
    grid-column: 1 / -1;
  }
  
  .button-text {
    display: none;
  }
  
  .action-button {
    justify-content: center;
  }
  
  .tab-navigation {
    padding: var(--spacing-xs) var(--spacing-lg);
  }
  
  .tab-button {
    flex: 1;
    justify-content: center;
    padding: var(--spacing-lg) var(--spacing-sm);
    font-size: 0.875rem;
    min-height: 44px;
  }
  
  .tab-button span {
    display: none;
  }
  
  .builder-content,
  .results-content {
    padding: var(--spacing-md);
  }
  
  .instruction-steps {
    gap: var(--spacing-md);
  }
  
  .instructions-card {
    padding: var(--spacing-lg);
  }
  
  .gantt-wrapper {
    padding: var(--spacing-sm);
    margin: 0 -var(--spacing-md);
    border-radius: 0;
  }
  
  .palette-content {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .palette-sidebar {
    border-radius: var(--radius-md);
  }
  
  .tab-button span {
    display: none;
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
  
  .action-button {
    flex: 1;
    min-width: 120px;
  }
}

/* Custom Element UI Overrides */
:deep(.el-dialog) {
  border-radius: var(--radius-lg) !important;
}

:deep(.el-dialog__header) {
  padding: var(--spacing-lg) !important;
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-dialog__body) {
  padding: var(--spacing-lg) !important;
}

:deep(.el-dialog__footer) {
  padding: var(--spacing-lg) !important;
  border-top: 1px solid var(--border-color);
}

:deep(.el-input-number) {
  width: 100px;
}

:deep(.el-input-number .el-input__inner) {
  border-radius: var(--radius-md) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-input-number .el-input__inner:focus) {
  border-color: var(--primary-color) !important;
}

/* Tooltips - disabled */

/* Palette Section Specific */
.palette-section {
  height: fit-content;
}

/* Workflows Section Specific  */
.workflows-section {
  min-height: 400px;
}

/* Floating Palette Toggle FAB */
.palette-toggle-fab {
  position: fixed;
  bottom: 80px;
  left: var(--spacing-xl);
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--button-text-dark);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  box-shadow: var(--shadow-lg);
  z-index: 50;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.palette-toggle-fab:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-xl);
}

.palette-toggle-fab.active {
  background: linear-gradient(135deg, var(--success-color, #10b981), var(--success-dark, #059669));
}

/* Thought Bubble Modals */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.instrument-modal {
  position: fixed;
  bottom: 160px; /* Position above the FAB */
  left: var(--spacing-xl);
  width: 400px;
  max-height: 60vh;
  background: var(--section-bg);
  border-radius: 24px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.task-modal {
  position: fixed;
  bottom: 200px;
  left: calc(var(--spacing-xl) + 420px); /* Position to the right of instrument modal */
  width: 300px;
  max-height: 50vh;
  background: var(--section-bg);
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.close-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-faded);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--error-color, #ef4444);
  color: white;
  border-color: var(--error-color, #ef4444);
}

.modal-content {
  padding: var(--spacing-lg);
  max-height: calc(60vh - 80px);
  overflow-y: auto;
}

.instruments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.tasks-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.instrument-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.instrument-item:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-md);
}

.instrument-item .instrument-icon {
  width: 48px;
  height: 48px;
  background: var(--section-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary-color);
}

.instrument-item .instrument-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
  line-height: 1.2;
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.task-item:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.task-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.task-item i {
  color: var(--primary-color);
  font-size: 0.875rem;
  width: 16px;
  text-align: center;
}

.task-item span {
  font-size: 0.875rem;
  color: var(--text-color);
  font-weight: 500;
}

/* Thought Bubble Animation */
.bubble-pop-enter-active,
.bubble-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bubble-pop-enter-from {
  opacity: 0;
}

.bubble-pop-enter-from .modal-backdrop {
  opacity: 0;
}

.bubble-pop-enter-from .instrument-modal,
.bubble-pop-enter-from .task-modal {
  transform: scale(0.3) translateY(30px);
  opacity: 0;
}

.bubble-pop-leave-to {
  opacity: 0;
}

.bubble-pop-leave-to .modal-backdrop {
  opacity: 0;
}

.bubble-pop-leave-to .instrument-modal,
.bubble-pop-leave-to .task-modal {
  transform: scale(0.8) translateY(10px);
  opacity: 0;
}
</style>