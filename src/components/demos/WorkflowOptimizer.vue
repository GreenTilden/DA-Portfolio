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
          <button 
            class="action-button secondary" 
            @click="showInstructions = !showInstructions"
            v-tooltip="'Learn how to use the optimizer'"
          >
            <i class="fas fa-question-circle"></i>
            <span class="button-text">Help</span>
          </button>
          <button 
            class="action-button secondary" 
            @click="showInstrumentConfig = true"
            v-tooltip="'Configure available instruments'"
          >
            <i class="fas fa-cog"></i>
            <span class="button-text">Configure</span>
          </button>
          <button 
            class="action-button primary"
            @click="handleOptimizeSchedule" 
            :disabled="isOptimizing || workflows.length === 0"
          >
            <i :class="isOptimizing ? 'fas fa-spinner fa-spin' : 'fas fa-magic'"></i>
            <span class="button-text">{{ isOptimizing ? 'Optimizing...' : 'Optimize' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Instructions Overlay -->
    <transition name="slide-fade">
      <div class="instructions-overlay" v-if="showInstructions">
        <div class="instructions-card">
          <button class="close-button" @click="showInstructions = false">
            <i class="fas fa-times"></i>
          </button>
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
            <div class="builder-layout">
              <!-- Instrument Palette Card -->
              <section class="builder-section palette-section">
                <div class="section-header">
                  <h2><i class="fas fa-toolbox"></i> Instrument Palette</h2>
                  <span class="section-subtitle">Drag instruments to workflows</span>
                </div>
                <InstrumentPalette
                  :custom-tasks="customTasks"
                  @task-created="handleCustomTaskCreated"
                  @task-edited="handleCustomTaskEdited"
                  @task-removed="handleCustomTaskRemoved"
                  @drag-start="handlePaletteDragStart"
                />
              </section>

              <!-- Workflows Section -->
              <section class="builder-section workflows-section">
                <div class="section-header">
                  <h2><i class="fas fa-project-diagram"></i> Active Workflows</h2>
                  <div class="section-actions">
                    <button class="icon-button" @click="addNewWorkflow" v-tooltip="'Add new workflow'">
                      <i class="fas fa-plus"></i>
                    </button>
                    <button class="icon-button" @click="handleResetWorkflows" v-tooltip="'Reset to defaults'">
                      <i class="fas fa-undo"></i>
                    </button>
                  </div>
                </div>
                <WorkflowBuilder
                  :workflows="workflows"
                  :drag-item="currentDragItem"
                  @update:workflows="updateWorkflows"
                  @step-edited="handleStepEdited"
                  @workflows-changed="handleWorkflowsChanged"
                />
              </section>
            </div>
          </div>

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
      title=""
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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Workflow, Step, DragItem, ScheduledTask } from '@/types/workflow'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { useDragDrop } from '@/composables/useDragDrop'
import { useConnections } from '@/composables/useConnections'
import { createOptimizationEngine } from '@/utils/optimizationEngine'
import { INSTRUMENT_ICONS } from '@/constants/instruments'
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
const activeTab = ref<'builder' | 'results'>('builder')
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
  const dragEndHandler = () => {
    onDragEnd()
    event.target?.removeEventListener('dragend', dragEndHandler)
  }
  event.target?.addEventListener('dragend', dragEndHandler)
  
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
  /* Professional Color Palette */
  --primary-blue: #2563eb;
  --primary-blue-dark: #1d4ed8;
  --primary-blue-light: #3b82f6;
  --secondary-blue: #64748b;
  --accent-green: #10b981;
  --accent-red: #ef4444;
  --accent-orange: #f59e0b;
  
  /* Neutrals */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
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
  background: var(--gray-50);
  font-family: var(--font-sans);
  color: var(--gray-900);
}

/* Professional Header */
.optimizer-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
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
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: var(--shadow-md);
}

.header-text h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.025em;
}

.header-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--gray-600);
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
  background: linear-gradient(135deg, var(--primary-blue), var(--primary-blue-dark));
  color: white;
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
  background: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  box-shadow: var(--shadow-sm);
}

.action-button.secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
  transform: translateY(-1px);
}

.icon-button {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-300);
  background: white;
  color: var(--gray-700);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.icon-button:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
  transform: translateY(-1px);
}

/* Instructions Overlay */
.instructions-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--spacing-xl);
  backdrop-filter: blur(4px);
}

.instructions-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: var(--spacing-2xl);
}

.instructions-card h2 {
  margin: 0 0 var(--spacing-xl);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.close-button {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--gray-100);
  color: var(--gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--gray-200);
  color: var(--gray-800);
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
  background: var(--primary-blue);
  color: white;
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
  color: var(--gray-900);
}

.step-content p {
  margin: 0;
  color: var(--gray-600);
  line-height: 1.6;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.feature-card {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
}

.feature-icon {
  font-size: 2rem;
  color: var(--primary-blue);
  margin-bottom: var(--spacing-sm);
}

.feature-card h4 {
  margin: 0 0 var(--spacing-xs);
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
}

.feature-card p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

/* Modern Tab Navigation */
.tab-navigation {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: 0 var(--spacing-xl);
  display: flex;
  gap: var(--spacing-lg);
  position: sticky;
  top: 73px;
  z-index: 30;
}

.tab-button {
  position: relative;
  background: none;
  border: none;
  padding: var(--spacing-lg) var(--spacing-sm);
  color: var(--gray-600);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--gray-900);
}

.tab-button.active {
  color: var(--primary-blue);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-blue);
  border-radius: 3px 3px 0 0;
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
}

.tab-content {
  height: 100%;
  overflow-y: auto;
  background: var(--gray-50);
}

/* Builder Layout */
.builder-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.builder-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-xl);
  align-items: start;
}

/* Section Styles */
.builder-section, .metrics-section, .gantt-section {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.section-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.section-actions {
  display: flex;
  gap: var(--spacing-sm);
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
  background: var(--gray-50);
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
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  font-size: 2rem;
  color: var(--gray-400);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-sm);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-900);
}

.empty-state p {
  margin: 0 0 var(--spacing-xl);
  color: var(--gray-600);
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
  color: var(--primary-blue);
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
  color: var(--gray-900);
}

.loading-content p {
  margin: 0 0 var(--spacing-lg);
  color: var(--gray-600);
}

.loading-progress {
  width: 200px;
  height: 4px;
  background: var(--gray-200);
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto;
}

.progress-bar {
  height: 100%;
  background: var(--primary-blue);
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
  color: var(--gray-900);
}

.config-description {
  margin: 0 0 var(--spacing-lg);
  color: var(--gray-600);
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
  background: var(--gray-50);
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-200);
}

.config-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-blue);
  font-size: 1.25rem;
  border: 1px solid var(--gray-200);
}

.config-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.config-label {
  font-weight: 500;
  color: var(--gray-900);
  font-size: 0.875rem;
}

.config-sublabel {
  font-size: 0.75rem;
  color: var(--gray-600);
}

.dialog-footer {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}

/* Connections SVG */
.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
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
  .builder-layout {
    grid-template-columns: 1fr;
  }
  
  .palette-section {
    position: sticky;
    top: 140px;
    z-index: 20;
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
    padding: 0 var(--spacing-md);
  }
  
  .tab-button {
    flex: 1;
    justify-content: center;
    padding: var(--spacing-md) var(--spacing-xs);
    font-size: 0.75rem;
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
}

/* Custom Element UI Overrides */
:deep(.el-dialog) {
  border-radius: var(--radius-lg) !important;
}

:deep(.el-dialog__header) {
  padding: var(--spacing-lg) !important;
  border-bottom: 1px solid var(--gray-200);
}

:deep(.el-dialog__body) {
  padding: var(--spacing-lg) !important;
}

:deep(.el-dialog__footer) {
  padding: var(--spacing-lg) !important;
  border-top: 1px solid var(--gray-200);
}

:deep(.el-input-number) {
  width: 100px;
}

:deep(.el-input-number .el-input__inner) {
  border-radius: var(--radius-md) !important;
  border-color: var(--gray-300) !important;
}

:deep(.el-input-number .el-input__inner:focus) {
  border-color: var(--primary-blue) !important;
}

/* Tooltips */
[v-tooltip] {
  position: relative;
}

/* Palette Section Specific */
.palette-section {
  height: fit-content;
}

/* Workflows Section Specific  */
.workflows-section {
  min-height: 400px;
}
</style>