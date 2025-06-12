<template>
  <div class="liquid-handler-visualizer">
    <el-card shadow="hover" class="main-card">
      <template #header>
        <div class="header-content">
          <h3>Liquid Handler Control Simulator</h3>
          <p class="subtitle">Real-time control interface for liquid handling operations</p>
        </div>
      </template>
      
      <!-- Control Panel -->
      <div class="control-panel">
        <el-button-group>
          <el-button 
            :type="isRunning ? 'danger' : 'primary'"
            @click="toggleRun"
            size="default"
          >
            {{ isRunning ? 'Pause' : 'Run' }}
          </el-button>
          <el-button @click="reset" :disabled="isRunning" size="default">
            Reset
          </el-button>
          <el-button @click="showProtocolModal = true" size="default">
            Load Protocol
          </el-button>
        </el-button-group>
        
        <div class="status-indicators">
          <el-tag :type="isRunning ? 'success' : 'info'" effect="dark">
            {{ isRunning ? 'Running' : 'Ready' }}
          </el-tag>
          <el-tag type="warning" v-if="currentStep" effect="dark">
            Step {{ currentStepIndex + 1 }} / {{ protocol.length }}
          </el-tag>
        </div>
      </div>

      <!-- Tabs for Different Views -->
      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane label="Deck Visualization" name="deck">
          <!-- Main Visualization Area -->
          <div class="visualization-area">
            <!-- Deck Layout -->
            <div class="deck-container">
              <h4>Deck Layout</h4>
              <div class="deck-grid">
                <div 
                  v-for="position in deckPositions" 
                  :key="position.id"
                  class="deck-position"
                  :class="{ 
                    'occupied': position.labware,
                    'active': position.id === activePosition,
                    'source': position.id === currentTransfer?.source,
                    'destination': position.id === currentTransfer?.destination,
                    'mobile-selectable': isMobile,
                    'pending': pendingLabware && !position.labware
                  }"
                  @drop="handleDrop($event, position)"
                  @dragover.prevent
                  @dragenter.prevent
                  @click="handlePositionClick(position)"
                  @touchstart="handlePositionTouchStart($event, position)"
                  @touchend="handlePositionTouchEnd($event, position)"
                >
                  <div class="position-label">{{ position.label }}</div>
                  <div v-if="position.labware" class="labware">
                    <i :class="position.labware.icon"></i>
                    <span>{{ position.labware.name }}</span>
                    <div class="volume-indicator" v-if="position.labware.currentVolume !== undefined">
                      {{ position.labware.currentVolume }} / {{ position.labware.maxVolume }} µL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Labware Palette (Desktop) -->
            <div class="labware-palette desktop-only">
              <h4>Available Labware</h4>
              <div class="labware-items">
                <div 
                  v-for="item in labwareTypes" 
                  :key="item.id"
                  class="labware-item"
                  draggable="true"
                  @dragstart="handleDragStart($event, item)"
                >
                  <i :class="item.icon"></i>
                  <span>{{ item.name }}</span>
                </div>
              </div>
            </div>
            
            <!-- Mobile Labware Button -->
            <el-button 
              class="mobile-labware-button mobile-only"
              @click="showMobileLabwareDrawer = true"
              type="primary"
              size="large"
              circle
              title="Select Labware"
            >
              +
            </el-button>
          </div>
          
          <!-- Progress Overview -->
          <div class="progress-overview" v-if="protocol.length > 0">
            <el-progress 
              :percentage="progressPercentage" 
              :status="progressStatus"
              :stroke-width="20"
              :text-inside="true"
            />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="Protocol Builder" name="builder">
          <!-- Protocol Builder Interface -->
          <ProtocolBuilder
            :protocol="currentProtocol"
            :deck-positions="deckPositions"
            :validation-errors="validationErrors"
            :can-undo="canUndo"
            :can-redo="canRedo"
            @add-step="handleAddStep"
            @edit-step="handleEditStep"
            @remove-step="handleRemoveStep"
            @move-step="handleMoveStep"
            @clear-protocol="handleClearProtocol"
            @undo="handleUndo"
            @redo="handleRedo"
            @step-selected="handleStepSelected"
          />
        </el-tab-pane>
        
        <el-tab-pane label="Execution Timeline" name="timeline">
          <!-- Protocol Timeline with Gantt Chart -->
          <GanttChart
            v-if="protocolScheduledTasks.length > 0"
            :schedule="protocolScheduledTasks"
            :workflows="protocolWorkflows"
            :pixels-per-minute="2"
            @task-clicked="handleTaskClick"
          />
          
          <el-empty v-else description="No protocol steps to display" />
        </el-tab-pane>
      </el-tabs>

      <!-- Enhanced Metrics Display -->
      <OptimizationMetrics
        v-if="metrics.totalTime > 0"
        :metrics="metrics"
        :previous-metrics="previousMetrics"
        @metric-clicked="handleMetricClick"
      />
    </el-card>

    <!-- Protocol Selection Modal -->
    <el-dialog 
      v-model="showProtocolModal"
      title="Select Protocol"
      width="600px"
    >
      <div class="protocol-list">
        <el-card 
          v-for="preset in presetProtocols" 
          :key="preset.id"
          shadow="hover"
          class="protocol-card"
          @click="loadProtocol(preset)"
        >
          <h4>{{ preset.name }}</h4>
          <p>{{ preset.description }}</p>
          <el-tag type="info">{{ preset.steps.length }} steps</el-tag>
        </el-card>
      </div>
    </el-dialog>
    
    <!-- Mobile Labware Drawer -->
    <el-drawer
      v-model="showMobileLabwareDrawer"
      title="Available Labware"
      direction="btt"
      size="50%"
    >
      <div class="labware-items">
        <div 
          v-for="item in labwareTypes" 
          :key="item.id"
          class="labware-item"
          @click="handleMobileLabwareSelect(item)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.name }}</span>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElNotification } from 'element-plus'
import GanttChart from '@/components/workflow/GanttChart.vue'
import OptimizationMetrics from '@/components/workflow/OptimizationMetrics.vue'
import ProtocolBuilder from '@/components/liquid-handler/ProtocolBuilder.vue'
import type { ScheduledTask, Workflow, Metrics } from '@/types/workflow'
import type { 
  LabwareItem, 
  DeckPosition, 
  TransferStep, 
  LiquidHandlerProtocol,
  LiquidHandlerStep 
} from '@/types/liquidHandler'
import { useLiquidHandlerState } from '@/composables/useLiquidHandlerState'

// Composables
const {
  currentProtocol,
  validationErrors,
  canUndo,
  canRedo,
  addStep,
  editStep,
  removeStep,
  moveStep,
  clearProtocol,
  undo,
  redo,
  validateProtocol,
  loadProtocolState
} = useLiquidHandlerState()

// State
const isRunning = ref(false)
const currentStepIndex = ref(-1)
const showProtocolModal = ref(false)
const activePosition = ref(null)
const currentTransfer = ref<{ source?: string; destination?: string } | null>(null)
const draggedLabware = ref<LabwareItem | null>(null)
const activeTab = ref('deck')
const showMobileLabwareDrawer = ref(false)
const selectedStepIndex = ref(-1)
const deckPositions = ref<DeckPosition[]>([
  { id: 'A1', label: 'A1', x: 100, y: 100, labware: null },
  { id: 'A2', label: 'A2', x: 300, y: 100, labware: null },
  { id: 'A3', label: 'A3', x: 500, y: 100, labware: null },
  { id: 'B1', label: 'B1', x: 100, y: 300, labware: null },
  { id: 'B2', label: 'B2', x: 300, y: 300, labware: null },
  { id: 'B3', label: 'B3', x: 500, y: 300, labware: null },
])

// Labware types
const labwareTypes: LabwareItem[] = [
  { 
    id: 'plate96', 
    name: '96-Well Plate', 
    icon: 'fas fa-th', 
    maxVolume: 20000,
    currentVolume: 20000 
  },
  { 
    id: 'tips1000', 
    name: '1000µL Tips', 
    icon: 'fas fa-vial', 
    maxVolume: 1000
  },
  { 
    id: 'reagent', 
    name: 'Reagent Reservoir', 
    icon: 'fas fa-flask', 
    maxVolume: 50000,
    currentVolume: 50000
  },
  { 
    id: 'waste', 
    name: 'Waste Container', 
    icon: 'fas fa-trash', 
    maxVolume: 100000,
    currentVolume: 0
  }
]

// Protocol management
const protocol = ref<TransferStep[]>([])
const presetProtocols: LiquidHandlerProtocol[] = [
  {
    id: 'serial_dilution',
    name: 'Serial Dilution',
    description: '1:2 serial dilution across 12 wells',
    steps: [
      { name: 'Add Diluent', source: 'B1', destination: 'A1', volume: 100 },
      { name: 'Transfer 1', source: 'A1', destination: 'A2', volume: 50 },
      { name: 'Transfer 2', source: 'A2', destination: 'A3', volume: 50 },
    ]
  },
  {
    id: 'plate_replication',
    name: 'Plate Replication',
    description: 'Copy samples from source to destination plate',
    steps: [
      { name: 'Rep Well A1', source: 'A1', destination: 'B1', volume: 20 },
      { name: 'Rep Well A2', source: 'A1', destination: 'B2', volume: 20 },
      { name: 'Rep Well A3', source: 'A1', destination: 'B3', volume: 20 },
    ]
  }
]

// Computed properties
const currentStep = computed(() => 
  currentStepIndex.value >= 0 ? protocol.value[currentStepIndex.value] : null
)

const progressPercentage = computed(() => {
  if (protocol.value.length === 0) return 0
  return Math.round(((currentStepIndex.value + 1) / protocol.value.length) * 100)
})

const progressStatus = computed(() => {
  if (currentStepIndex.value >= protocol.value.length - 1) return 'success'
  return undefined
})

// Convert protocol builder steps to scheduled tasks for Gantt chart
const protocolScheduledTasks = computed((): ScheduledTask[] => {
  let currentTime = 0
  return currentProtocol.value.steps.map((step, index) => {
    const startTime = currentTime
    const duration = step.duration
    currentTime += duration
    return {
      id: step.id,
      workflowId: 'builder-protocol-1',
      workflowName: currentProtocol.value.name,
      workflowPriority: 1,
      laneId: 'builder-lane-1',
      laneName: 'Protocol Steps',
      stepIndex: index,
      type: step.type,
      task: step.task,
      duration: duration,
      dependencies: [],
      startTime: startTime,
      endTime: currentTime,
      nest: 0,
      instrument: step.type,
      conflict: false
    }
  })
})

// Workflows for protocol builder Gantt chart
const protocolWorkflows = computed((): Workflow[] => [{
  id: 'builder-protocol-1',
  name: currentProtocol.value.name,
  priority: 1,
  isEditingName: false,
  editName: '',
  lanes: [
    { 
      id: 'builder-lane-1', 
      name: 'Protocol Steps', 
      steps: [],
      isEditingName: false,
      editName: ''
    }
  ]
}])

// Metrics calculation
const metrics = computed((): Metrics => ({
  totalTime: Math.ceil(protocol.value.length * 2.5),
  conflicts: 0,
  utilization: protocol.value.length > 0 ? 75 : 0
}))

const previousMetrics = ref<Metrics | undefined>(undefined)

// Methods
const toggleRun = () => {
  if (protocol.value.length === 0) {
    ElNotification({
      title: 'No Protocol',
      message: 'Please load a protocol first',
      type: 'warning'
    })
    return
  }
  
  isRunning.value = !isRunning.value
  
  if (isRunning.value && currentStepIndex.value === -1) {
    currentStepIndex.value = 0
  }
}

const reset = () => {
  isRunning.value = false
  currentStepIndex.value = -1
  currentTransfer.value = null
  
  // Reset volumes
  deckPositions.value.forEach(pos => {
    if (pos.labware) {
      if (pos.labware.id === 'waste') {
        pos.labware.currentVolume = 0
      } else if (pos.labware.maxVolume) {
        pos.labware.currentVolume = pos.labware.maxVolume
      }
    }
  })
}

const loadProtocol = (preset: LiquidHandlerProtocol) => {
  protocol.value = [...preset.steps]
  showProtocolModal.value = false
  reset()
  
  ElNotification({
    title: 'Protocol Loaded',
    message: `${preset.name} loaded successfully`,
    type: 'success'
  })
}

const handleDragStart = (event: DragEvent, item: LabwareItem) => {
  draggedLabware.value = item
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const handleDrop = (event: DragEvent, position: DeckPosition) => {
  event.preventDefault()
  
  if (draggedLabware.value && !position.labware) {
    position.labware = { ...draggedLabware.value }
    
    ElNotification({
      title: 'Labware Placed',
      message: `${draggedLabware.value.name} placed at ${position.label}`,
      type: 'success'
    })
  }
  
  draggedLabware.value = null
}

// Mobile device detection
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768 || 'ontouchstart' in window
}

// Mobile labware selection state
const pendingLabware = ref<LabwareItem | null>(null)

const handleMobileLabwareSelect = (labware: LabwareItem) => {
  if (isMobile.value) {
    // On mobile, store pending labware and ask user to select position
    pendingLabware.value = labware
    showMobileLabwareDrawer.value = false
    ElNotification({
      title: 'Labware Selected',
      message: `Tap a deck position to place ${labware.name}`,
      type: 'info',
      duration: 3000
    })
  } else {
    // Desktop: use first empty position
    const emptyPosition = deckPositions.value.find(pos => !pos.labware)
    if (emptyPosition) {
      emptyPosition.labware = { ...labware }
      showMobileLabwareDrawer.value = false
      ElNotification({
        title: 'Labware Placed',
        message: `${labware.name} placed at ${emptyPosition.label}`,
        type: 'success'
      })
    } else {
      ElNotification({
        title: 'No Empty Positions',
        message: 'All deck positions are occupied',
        type: 'warning'
      })
    }
  }
}

// Mobile touch handling for deck positions
let touchStartTime = 0
const handlePositionTouchStart = (event: TouchEvent, position: DeckPosition) => {
  touchStartTime = Date.now()
  event.preventDefault()
}

const handlePositionTouchEnd = (event: TouchEvent, position: DeckPosition) => {
  const touchDuration = Date.now() - touchStartTime
  if (touchDuration < 500) { // Quick tap
    handlePositionClick(position)
  }
  event.preventDefault()
}

// Position click handler for mobile and desktop
const handlePositionClick = (position: DeckPosition) => {
  if (pendingLabware.value && !position.labware) {
    // Place pending labware
    position.labware = { ...pendingLabware.value }
    ElNotification({
      title: 'Labware Placed',
      message: `${pendingLabware.value.name} placed at ${position.label}`,
      type: 'success'
    })
    pendingLabware.value = null
  } else if (position.labware && !pendingLabware.value) {
    // Remove existing labware on click/tap
    const labwareName = position.labware.name
    position.labware = null
    ElNotification({
      title: 'Labware Removed',
      message: `${labwareName} removed from ${position.label}`,
      type: 'info'
    })
  } else if (pendingLabware.value && position.labware) {
    ElNotification({
      title: 'Position Occupied',
      message: `${position.label} already has labware. Remove it first.`,
      type: 'warning'
    })
  }
}

const handleTaskClick = (task: ScheduledTask) => {
  console.log('Task clicked:', task)
}

const handleMetricClick = (metric: string) => {
  console.log('Metric clicked:', metric)
}

// Protocol Builder Event Handlers
const handleAddStep = (stepData: Omit<LiquidHandlerStep, 'id'>) => {
  addStep(stepData)
  validateProtocol()
}

const handleEditStep = (stepId: string, updates: Partial<LiquidHandlerStep>) => {
  editStep(stepId, updates)
  validateProtocol()
}

const handleRemoveStep = (stepId: string) => {
  removeStep(stepId)
  validateProtocol()
}

const handleMoveStep = (fromIndex: number, toIndex: number) => {
  moveStep(fromIndex, toIndex)
  validateProtocol()
}

const handleClearProtocol = () => {
  clearProtocol()
  validateProtocol()
}

const handleUndo = () => {
  undo()
  validateProtocol()
}

const handleRedo = () => {
  redo()
  validateProtocol()
}

const handleStepSelected = (stepIndex: number) => {
  selectedStepIndex.value = stepIndex
}

// Keyboard shortcuts for undo/redo
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === 'z' && !event.shiftKey && canUndo.value) {
      event.preventDefault()
      handleUndo()
    } else if ((event.key === 'y' || (event.key === 'z' && event.shiftKey)) && canRedo.value) {
      event.preventDefault()
      handleRedo()
    }
  }
}

// Initialize with default labware
onMounted(() => {
  checkMobile()
  
  if (labwareTypes[0]) {
    deckPositions.value[0].labware = { ...labwareTypes[0] }
  }
  if (labwareTypes[2]) {
    deckPositions.value[3].labware = { ...labwareTypes[2] }
  }
  if (labwareTypes[0]) {
    deckPositions.value[4].labware = { ...labwareTypes[0] }
  }
  
  // Load protocol state from localStorage
  loadProtocolState()
  
  // Set up keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', checkMobile)
  
  // Validate on mount
  validateProtocol()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* CSS Variables for theming */
.liquid-handler-visualizer {
  padding: 1rem;
  --el-color-primary: var(--primary-color);
  --el-color-success: var(--success-color);
  --el-color-warning: var(--warning-color);
  --el-color-danger: var(--error-color);
}

/* Enhanced Card Styling */
.main-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

.main-card :deep(.el-card__header) {
  background: var(--section-bg);
  border-bottom-color: var(--border-color);
}

.header-content h3 {
  margin: 0;
  color: var(--text-color);
}

.subtitle {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.status-indicators {
  display: flex;
  gap: 0.5rem;
}

/* Tabs Styling */
.demo-tabs :deep(.el-tabs__nav-wrap) {
  background: var(--section-bg);
  border-radius: 0.5rem 0.5rem 0 0;
}

.demo-tabs :deep(.el-tabs__item) {
  color: var(--text-light);
}

.demo-tabs :deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

.visualization-area {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-bottom: 2rem;
}

.deck-container {
  position: relative;
}

.deck-container h4,
.labware-palette h4 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.deck-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
  padding: 2rem;
  background: var(--card-bg);
  border-radius: 0.5rem;
  position: relative;
  min-height: 400px;
}

.deck-position {
  border: 2px dashed var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  min-height: 150px;
}

.deck-position.occupied {
  border-style: solid;
  border-color: var(--primary-color);
  background: rgba(var(--primary-rgb, 74, 144, 226), 0.1);
}

.deck-position.source {
  border-color: var(--success-color);
  background: rgba(var(--success-rgb, 16, 185, 129), 0.1);
}

.deck-position.destination {
  border-color: var(--warning-color);
  background: rgba(var(--warning-rgb, 245, 158, 11), 0.1);
}

.deck-position.mobile-selectable {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s ease;
}

.deck-position.mobile-selectable:active {
  transform: scale(0.95);
}

.deck-position.pending {
  border-color: var(--primary-color);
  background: rgba(var(--primary-rgb, 74, 144, 226), 0.2);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .deck-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .deck-position {
    min-height: 120px;
    padding: 0.75rem;
  }
  
  .deck-position.mobile-selectable {
    border-width: 3px;
  }
  
  .position-label {
    font-size: 0.9rem;
  }
  
  .labware i {
    font-size: 1.5rem;
  }
  
  .labware span {
    font-size: 0.8rem;
  }
  
  .volume-indicator {
    font-size: 0.7rem;
  }
}

.position-label {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 600;
}

.labware {
  text-align: center;
}

.labware i {
  font-size: 2rem;
  color: var(--primary-color);
  display: block;
  margin-bottom: 0.5rem;
}

.labware span {
  font-size: 0.9rem;
  color: var(--text-color);
}

.volume-indicator {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.5rem;
}

.labware-palette {
  background: var(--card-bg);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.labware-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.labware-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 0.5rem;
  cursor: grab;
  transition: all 0.3s ease;
}

.labware-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  background: var(--hover-bg);
}

.labware-item i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.progress-overview {
  margin-top: 1.5rem;
}

.protocol-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.protocol-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.protocol-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  background: var(--hover-bg);
}

.protocol-card h4 {
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.protocol-card p {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* Mobile visibility classes */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

.mobile-labware-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .liquid-handler-visualizer {
    padding: 0.5rem;
  }
  
  .visualization-area {
    grid-template-columns: 1fr;
  }
  
  .deck-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
}

/* Element Plus customizations */
.liquid-handler-visualizer :deep(.el-button) {
  border-color: var(--border-color);
}

.liquid-handler-visualizer :deep(.el-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.liquid-handler-visualizer :deep(.el-drawer__body) {
  padding: 1rem;
  background: var(--card-bg);
}

.liquid-handler-visualizer :deep(.el-drawer__header) {
  background: var(--section-bg);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

/* Theme compatibility */
.liquid-handler-visualizer {
  --primary-rgb: var(--primary-color-rgb, 74, 144, 226);
  --success-rgb: 16, 185, 129;
  --warning-rgb: 245, 158, 11;
  --error-rgb: 239, 68, 68;
}

/* Smooth theme transitions */
.liquid-handler-visualizer,
.liquid-handler-visualizer * {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease, 
              color 0.3s ease;
}
</style>