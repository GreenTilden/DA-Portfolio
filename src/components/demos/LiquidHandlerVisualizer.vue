<template>
  <div class="liquid-handler-visualizer">
    <!-- Streamlined Header -->
    <header class="optimizer-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">Liquid Handler Control Simulator</h1>
          <p class="page-description">Real-time control interface for liquid handling operations</p>
        </div>
        <div class="header-controls">
          <div class="header-actions">
            <el-button 
              class="control-btn help-btn" 
              title="Help & Instructions"
              type="info"
              size="default"
              circle
            >
              <i class="fas fa-question-circle"></i>
            </el-button>
            <el-button 
              class="control-btn config-btn" 
              title="Protocol Configuration"
              type="info"
              size="default"
              circle
            >
              <i class="fas fa-cog"></i>
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <el-card shadow="hover" class="main-card" v-loading="isLoadingProtocol">
      
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
                  @touchstart="handlePositionTouchStart($event)"
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
          <div class="protocol-builder-placeholder">
            <el-empty description="Protocol Builder Coming Soon">
              <el-button type="primary" @click="loadProtocol(presetProtocols[0])">
                Load Example Protocol
              </el-button>
            </el-empty>
          </div>
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
      :close-on-click-modal="false"
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
import type { ScheduledTask, Workflow, Metrics } from '@/types/workflow'
import type { 
  LabwareItem, 
  DeckPosition, 
  TransferStep, 
  LiquidHandlerProtocol
} from '@/types/liquidHandler'

// Protocol builder state (simplified for demo)
interface DemoProtocol {
  id: string
  name: string
  description: string
  steps: any[]
  created: Date
  modified: Date
}

const currentProtocol = ref<DemoProtocol>({
  id: 'demo-protocol-1',
  name: 'Demo Protocol',
  description: 'Example liquid handling protocol',
  steps: [],
  created: new Date(),
  modified: new Date()
})

// State
const isRunning = ref(false)
const currentStepIndex = ref(-1)
const showProtocolModal = ref(false)
const activePosition = ref(null)
const currentTransfer = ref<{ source?: string; destination?: string } | null>(null)
const draggedLabware = ref<LabwareItem | null>(null)
const activeTab = ref('deck')
const showMobileLabwareDrawer = ref(false)
const isLoadingProtocol = ref(false)
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
  // Prevent infinite loops by checking if we have valid steps
  if (!currentProtocol.value?.steps || currentProtocol.value.steps.length === 0) {
    return []
  }
  
  let currentTime = 0
  return currentProtocol.value.steps.map((step, index) => {
    const startTime = currentTime
    const duration = step.duration || 1 // Ensure duration is always positive
    currentTime += duration
    return {
      id: step.id || `step-${index}`,
      workflowId: 'builder-protocol-1',
      workflowName: currentProtocol.value?.name || 'Protocol',
      workflowPriority: 1,
      laneId: 'builder-lane-1',
      laneName: 'Protocol Steps',
      stepIndex: index,
      type: 'Liquid Handler',
      task: step.task || 'Step',
      duration: duration,
      dependencies: [],
      startTime: startTime,
      endTime: currentTime,
      nest: 0,
      instrument: 'Liquid Handler',
      conflict: false
    }
  })
})

// Workflows for protocol builder Gantt chart
const protocolWorkflows = computed((): Workflow[] => {
  // Return empty array if no protocol exists
  if (!currentProtocol.value) {
    return []
  }
  
  return [{
    id: 'builder-protocol-1',
    name: currentProtocol.value?.name || 'Protocol',
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
  }]
})

// Metrics calculation
const metrics = computed((): Metrics => {
  const steps = currentProtocol.value?.steps || []
  const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0)
  
  return {
    totalTime: totalDuration,
    conflicts: 0,
    utilization: steps.length > 0 ? Math.min(75, steps.length * 10) : 0
  }
})

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

const loadProtocol = async (preset: LiquidHandlerProtocol) => {
  isLoadingProtocol.value = true
  
  // Simulate async loading
  await new Promise(resolve => setTimeout(resolve, 300))
  
  protocol.value = [...preset.steps]
  // Also update the protocol builder state
  currentProtocol.value = {
    id: preset.id,
    name: preset.name,
    description: preset.description,
    steps: preset.steps.map(step => ({
      id: `step-${Date.now()}-${Math.random()}`,
      task: step.name,
      type: 'Liquid Handler',
      duration: 1,
      source: step.source,
      destination: step.destination,
      volume: step.volume
    })),
    created: new Date(),
    modified: new Date()
  }
  showProtocolModal.value = false
  reset()
  
  isLoadingProtocol.value = false
  
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
const handlePositionTouchStart = (event: TouchEvent) => {
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
  // Show task details in a notification
  ElNotification({
    title: task.task,
    message: `${task.type} - ${task.duration} minutes`,
    type: 'info',
    duration: 3000
  })
}

const handleMetricClick = (metric: string) => {
  // Show metric details
  ElNotification({
    title: 'Metric Details',
    message: `Viewing details for: ${metric}`,
    type: 'info',
    duration: 3000
  })
}

// Placeholder for future protocol step management

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
  
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* CSS Variables for theming */
.liquid-handler-visualizer {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  position: relative;
  --el-color-primary: var(--primary-color);
  --el-color-success: var(--success-color);
  --el-color-warning: var(--warning-color);
  --el-color-danger: var(--error-color);
}

/* Header styles */
.optimizer-header {
  background: linear-gradient(135deg, var(--section-bg) 0%, var(--background-alt) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 2rem;
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
}

.header-main {
  flex: 1;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-light);
  line-height: 1.2;
}

.page-description {
  margin: 0;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.5;
  max-width: 500px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
}

.control-btn:hover {
  background: var(--hover-bg);
  color: var(--text-light);
  border-color: var(--primary-color);
}

/* Enhanced Card Styling */
.main-card {
  background: var(--card-bg);
  border-color: var(--border-color);
  margin: 0 auto;
  max-width: 1400px;
  margin-top: 0;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
}

.main-card :deep(.el-card__body) {
  padding: 2rem;
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
.demo-tabs {
  background: var(--section-bg);
  border-bottom: 1px solid var(--border-color);
  margin: -2rem -2rem 2rem -2rem;
}

.demo-tabs :deep(.el-tabs__nav-wrap) {
  background: var(--section-bg);
  padding: 0 2rem;
}

.demo-tabs :deep(.el-tabs__item) {
  color: var(--text-muted);
  padding: 1rem 0;
  margin-right: 2rem;
}

.demo-tabs :deep(.el-tabs__item.is-active) {
  color: var(--primary-color);
}

.demo-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.demo-tabs :deep(.el-tab-pane) {
  padding: 0;
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.deck-position.mobile-selectable:active {
  transform: scale(0.95);
}

.deck-position.pending {
  border-color: var(--primary-color);
  background: rgba(var(--primary-rgb, 74, 144, 226), 0.2);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
  .optimizer-header {
    padding: 1.5rem 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .header-main {
    text-align: center;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .header-controls {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .main-card :deep(.el-card__body) {
    padding: 1rem;
  }
  
  .demo-tabs :deep(.el-tabs__nav-wrap) {
    padding: 0 1rem;
    justify-content: center;
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
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Protocol Builder Placeholder */
.protocol-builder-placeholder {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--section-bg);
  border-radius: 0.5rem;
  padding: 2rem;
}

.protocol-builder-placeholder :deep(.el-empty__description) {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin-top: 1rem;
}
</style>