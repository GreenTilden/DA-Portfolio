<template>
  <div class="instrument-control-simulator">
    <!-- Streamlined Header -->
    <header class="optimizer-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">Laboratory Instrument Control</h1>
          <p class="page-description">Real-time monitoring and control of laboratory instruments</p>
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
              title="Instrument Configuration"
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

    <div class="main-content">
      <!-- Instrument Selection and Status -->
      <div class="instrument-grid">
        <el-card 
          v-for="instrument in instruments" 
          :key="instrument.id"
          class="instrument-card"
          :class="{ 
            'active': selectedInstrument?.id === instrument.id,
            'running': instrument.status === 'running',
            'error': instrument.status === 'error'
          }"
          @click="selectInstrument(instrument)"
          shadow="hover"
        >
          <div class="instrument-header">
            <i :class="instrument.icon" class="instrument-icon"></i>
            <h4>{{ instrument.name }}</h4>
          </div>
          
          <div class="instrument-status">
            <el-tag 
              :type="getStatusType(instrument.status)"
              size="small"
            >
              {{ instrument.status }}
            </el-tag>
            <div class="status-indicator" :class="instrument.status"></div>
          </div>
          
          <div class="instrument-metrics">
            <div class="metric" v-if="instrument.temperature">
              <i class="fas fa-thermometer-half"></i>
              <span>{{ instrument.temperature }}°C</span>
            </div>
            <div class="metric" v-if="instrument.speed">
              <i class="fas fa-tachometer-alt"></i>
              <span>{{ instrument.speed }} RPM</span>
            </div>
            <div class="metric" v-if="instrument.pressure">
              <i class="fas fa-compress-arrows-alt"></i>
              <span>{{ instrument.pressure }} PSI</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Control Panel -->
      <transition name="fade">
        <div v-if="selectedInstrument" class="control-panel">
          <h4>{{ selectedInstrument.name }} Control Panel</h4>
          
          <!-- Common Controls -->
          <div class="control-group">
            <el-button-group>
              <el-button 
                type="success" 
                @click="startInstrument"
                :disabled="selectedInstrument.status === 'running'"
                size="default"
              >
                <i class="fas fa-play"></i> Start
              </el-button>
              <el-button 
                type="danger" 
                @click="stopInstrument"
                :disabled="selectedInstrument.status !== 'running'"
                size="default"
              >
                <i class="fas fa-stop"></i> Stop
              </el-button>
              <el-button 
                @click="resetInstrument"
                size="default"
              >
                <i class="fas fa-undo"></i> Reset
              </el-button>
            </el-button-group>
          </div>

          <!-- Instrument-Specific Controls -->
          <div class="specific-controls">
            <!-- Temperature Control -->
            <div v-if="selectedInstrument.hasTemperature" class="control-item">
              <label>Temperature (°C)</label>
              <el-slider 
                v-model="controlValues.temperature"
                :min="selectedInstrument.tempRange?.[0] || 0"
                :max="selectedInstrument.tempRange?.[1] || 100"
                :marks="temperatureMarks"
                show-input
              />
            </div>

            <!-- Speed Control -->
            <div v-if="selectedInstrument.hasSpeed" class="control-item">
              <label>Speed (RPM)</label>
              <el-slider 
                v-model="controlValues.speed"
                :min="0"
                :max="selectedInstrument.maxSpeed"
                :step="100"
                show-input
              />
            </div>

            <!-- Pressure Control -->
            <div v-if="selectedInstrument.hasPressure" class="control-item">
              <label>Pressure (PSI)</label>
              <el-slider 
                v-model="controlValues.pressure"
                :min="0"
                :max="selectedInstrument.maxPressure"
                :step="5"
                show-input
              />
            </div>

            <!-- Time Control -->
            <div v-if="selectedInstrument.hasTimer" class="control-item">
              <label>Run Time (minutes)</label>
              <el-input-number 
                v-model="controlValues.runTime"
                :min="1"
                :max="1440"
                :step="1"
              />
            </div>
          </div>

          <!-- Method/Protocol Selection -->
          <div v-if="selectedInstrument.methods" class="method-selection">
            <label>Select Method</label>
            <el-select 
              v-model="selectedMethod"
              placeholder="Choose a method"
              @change="applyMethod"
            >
              <el-option
                v-for="method in selectedInstrument.methods"
                :key="method.id"
                :label="method.name"
                :value="method.id"
              >
                <span style="float: left">{{ method.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ method.duration }}</span>
              </el-option>
            </el-select>
          </div>
        </div>
      </transition>

      <!-- Real-time Data Visualization -->
      <div v-if="selectedInstrument && dataHistory.length > 0" class="data-visualization">
        <h4>Real-time Monitoring</h4>
        <div class="chart-container">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Event Log -->
      <div class="event-log">
        <h4>Event Log</h4>
        <div class="log-container">
          <div 
            v-for="(event, index) in eventLog" 
            :key="index"
            class="log-entry"
            :class="event.type"
          >
            <span class="timestamp">{{ event.timestamp }}</span>
            <span class="message">{{ event.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElNotification } from 'element-plus'

// Types
interface InstrumentMethod {
  id: string
  name: string
  duration?: string
  temp?: number
  speed?: number
  pressure?: number
  wavelength?: number
  cycles?: number
  co2?: number
}

interface Instrument {
  id: string
  name: string
  icon: string
  status: 'idle' | 'running' | 'error' | 'maintenance'
  temperature?: number
  speed?: number
  pressure?: number
  humidity?: number
  co2?: number
  flowRate?: number
  wavelength?: number
  absorbance?: number
  currentCycle?: number
  totalCycles?: number
  hasTemperature?: boolean
  hasSpeed?: boolean
  hasPressure?: boolean
  hasTimer?: boolean
  tempRange?: [number, number]
  maxSpeed?: number
  maxPressure?: number
  methods?: InstrumentMethod[]
}

interface EventLogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

interface DataPoint {
  timestamp: number
  value: number
}

interface ControlValues {
  temperature: number
  speed: number
  pressure: number
  runTime: number
}

// State
const selectedInstrument = ref<Instrument | null>(null)
const selectedMethod = ref<string>('')
const eventLog = ref<EventLogEntry[]>([])
const dataHistory = ref<DataPoint[]>([])
// const chartInstance = ref<any>(null) // Removed unused variable
const chartCanvas = ref<HTMLCanvasElement | null>(null)

// Control values
const controlValues = reactive<ControlValues>({
  temperature: 25,
  speed: 0,
  pressure: 0,
  runTime: 30
})

// Instruments data
const instruments = ref<Instrument[]>([
  {
    id: 'incubator',
    name: 'CO2 Incubator',
    icon: 'fas fa-temperature-high',
    status: 'idle',
    temperature: 37.0,
    humidity: 95,
    co2: 5.0,
    hasTemperature: true,
    tempRange: [4, 50],
    hasTimer: true,
    methods: [
      { id: 'cell_culture', name: 'Cell Culture', duration: '72h', temp: 37, co2: 5 },
      { id: 'heat_shock', name: 'Heat Shock', duration: '30min', temp: 42, co2: 5 }
    ]
  },
  {
    id: 'centrifuge',
    name: 'Centrifuge',
    icon: 'fas fa-sync-alt',
    status: 'idle',
    speed: 0,
    temperature: 4,
    hasSpeed: true,
    maxSpeed: 15000,
    hasTemperature: true,
    tempRange: [-20, 40],
    hasTimer: true,
    methods: [
      { id: 'cell_pellet', name: 'Cell Pelleting', duration: '5min', speed: 3000, temp: 4 },
      { id: 'dna_precip', name: 'DNA Precipitation', duration: '10min', speed: 12000, temp: 4 }
    ]
  },
  {
    id: 'shaker',
    name: 'Orbital Shaker',
    icon: 'fas fa-arrows-alt',
    status: 'running',
    speed: 150,
    temperature: 37,
    hasSpeed: true,
    maxSpeed: 500,
    hasTemperature: true,
    tempRange: [15, 60],
    hasTimer: true,
    methods: [
      { id: 'bacterial_growth', name: 'Bacterial Growth', duration: '16h', speed: 225, temp: 37 },
      { id: 'protein_expr', name: 'Protein Expression', duration: '4h', speed: 200, temp: 30 }
    ]
  },
  {
    id: 'thermocycler',
    name: 'Thermocycler',
    icon: 'fas fa-dna',
    status: 'idle',
    temperature: 25,
    currentCycle: 0,
    totalCycles: 0,
    hasTemperature: true,
    tempRange: [4, 99],
    methods: [
      { id: 'pcr_standard', name: 'Standard PCR', duration: '2h', cycles: 35 },
      { id: 'pcr_hotstart', name: 'Hot Start PCR', duration: '2.5h', cycles: 40 },
      { id: 'rt_pcr', name: 'RT-PCR', duration: '3h', cycles: 45 }
    ]
  },
  {
    id: 'hplc',
    name: 'HPLC System',
    icon: 'fas fa-chart-line',
    status: 'idle',
    pressure: 0,
    flowRate: 1.0,
    hasPressure: true,
    maxPressure: 6000,
    methods: [
      { id: 'reverse_phase', name: 'Reverse Phase', duration: '30min', pressure: 2000 },
      { id: 'size_exclusion', name: 'Size Exclusion', duration: '45min', pressure: 1000 }
    ]
  },
  {
    id: 'spectrophotometer',
    name: 'Spectrophotometer',
    icon: 'fas fa-lightbulb',
    status: 'idle',
    wavelength: 280,
    absorbance: 0,
    methods: [
      { id: 'protein_quant', name: 'Protein Quantification', duration: '5min', wavelength: 280 },
      { id: 'dna_quant', name: 'DNA Quantification', duration: '3min', wavelength: 260 },
      { id: 'bradford', name: 'Bradford Assay', duration: '10min', wavelength: 595 }
    ]
  }
])

// Temperature marks for slider
const temperatureMarks = computed(() => {
  if (!selectedInstrument.value?.tempRange) return {}
  const range = selectedInstrument.value.tempRange
  return {
    [range[0]]: `${range[0]}°C`,
    [range[1]]: `${range[1]}°C`
  }
})

// Methods
const selectInstrument = (instrument: Instrument) => {
  selectedInstrument.value = instrument
  selectedMethod.value = ''
  
  // Update control values to match instrument
  if (instrument.temperature) controlValues.temperature = instrument.temperature
  if (instrument.speed) controlValues.speed = instrument.speed
  if (instrument.pressure) controlValues.pressure = instrument.pressure
  
  addEvent(`Selected ${instrument.name}`, 'info')
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    idle: 'info',
    running: 'success',
    error: 'danger',
    maintenance: 'warning'
  }
  return types[status] || 'info'
}

const startInstrument = () => {
  if (!selectedInstrument.value) return
  
  selectedInstrument.value.status = 'running'
  
  // Apply control values
  if (selectedInstrument.value.hasTemperature) {
    selectedInstrument.value.temperature = controlValues.temperature
  }
  if (selectedInstrument.value.hasSpeed) {
    selectedInstrument.value.speed = controlValues.speed
  }
  if (selectedInstrument.value.hasPressure) {
    selectedInstrument.value.pressure = controlValues.pressure
  }
  
  addEvent(`Started ${selectedInstrument.value.name}`, 'success')
  
  ElNotification({
    title: 'Instrument Started',
    message: `${selectedInstrument.value.name} is now running`,
    type: 'success'
  })
  
  // Start data collection
  startDataCollection()
}

const stopInstrument = () => {
  if (!selectedInstrument.value) return
  
  selectedInstrument.value.status = 'idle'
  if (selectedInstrument.value.hasSpeed) {
    selectedInstrument.value.speed = 0
  }
  
  addEvent(`Stopped ${selectedInstrument.value.name}`, 'warning')
  
  ElNotification({
    title: 'Instrument Stopped',
    message: `${selectedInstrument.value.name} has been stopped`,
    type: 'warning'
  })
}

const resetInstrument = () => {
  if (!selectedInstrument.value) return
  
  selectedInstrument.value.status = 'idle'
  
  // Reset to defaults
  if (selectedInstrument.value.id === 'incubator') {
    selectedInstrument.value.temperature = 37
    controlValues.temperature = 37
  } else if (selectedInstrument.value.hasTemperature) {
    selectedInstrument.value.temperature = 25
    controlValues.temperature = 25
  }
  
  if (selectedInstrument.value.hasSpeed) {
    selectedInstrument.value.speed = 0
    controlValues.speed = 0
  }
  
  if (selectedInstrument.value.hasPressure) {
    selectedInstrument.value.pressure = 0
    controlValues.pressure = 0
  }
  
  dataHistory.value = []
  
  addEvent(`Reset ${selectedInstrument.value.name}`, 'info')
}

const applyMethod = () => {
  if (!selectedInstrument.value || !selectedMethod.value) return
  
  const method = selectedInstrument.value.methods?.find(m => m.id === selectedMethod.value)
  if (!method) return
  
  // Apply method parameters
  if (method.temp !== undefined) {
    controlValues.temperature = method.temp
  }
  if (method.speed !== undefined) {
    controlValues.speed = method.speed
  }
  if (method.pressure !== undefined) {
    controlValues.pressure = method.pressure
  }
  
  addEvent(`Applied method: ${method.name}`, 'success')
  
  ElNotification({
    title: 'Method Applied',
    message: `${method.name} parameters loaded`,
    type: 'success'
  })
}

const addEvent = (message: string, type: EventLogEntry['type'] = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  eventLog.value.unshift({ timestamp, message, type })
  
  // Keep only last 10 events
  if (eventLog.value.length > 10) {
    eventLog.value.pop()
  }
}

// Data collection simulation
let dataInterval: ReturnType<typeof setInterval> | null = null

const startDataCollection = () => {
  if (dataInterval) clearInterval(dataInterval)
  
  dataInterval = setInterval(() => {
    if (selectedInstrument.value?.status === 'running') {
      const timestamp = Date.now()
      let value = 0
      
      // Generate realistic data based on instrument type
      if (selectedInstrument.value.hasTemperature) {
        // Add slight fluctuation to temperature
        value = controlValues.temperature + (Math.random() - 0.5) * 0.2
        selectedInstrument.value.temperature = Math.round(value * 10) / 10
      } else if (selectedInstrument.value.hasSpeed) {
        // Add slight fluctuation to speed
        value = controlValues.speed + (Math.random() - 0.5) * 10
        selectedInstrument.value.speed = Math.round(value)
      } else if (selectedInstrument.value.hasPressure) {
        // Add slight fluctuation to pressure
        value = controlValues.pressure + (Math.random() - 0.5) * 5
        selectedInstrument.value.pressure = Math.round(value)
      }
      
      dataHistory.value.push({ timestamp, value })
      
      // Keep only last 50 data points
      if (dataHistory.value.length > 50) {
        dataHistory.value.shift()
      }
      
      updateChart()
    }
  }, 1000)
}

const updateChart = () => {
  // Chart implementation would go here
  // For now, just log the data
  console.log('Chart update:', dataHistory.value.length, 'points')
}

// Simulate some initial activity
onMounted(() => {
  // Add some initial events
  addEvent('System initialized', 'success')
  addEvent('All instruments connected', 'info')
  
  // Simulate the shaker already running
  setTimeout(() => {
    addEvent('Orbital Shaker running bacterial growth protocol', 'info')
  }, 1000)
})

onUnmounted(() => {
  if (dataInterval) {
    clearInterval(dataInterval)
  }
})

// Watch for control value changes while running
watch(() => controlValues.temperature, (newVal) => {
  if (selectedInstrument.value?.status === 'running' && selectedInstrument.value.hasTemperature) {
    selectedInstrument.value.temperature = newVal
    addEvent(`Temperature set to ${newVal}°C`, 'info')
  }
})

watch(() => controlValues.speed, (newVal) => {
  if (selectedInstrument.value?.status === 'running' && selectedInstrument.value.hasSpeed) {
    selectedInstrument.value.speed = newVal
    addEvent(`Speed set to ${newVal} RPM`, 'info')
  }
})

watch(() => controlValues.pressure, (newVal) => {
  if (selectedInstrument.value?.status === 'running' && selectedInstrument.value.hasPressure) {
    selectedInstrument.value.pressure = newVal
    addEvent(`Pressure set to ${newVal} PSI`, 'info')
  }
})
</script>

<style scoped>
.instrument-control-simulator {
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

.main-content {
  background: var(--card-bg);
  border-color: var(--border-color);
  margin: 0 auto;
  max-width: 1400px;
  margin-top: 0;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-bottom: none;
  padding: 2rem;
}

.subtitle {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.instrument-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.instrument-card {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.instrument-card:hover {
  transform: translateY(-4px);
}

.instrument-card.active {
  border: 2px solid var(--primary-color);
  background: var(--hover-bg);
}

.instrument-card.running::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--success-color);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.instrument-card.error::before {
  background: var(--error-color);
  animation: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.instrument-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.instrument-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.instrument-header h4 {
  margin: 0;
  flex: 1;
}

.instrument-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-muted);
}

.status-indicator.idle {
  background: var(--text-muted);
}

.status-indicator.running {
  background: var(--success-color);
  animation: blink 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.status-indicator.error {
  background: var(--error-color);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.instrument-metrics {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-light);
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metric i {
  color: var(--primary-color);
}

.control-panel {
  background: var(--card-bg);
  border-radius: 0.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.control-panel h4 {
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.control-group {
  margin-bottom: 2rem;
}

.specific-controls {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-item label {
  font-weight: 500;
  color: var(--text-color);
}

.method-selection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.method-selection label {
  font-weight: 500;
  color: var(--text-color);
}

.data-visualization {
  background: var(--card-bg);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.data-visualization h4 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.chart-container {
  height: 300px;
  background: var(--bg);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
}

.event-log {
  background: var(--card-bg);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.event-log h4 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-entry {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 0.25rem;
  font-size: 0.9rem;
  border-left: 3px solid var(--border-color);
}

.log-entry.success {
  border-left-color: var(--success-color);
}

.log-entry.warning {
  border-left-color: var(--warning-color);
}

.log-entry.error {
  border-left-color: var(--error-color);
}

.log-entry.info {
  border-left-color: var(--primary-color);
}

.timestamp {
  color: var(--text-light);
  font-family: monospace;
  white-space: nowrap;
}

.message {
  flex: 1;
  color: var(--text-color);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
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
  
  .main-content {
    padding: 1rem;
  }
  
  .instrument-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .instrument-card {
    min-height: 120px;
    padding: 1rem;
  }
  
  .instrument-metrics {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .control-panel {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .specific-controls {
    gap: 1rem;
  }
  
  .control-item {
    gap: 0.75rem;
  }
  
  .log-container {
    max-height: 200px;
  }
  
  .log-entry {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
  
  .chart-container {
    height: 200px;
  }
  
  /* Touch-friendly button sizing */
  .el-button {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
  
  .el-slider {
    margin: 1rem 0;
  }
}

/* Element Plus customizations */
.instrument-control-simulator :deep(.el-button) {
  border-color: var(--border-color);
}

.instrument-control-simulator :deep(.el-button--primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.instrument-control-simulator :deep(.el-card) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
}

.instrument-control-simulator :deep(.el-tag) {
  border-color: var(--border-color);
}

/* Theme variables for Element Plus components */
.el-slider {
  margin-top: 1rem;
}

.el-input-number {
  width: 100%;
}

.el-select {
  width: 100%;
}

/* Theme compatibility */
.instrument-control-simulator {
  --primary-rgb: var(--primary-color-rgb, 74, 144, 226);
  --success-rgb: 16, 185, 129;
  --warning-rgb: 245, 158, 11;
  --error-rgb: 239, 68, 68;
}

/* Smooth theme transitions */
.instrument-control-simulator,
.instrument-control-simulator * {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>