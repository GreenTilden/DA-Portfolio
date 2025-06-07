<template>
  <div class="workflow-optimizer">
    <div class="optimizer-header">
      <div class="header-left">
        <h3>Workflow Optimizer</h3>
        <button 
          class="help-button" 
          @click="showInstructions = !showInstructions" 
          v-if="!showInstructions"
        >
          <i class="fas fa-question-circle"></i> How to Use
        </button>
      </div>
      <div class="control-buttons">
        <el-button size="small" @click="showInstrumentConfig = true">
          <i class="fas fa-cog"></i> Configure Instruments
        </el-button>
        <el-button 
          class="optimize-button"
          type="primary" 
          size="medium" 
          @click="handleOptimizeSchedule" 
          :disabled="isOptimizing"
        >
          <i :class="isOptimizing ? 'fas fa-spinner fa-spin' : 'fas fa-chart-line'"></i> 
          {{ isOptimizing ? 'Optimizing...' : 'Optimize Schedule' }}
        </el-button>
        <el-button size="small" @click="handleResetWorkflows">
          <i class="fas fa-undo"></i> Reset
        </el-button>
      </div>
    </div>

    <!-- Instructions Panel -->
    <transition name="fade">
      <div class="instructions-panel" v-if="showInstructions">
        <div class="instructions-header">
          <h3>How to Use the Workflow Optimizer</h3>
          <button class="close-button" @click="showInstructions = false">×</button>
        </div>
        <div class="instructions-content">
          <ol>
            <li><strong>Create Workflows:</strong> The demo includes pre-built workflows. You can modify them by dragging instruments from the palette to the workflow lanes.</li>
            <li><strong>Configure Instruments:</strong> Click the "Configure Instruments" button to adjust how many instances of each instrument are available.</li>
            <li><strong>Optimize Schedule:</strong> Click the "Optimize" button to generate an optimized schedule based on instrument availability and workflow priorities.</li>
            <li><strong>Analyze Results:</strong> Review the Gantt chart to see the scheduled tasks and check for conflicts. The metrics section shows total time, conflicts, and resource utilization.</li>
            <li><strong>Experiment:</strong> Try different configurations to see how they affect the schedule. Higher priority workflows (1 is highest) are scheduled first.</li>
          </ol>
          <div class="feature-highlights">
            <div class="highlight">
              <span class="highlight-icon">🔄</span>
              <div>
                <strong>Drag & Drop</strong>
                <p>Drag instruments from the palette to the workflow lanes to create or modify steps.</p>
              </div>
            </div>
            <div class="highlight">
              <span class="highlight-icon">⚙️</span>
              <div>
                <strong>Resource Management</strong>
                <p>Configure the number of available instruments to simulate real lab constraints.</p>
              </div>
            </div>
            <div class="highlight">
              <span class="highlight-icon">📊</span>
              <div>
                <strong>Bottleneck Detection</strong>
                <p>The optimizer identifies scheduling conflicts and bottlenecks in your workflows.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Instrument Palette -->
    <InstrumentPalette
      :custom-tasks="customTasks"
      @task-created="handleCustomTaskCreated"
      @task-edited="handleCustomTaskEdited"
      @task-removed="handleCustomTaskRemoved"
      @drag-start="handlePaletteDragStart"
    />

    <!-- Workflows Section -->
    <WorkflowBuilder
      :workflows="workflows"
      :drag-item="currentDragItem"
      @update:workflows="updateWorkflows"
      @step-edited="handleStepEdited"
      @workflows-changed="handleWorkflowsChanged"
    />

    <!-- Connection Lines Canvas -->
    <svg class="connections-svg" ref="connectionsSvg"></svg>

    <!-- Gantt Chart -->
    <div class="gantt-section">
      <GanttChart
        :schedule="schedule"
        :workflows="workflows"
        @task-clicked="handleTaskClicked"
      />
    </div>

    <!-- Metrics -->
    <OptimizationMetrics
      :metrics="metrics"
      @metric-clicked="handleMetricClicked"
    />

    <!-- Instrument Configuration Dialog -->
    <el-dialog 
      v-model="showInstrumentConfig" 
      title="Configure Instrument Nests"
      width="600px"
      class="instrument-config-dialog"
    >
      <div class="config-content">
        <div 
          v-for="(config, instrument) in instrumentConfig" 
          :key="instrument" 
          class="config-row"
        >
          <span class="config-label">{{ instrument }}</span>
          <el-input-number
            v-model="config.nests"
            :min="1"
            :max="5"
            size="small"
          />
          <span class="config-suffix">nests</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showInstrumentConfig = false">Cancel</el-button>
        <el-button type="primary" @click="saveInstrumentConfig">Save</el-button>
      </template>
    </el-dialog>

    <!-- Duration Editor for workflow steps -->
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Workflow, Step, DragItem, ScheduledTask } from '@/types/workflow'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { useDragDrop } from '@/composables/useDragDrop'
import { useConnections } from '@/composables/useConnections'
import { createOptimizationEngine } from '@/utils/optimizationEngine'
import InstrumentPalette from '@/components/workflow/InstrumentPalette.vue'
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
const showInstructions = ref(false)
const showInstrumentConfig = ref(false)
const showStepDurationEditor = ref(false)
const editingStep = ref<Step | null>(null)
const connectionsSvg = ref<SVGSVGElement | null>(null)

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

const { currentDragItem, onDragEnd } = useDragDrop()

const { updateSvgSize, drawConnections } = useConnections(connectionsSvg, workflows)

// Initialize workflows
const initializeWorkflows = () => {
  if (workflows.value.length === 0) {
    workflows.value = JSON.parse(JSON.stringify(DEFAULT_WORKFLOWS))
  }
}

// Optimization
const handleOptimizeSchedule = async () => {
  isOptimizing.value = true
  
  try {
    // Create optimization engine
    const engine = createOptimizationEngine(instrumentConfig.value)
    
    // Run optimization
    const { schedule: optimizedSchedule, metrics: calculatedMetrics } = 
      engine.optimizeSchedule(workflows.value)
    
    // Update state
    updateSchedule(optimizedSchedule)
    updateMetrics(calculatedMetrics)
    
    // Validate schedule
    const validation = engine.validateSchedule(optimizedSchedule)
    if (!validation.isValid) {
      console.warn('Schedule validation errors:', validation.errors)
    }
    
    // Get bottleneck analysis
    const bottlenecks = engine.getBottleneckAnalysis(optimizedSchedule)
    console.log('Bottleneck analysis:', bottlenecks)
    
  } catch (error) {
    console.error('Optimization error:', error)
  } finally {
    setTimeout(() => {
      isOptimizing.value = false
    }, 500)
  }
}

// Event handlers
const handleCustomTaskCreated = (task: Omit<typeof customTasks.value[0], 'id'>) => {
  addCustomTask(task)
}

const handleCustomTaskEdited = (task: typeof customTasks.value[0]) => {
  const index = customTasks.value.findIndex(t => t.id === task.id)
  if (index !== -1) {
    customTasks.value[index] = task
    saveState()
  }
}

const handleCustomTaskRemoved = (task: typeof customTasks.value[0]) => {
  removeCustomTask(task.id)
}

const handlePaletteDragStart = (event: DragEvent, item: DragItem) => {
  // The drag composable handles the data, but we need to ensure cleanup
  const dragEndHandler = () => {
    onDragEnd()
    event.target?.removeEventListener('dragend', dragEndHandler)
  }
  event.target?.addEventListener('dragend', dragEndHandler)
  
  // Also add global dragend listener as backup
  document.addEventListener('dragend', () => {
    setTimeout(() => {
      onDragEnd()
    }, 100)
  }, { once: true })
}

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
  
  // Find and update the step in workflows
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
    // Re-optimize if we have a schedule
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
  
  // Re-optimize if we have a schedule
  if (schedule.value.length > 0) {
    handleOptimizeSchedule()
  }
}

const handleTaskClicked = (task: ScheduledTask) => {
  console.log('Task clicked:', task)
  // Could show task details or allow editing
}

const handleMetricClicked = (metric: string) => {
  console.log('Metric clicked:', metric)
  // Could show more details about the metric
}

// Lifecycle
onMounted(() => {
  loadState()
  initializeWorkflows()
  
  nextTick(() => {
    updateSvgSize()
    drawConnections()
  })
  
  window.addEventListener('resize', updateSvgSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSvgSize)
})

// Watch for workflow changes
watch(workflows, () => {
  nextTick(() => {
    drawConnections()
  })
}, { deep: true })
</script>

<style scoped>
.workflow-optimizer {
  padding: 2rem;
  background-color: var(--card-bg);
  border-radius: 0.5rem;
  position: relative;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);
  overflow: hidden;
}

.optimizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.optimizer-header h3 {
  margin: 0;
  color: var(--text-light);
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center ;
}

/* Help button */
.help-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  z-index: 10;
  margin-left: 1rem;
  transition: all 0.2s ease;
}

.help-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

/* Instructions Panel */
.instructions-panel {
  position: absolute;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
}

.instructions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
}

.instructions-header h3 {
  margin: 0;
  color: white;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.instructions-content {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.instructions-content ol {
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.instructions-content li {
  margin-bottom: 0.75rem;
  color: var(--text-light);
}

.feature-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.highlight {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-color);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.highlight-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.highlight strong {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.highlight p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-light);
}

/* Connections SVG */
.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

/* Configuration Dialog */
.config-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.config-label {
  flex: 1;
  color: var(--text-light);
}

.config-suffix {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Dialog customization */
:deep(.instrument-config-dialog .el-dialog__header) {
  background-color: var(--primary-color);
  padding: 15px 20px;
}

:deep(.instrument-config-dialog .el-dialog__title) {
  color: white;
  font-weight: 500;
}

:deep(.instrument-config-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Optimize button styling */
.optimize-button {
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.optimize-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.optimize-button:hover::before {
  left: 100%;
}

.optimize-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.4);
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
}

.optimize-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
}

.optimize-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

/* Button icon animation */
.optimize-button .fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .workflow-optimizer {
    padding: 0.75rem;
  }
  
  .optimizer-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }

  .control-buttons {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .control-buttons .optimize-button {
    grid-column: 1 / -1;
    width: 100%;
    margin-top: 0.25rem;
  }

  .control-buttons .el-button {
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    font-size: 0.875rem;
  }

  .control-buttons .el-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .control-buttons .el-button--primary {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border: none;
  }

  .control-buttons .el-button--primary:hover {
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  }
  
  .help-button {
    margin-left: 0;
    font-size: 0.875rem;
  }
  
  .header-left {
    gap: 0.5rem;
  }

  .header-left h3 {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }
  
  .instructions-panel {
    width: 95%;
    top: 3rem;
  }
  
  .feature-highlights {
    grid-template-columns: 1fr;
  }

  /* Reduce gaps on mobile */
  .workflow-section {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .workflow-lanes {
    gap: 0.5rem;
  }

  .labware-lane {
    padding: 0.5rem;
  }

  .lane-steps {
    padding: 0.375rem;
    min-height: 50px;
  }

  #app {
    max-width: 100%;
    padding: 0.5rem;
  }

  .container {
    padding: 0;
  }
}

/* Gantt section constraints */
.gantt-section {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  flex-shrink: 0;
}
</style>