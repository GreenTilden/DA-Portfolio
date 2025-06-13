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
      <div v-if="showInstructions" class="instructions-backdrop" @click="showInstructions = false">
        <div class="instructions-overlay">
          <div class="instructions-card">
            <h2><i class="fas fa-graduation-cap"></i> Getting Started</h2>
            
            <div class="instruction-steps">
              <div class="instruction-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h3>Create Workflows</h3>
                  <p>Click "Create Workflow" to start building your laboratory processes with our guided modal interface.</p>
                </div>
              </div>
              
              <div class="instruction-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h3>Add Tasks</h3>
                  <p>Use the floating action button to add instruments and tasks to your workflow lanes.</p>
                </div>
              </div>
              
              <div class="instruction-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h3>Optimize Schedule</h3>
                  <p>Generate an efficient schedule that minimizes conflicts and maximizes throughput.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Tab Navigation -->
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

    <!-- Tab Content -->
    <div class="tab-content-container">
      <transition name="tab-fade" mode="out-in">
        <!-- Builder Tab -->
        <div v-if="activeTab === 'builder'" key="builder" class="tab-content builder-tab">
          <!-- Empty State -->
          <div v-if="workflows.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h3>No Workflows Yet</h3>
            <p>Create your first workflow to get started with laboratory automation optimization</p>
            <button class="action-button primary" @click="openWorkflowCreation">
              <i class="fas fa-plus"></i> Create Workflow
            </button>
          </div>

          <!-- Workflow Grid -->
          <div v-else class="workflows-grid">
            <div class="workflows-header">
              <h2>
                <i class="fas fa-project-diagram"></i>
                Active Workflows ({{ workflows.length }})
              </h2>
              <button class="action-button primary" @click="openWorkflowCreation">
                <i class="fas fa-plus"></i>
                <span class="button-text">Create Workflow</span>
              </button>
            </div>

            <!-- Workflow Thumbnails -->
            <div class="workflow-thumbnails">
              <WorkflowThumbnail
                v-for="workflow in workflows"
                :key="workflow.id"
                :workflow="workflow"
                @click="openWorkflowEditor(workflow.id)"
              />
            </div>
          </div>
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

    <!-- Floating Action Button for Adding Tasks -->
    <transition name="fab-scale">
      <button 
        v-if="activeTab === 'builder' && workflows.length > 0"
        class="fab-add-task"
        @click="openTaskAddition"
        title="Add task to workflow"
      >
        <i class="fas fa-plus"></i>
      </button>
    </transition>

    <!-- Modal Workflow Flow Controller -->
    <ModalWorkflowFlowController>
      <template #workflow-selection="{ onSelect }">
        <WorkflowSelectModal :on-select="onSelect" />
      </template>
      
      <template #lane-selection="{ onSelect, workflowId }">
        <LaneSelectModal 
          :on-select="onSelect" 
          :workflow-id="workflowId"
          :pending-task="pendingTaskForModal"
        />
      </template>
      
      <template #lane-editor="{ workflowId, laneId, pendingTask, openedFromFAB: openedFromFab, onComplete }">
        <LaneEditorModal
          :workflow-id="workflowId"
          :lane-id="laneId"
          :pending-task="pendingTask"
          :opened-from-f-a-b="openedFromFab"
          :on-complete="onComplete"
        />
      </template>
    </ModalWorkflowFlowController>

    <!-- Instrument Selection Modal for FAB -->
    <el-dialog 
      v-model="showInstrumentSelection" 
      title="Select Instrument"
      width="500px"
      class="instrument-selection-dialog"
    >
      <div class="instruments-grid">
        <div 
          v-for="instrument in Object.keys(INSTRUMENTS)"
          :key="instrument"
          class="instrument-item"
          @click="selectInstrument(instrument)"
        >
          <div class="instrument-icon">
            <i :class="getInstrumentIcon(instrument)"></i>
          </div>
          <span class="instrument-name">{{ instrument }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- Task Selection Modal -->
    <el-dialog 
      v-model="showTaskSelection" 
      :title="`${selectedInstrument} Tasks`"
      width="400px"
      class="task-selection-dialog"
    >
      <div class="tasks-list">
        <div 
          v-for="task in getInstrumentTasks(selectedInstrument)"
          :key="task"
          class="task-item"
          @click="selectTask(task)"
        >
          <i :class="getInstrumentIcon(selectedInstrument)"></i>
          <span>{{ task }}</span>
        </div>
      </div>
    </el-dialog>

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
      title="Instrument Configuration"
      width="500px"
      class="config-dialog"
    >
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
          <el-button @click="showInstrumentConfig = false">
            Cancel
          </el-button>
          <el-button type="primary" @click="saveInstrumentConfig">
            <i class="fas fa-save"></i> Save Configuration
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { useModalWorkflowEditor } from '@/composables/useModalWorkflowEditor'
import { optimizeSchedule } from '@/utils/optimizationEngine'
import { INSTRUMENTS, INSTRUMENT_ICONS, DEFAULT_DURATIONS } from '@/constants/instruments'
import type { Step } from '@/types/workflow'

// Import components
import ModalWorkflowFlowController from '@/components/workflow/ModalWorkflowFlowController.vue'
import WorkflowSelectModal from '@/components/workflow/WorkflowSelectModal.vue'
import LaneSelectModal from '@/components/workflow/LaneSelectModal.vue'
import LaneEditorModal from '@/components/workflow/LaneEditorModal.vue'
import WorkflowThumbnail from '@/components/workflow/WorkflowThumbnail.vue'
import OptimizationMetrics from '@/components/workflow/OptimizationMetrics.vue'
import GanttChart from '@/components/workflow/GanttChart.vue'

// State management
const {
  workflows,
  instrumentConfig,
  schedule,
  metrics,
  isOptimizing,
  updateSchedule,
  updateMetrics,
  loadState,
  saveState
} = useWorkflowState()

const {
  openFromFAB,
  openFromPreview
} = useModalWorkflowEditor()

// Local reactive state
const activeTab = ref('builder')
const showInstructions = ref(false)
const showInstrumentConfig = ref(false)
const showInstrumentSelection = ref(false)
const showTaskSelection = ref(false)
const selectedInstrument = ref('')
const pendingTaskForModal = ref<Step | null>(null)

// Lifecycle
onMounted(() => {
  loadState()
})

// Methods
const toggleInstructions = () => {
  showInstructions.value = !showInstructions.value
}

const openWorkflowCreation = () => {
  openFromPreview()
}

const openWorkflowEditor = (workflowId: string) => {
  openFromPreview(workflowId)
}

const openTaskAddition = () => {
  showInstrumentSelection.value = true
}

const selectInstrument = (instrument: string) => {
  selectedInstrument.value = instrument
  showInstrumentSelection.value = false
  showTaskSelection.value = true
}

const selectTask = (task: string) => {
  const newStep: Step = {
    id: `step-${Date.now()}`,
    type: selectedInstrument.value,
    task,
    duration: DEFAULT_DURATIONS[selectedInstrument.value] || 5
  }
  
  pendingTaskForModal.value = newStep
  showTaskSelection.value = false
  
  // Open modal with pending task
  openFromFAB(newStep)
}

const getInstrumentIcon = (instrument: string) => {
  return INSTRUMENT_ICONS[instrument] || 'fas fa-cog'
}

const getInstrumentTasks = (instrument: string) => {
  return INSTRUMENTS[instrument as keyof typeof INSTRUMENTS] || []
}

const handleOptimizeSchedule = async () => {
  if (workflows.value.length === 0) return
  
  isOptimizing.value = true
  
  try {
    // Simulate optimization delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const result = optimizeSchedule(workflows.value, instrumentConfig.value)
    updateSchedule(result.schedule)
    updateMetrics(result.metrics)
    
    // Switch to results tab
    activeTab.value = 'results'
  } catch (error) {
    console.error('Optimization failed:', error)
  } finally {
    isOptimizing.value = false
  }
}

const saveInstrumentConfig = () => {
  saveState()
  showInstrumentConfig.value = false
}

const handleMetricClicked = (metric: string) => {
  console.log('Metric clicked:', metric)
}

const handleTaskClicked = (task: any) => {
  console.log('Task clicked:', task)
}
</script>

<style scoped>
/* Base styles */
.workflow-optimizer {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  position: relative;
}

/* Header styles */
.optimizer-header {
  background: var(--section-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.header-text h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-light);
}

.header-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-light);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
}

.action-button.primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Instructions overlay */
.instructions-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.instructions-overlay {
  background: var(--card-bg);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.instructions-card {
  padding: 2rem;
}

.instructions-card h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  color: var(--text-light);
  font-size: 1.5rem;
}

.instruction-steps {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.instruction-step {
  display: flex;
  gap: 1rem;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-light);
  font-size: 1.125rem;
}

.step-content p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Tab navigation */
.tab-navigation {
  background: var(--section-bg);
  border-bottom: 1px solid var(--border-color);
  padding: 0 2rem;
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: var(--text-light);
}

.tab-button.active {
  color: var(--primary-color);
}

.tab-indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-color);
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.tab-button.active .tab-indicator {
  transform: scaleX(1);
}

/* Tab content */
.tab-content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 60vh;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state-icon {
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--text-light);
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: var(--text-muted);
  max-width: 400px;
}

/* Workflows grid */
.workflows-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.workflows-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: var(--text-light);
  font-size: 1.25rem;
}

.workflow-thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* FAB */
.fab-add-task {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 100;
}

.fab-add-task:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Instrument and task selection */
.instruments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.instrument-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.instrument-item:hover {
  border-color: var(--primary-color);
  background: var(--hover-bg);
}

.instrument-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  font-size: 1.25rem;
}

.instrument-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-light);
  text-align: center;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
}

.task-item i {
  color: var(--primary-color);
}

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.loading-content p {
  margin: 0 0 1.5rem 0;
  opacity: 0.8;
}

.loading-progress {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  animation: loading-progress 2s ease-in-out infinite;
}

@keyframes loading-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200px); }
}

/* Configuration dialog */
.config-content {
  padding: 1rem 0;
}

.config-description {
  margin-bottom: 1.5rem;
  color: var(--text-muted);
}

.config-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-alt);
  border-radius: 8px;
}

.config-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
}

.config-details {
  flex: 1;
}

.config-label {
  display: block;
  font-weight: 500;
  color: var(--text-light);
}

.config-sublabel {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: all 0.3s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fab-scale-enter-active,
.fab-scale-leave-active {
  transition: all 0.3s ease;
}

.fab-scale-enter-from,
.fab-scale-leave-to {
  transform: scale(0);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .optimizer-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .tab-navigation {
    padding: 0 1rem;
  }
  
  .tab-content-container {
    padding: 1rem;
  }
  
  .workflow-thumbnails {
    grid-template-columns: 1fr;
  }
  
  .instruments-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>