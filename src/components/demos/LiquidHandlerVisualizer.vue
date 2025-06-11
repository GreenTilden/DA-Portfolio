<template>
  <div class="liquid-handler-visualizer">
    <el-card shadow="hover">
      <template #header>
        <h3>Liquid Handler Control Simulator</h3>
        <p class="subtitle">Real-time control interface for liquid handling operations</p>
      </template>
      
      <!-- Control Panel -->
      <div class="control-panel">
        <el-button-group>
          <el-button 
            :type="isRunning ? 'danger' : 'primary'"
            @click="toggleRun"
            :icon="isRunning ? 'el-icon-video-pause' : 'el-icon-video-play'"
          >
            {{ isRunning ? 'Pause' : 'Run' }}
          </el-button>
          <el-button @click="reset" :disabled="isRunning">
            <i class="el-icon-refresh"></i> Reset
          </el-button>
          <el-button @click="showProtocolModal = true">
            <i class="el-icon-document"></i> Load Protocol
          </el-button>
        </el-button-group>
        
        <div class="status-indicators">
          <el-tag :type="isRunning ? 'success' : 'info'">
            {{ isRunning ? 'Running' : 'Ready' }}
          </el-tag>
          <el-tag type="warning" v-if="currentStep">
            Step {{ currentStepIndex + 1 }} / {{ protocol.length }}
          </el-tag>
        </div>
      </div>

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
                'destination': position.id === currentTransfer?.destination
              }"
              @drop="handleDrop($event, position)"
              @dragover.prevent
              @dragenter.prevent
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
          
          <!-- Animated Transfer Path -->
          <svg 
            v-if="currentTransfer && isRunning" 
            class="transfer-overlay"
            :viewBox="`0 0 ${deckWidth} ${deckHeight}`"
          >
            <defs>
              <marker 
                id="arrowhead" 
                markerWidth="10" 
                markerHeight="7" 
                refX="9" 
                refY="3.5" 
                orient="auto"
              >
                <polygon 
                  points="0 0, 10 3.5, 0 7" 
                  :fill="currentTransfer.color || 'var(--primary)'"
                />
              </marker>
            </defs>
            <path 
              :d="transferPath"
              :stroke="currentTransfer.color || 'var(--primary)'"
              stroke-width="3"
              fill="none"
              marker-end="url(#arrowhead)"
              class="transfer-path"
            />
            <circle 
              :cx="liquidPosition.x" 
              :cy="liquidPosition.y" 
              r="8"
              :fill="currentTransfer.color || 'var(--primary)'"
              class="liquid-drop"
            />
          </svg>
        </div>

        <!-- Labware Palette -->
        <div class="labware-palette">
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
      </div>

      <!-- Protocol Timeline -->
      <div class="timeline-section" v-if="protocol.length > 0">
        <h4>Protocol Timeline</h4>
        <div class="timeline">
          <div 
            v-for="(step, index) in protocol" 
            :key="index"
            class="timeline-step"
            :class="{
              'completed': index < currentStepIndex,
              'active': index === currentStepIndex,
              'pending': index > currentStepIndex
            }"
          >
            <div class="step-marker">
              <i 
                :class="[
                  index < currentStepIndex ? 'el-icon-check' : '',
                  index === currentStepIndex ? 'el-icon-loading' : '',
                  index > currentStepIndex ? 'el-icon-time' : ''
                ]"
              ></i>
            </div>
            <div class="step-content">
              <div class="step-name">{{ step.name }}</div>
              <div class="step-details">
                {{ step.volume }}µL from {{ step.source }} to {{ step.destination }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Metrics Display -->
      <div class="metrics-section">
        <h4>Transfer Metrics</h4>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <div class="metric-card">
              <div class="metric-label">Total Volume</div>
              <div class="metric-value">{{ totalVolume }} µL</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="8">
            <div class="metric-card">
              <div class="metric-label">Transfers Complete</div>
              <div class="metric-value">{{ currentStepIndex }} / {{ protocol.length }}</div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="8">
            <div class="metric-card">
              <div class="metric-label">Estimated Time</div>
              <div class="metric-value">{{ estimatedTime }} min</div>
            </div>
          </el-col>
        </el-row>
      </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElNotification } from 'element-plus'

// State
const isRunning = ref(false)
const currentStepIndex = ref(-1)
const showProtocolModal = ref(false)
const activePosition = ref(null)
const currentTransfer = ref(null)
const liquidPosition = ref({ x: 0, y: 0 })
const draggedLabware = ref(null)

// Deck configuration
const deckWidth = 800
const deckHeight = 600
const deckPositions = ref([
  { id: 'A1', label: 'A1', x: 100, y: 100, labware: null },
  { id: 'A2', label: 'A2', x: 300, y: 100, labware: null },
  { id: 'A3', label: 'A3', x: 500, y: 100, labware: null },
  { id: 'B1', label: 'B1', x: 100, y: 300, labware: null },
  { id: 'B2', label: 'B2', x: 300, y: 300, labware: null },
  { id: 'B3', label: 'B3', x: 500, y: 300, labware: null },
])

// Labware types
const labwareTypes = [
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
const protocol = ref([])
const presetProtocols = [
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
  },
  {
    id: 'reagent_addition',
    name: 'Reagent Addition',
    description: 'Add reagent to multiple wells',
    steps: [
      { name: 'Add to A1', source: 'B2', destination: 'A1', volume: 25 },
      { name: 'Add to A2', source: 'B2', destination: 'A2', volume: 25 },
      { name: 'Add to A3', source: 'B2', destination: 'A3', volume: 25 },
    ]
  }
]

// Computed properties
const currentStep = computed(() => 
  currentStepIndex.value >= 0 ? protocol.value[currentStepIndex.value] : null
)

const totalVolume = computed(() => 
  protocol.value.reduce((sum, step) => sum + step.volume, 0)
)

const estimatedTime = computed(() => 
  Math.ceil(protocol.value.length * 0.5)
)

const transferPath = computed(() => {
  if (!currentTransfer.value) return ''
  
  const source = deckPositions.value.find(p => p.id === currentTransfer.value.source)
  const dest = deckPositions.value.find(p => p.id === currentTransfer.value.destination)
  
  if (!source || !dest) return ''
  
  const midX = (source.x + dest.x) / 2
  const midY = Math.min(source.y, dest.y) - 100
  
  return `M ${source.x} ${source.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`
})

// Animation loop
let animationFrame = null
let startTime = null

const animateTransfer = (timestamp) => {
  if (!startTime) startTime = timestamp
  const progress = Math.min((timestamp - startTime) / 2000, 1) // 2 second animation
  
  if (currentTransfer.value) {
    const source = deckPositions.value.find(p => p.id === currentTransfer.value.source)
    const dest = deckPositions.value.find(p => p.id === currentTransfer.value.destination)
    
    if (source && dest) {
      const t = progress
      const midX = (source.x + dest.x) / 2
      const midY = Math.min(source.y, dest.y) - 100
      
      // Quadratic bezier calculation
      liquidPosition.value = {
        x: (1-t)*(1-t)*source.x + 2*(1-t)*t*midX + t*t*dest.x,
        y: (1-t)*(1-t)*source.y + 2*(1-t)*t*midY + t*t*dest.y
      }
    }
  }
  
  if (progress < 1 && isRunning.value) {
    animationFrame = requestAnimationFrame(animateTransfer)
  } else {
    completeCurrentStep()
  }
}

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
  
  if (isRunning.value) {
    if (currentStepIndex.value === -1) {
      currentStepIndex.value = 0
    }
    executeCurrentStep()
  } else {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
  }
}

const executeCurrentStep = () => {
  if (currentStepIndex.value >= protocol.value.length) {
    isRunning.value = false
    ElNotification({
      title: 'Protocol Complete',
      message: 'All transfers completed successfully',
      type: 'success'
    })
    return
  }
  
  const step = protocol.value[currentStepIndex.value]
  currentTransfer.value = {
    source: step.source,
    destination: step.destination,
    volume: step.volume,
    color: 'var(--primary)'
  }
  
  // Update volumes
  const sourcePos = deckPositions.value.find(p => p.id === step.source)
  const destPos = deckPositions.value.find(p => p.id === step.destination)
  
  if (sourcePos?.labware?.currentVolume !== undefined) {
    sourcePos.labware.currentVolume -= step.volume
  }
  if (destPos?.labware?.currentVolume !== undefined) {
    destPos.labware.currentVolume += step.volume
  }
  
  startTime = null
  animationFrame = requestAnimationFrame(animateTransfer)
}

const completeCurrentStep = () => {
  currentTransfer.value = null
  currentStepIndex.value++
  
  if (isRunning.value && currentStepIndex.value < protocol.value.length) {
    setTimeout(() => executeCurrentStep(), 500) // Small delay between steps
  } else if (currentStepIndex.value >= protocol.value.length) {
    isRunning.value = false
    ElNotification({
      title: 'Protocol Complete',
      message: 'All transfers completed successfully',
      type: 'success'
    })
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

const loadProtocol = (preset) => {
  protocol.value = [...preset.steps]
  showProtocolModal.value = false
  reset()
  
  ElNotification({
    title: 'Protocol Loaded',
    message: `${preset.name} loaded successfully`,
    type: 'success'
  })
}

// Drag and drop handlers
const handleDragStart = (event, labware) => {
  draggedLabware.value = labware
  event.dataTransfer.effectAllowed = 'copy'
}

const handleDrop = (event, position) => {
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

// Initialize with default labware
onMounted(() => {
  // Place some default labware
  deckPositions.value[0].labware = { ...labwareTypes[0] } // 96-well plate at A1
  deckPositions.value[3].labware = { ...labwareTypes[2] } // Reagent at B1
  deckPositions.value[4].labware = { ...labwareTypes[0] } // 96-well plate at B2
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.liquid-handler-visualizer {
  padding: 1rem;
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
.labware-palette h4,
.timeline-section h4,
.metrics-section h4 {
  margin-bottom: 1rem;
  color: var(--text);
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
  border: 2px dashed var(--border);
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
  border-color: var(--primary);
  background: rgba(var(--primary-rgb), 0.1);
}

.deck-position.source {
  border-color: var(--success);
  background: rgba(var(--success-rgb), 0.1);
}

.deck-position.destination {
  border-color: var(--warning);
  background: rgba(var(--warning-rgb), 0.1);
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
  color: var(--primary);
  display: block;
  margin-bottom: 0.5rem;
}

.labware span {
  font-size: 0.9rem;
  color: var(--text);
}

.volume-indicator {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-top: 0.5rem;
}

.transfer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.transfer-path {
  stroke-dasharray: 5 5;
  animation: dash 1s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -10;
  }
}

.liquid-drop {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
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
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 0.5rem;
  cursor: grab;
  transition: all 0.3s ease;
}

.labware-item:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.labware-item i {
  font-size: 1.5rem;
  color: var(--primary);
}

.timeline-section {
  margin-top: 2rem;
}

.timeline {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem;
  background: var(--card-bg);
  border-radius: 0.5rem;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  min-width: 200px;
  padding: 1rem;
  background: var(--bg);
  border-radius: 0.5rem;
  border: 2px solid var(--border);
  transition: all 0.3s ease;
}

.timeline-step.completed {
  border-color: var(--success);
  opacity: 0.7;
}

.timeline-step.active {
  border-color: var(--primary);
  background: rgba(var(--primary-rgb), 0.1);
}

.step-marker {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.timeline-step.completed .step-marker {
  background: var(--success);
}

.timeline-step.pending .step-marker {
  background: var(--text-light);
}

.step-content {
  flex: 1;
}

.step-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.step-details {
  font-size: 0.85rem;
  color: var(--text-light);
}

.metrics-section {
  margin-top: 2rem;
}

.metric-card {
  background: var(--card-bg);
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-label {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary);
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
  border-color: var(--primary);
}

.protocol-card h4 {
  margin-bottom: 0.5rem;
  color: var(--text);
}

.protocol-card p {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .visualization-area {
    grid-template-columns: 1fr;
  }
  
  .deck-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .labware-palette {
    order: -1;
  }
  
  .timeline {
    flex-direction: column;
  }
  
  .timeline-step {
    min-width: 100%;
  }
}

/* Theme compatibility */
:root {
  --primary-rgb: 74, 144, 226;
  --success-rgb: 76, 175, 80;
  --warning-rgb: 255, 152, 0;
}
</style>