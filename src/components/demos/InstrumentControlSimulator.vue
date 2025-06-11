<template>
  <div class="instrument-control-simulator">
    <el-card shadow="hover">
      <template #header>
        <h3>Laboratory Instrument Control</h3>
        <p class="subtitle">Real-time monitoring and control of laboratory instruments</p>
      </template>

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
              >
                <i class="el-icon-video-play"></i> Start
              </el-button>
              <el-button 
                type="danger" 
                @click="stopInstrument"
                :disabled="selectedInstrument.status !== 'running'"
              >
                <i class="el-icon-video-pause"></i> Stop
              </el-button>
              <el-button @click="resetInstrument">
                <i class="el-icon-refresh"></i> Reset
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
                :min="selectedInstrument.tempRange[0]"
                :max="selectedInstrument.tempRange[1]"
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElNotification } from 'element-plus'

// State
const selectedInstrument = ref(null)
const selectedMethod = ref('')
const eventLog = ref([])
const dataHistory = ref([])
const chartInstance = ref(null)
const chartCanvas = ref(null)

// Control values
const controlValues = reactive({
  temperature: 25,
  speed: 0,
  pressure: 0,
  runTime: 30
})

// Instruments data
const instruments = ref([
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
      { id: 'protein_quant', name: 'Protein Quantification', wavelength: 280 },
      { id: 'dna_quant', name: 'DNA Quantification', wavelength: 260 },
      { id: 'bradford', name: 'Bradford Assay', wavelength: 595 }
    ]
  }
])

// Temperature marks for slider
const temperatureMarks = computed(() => {
  if (!selectedInstrument.value) return {}
  const range = selectedInstrument.value.tempRange
  return {
    [range[0]]: `${range[0]}°C`,
    [range[1]]: `${range[1]}°C`
  }
})

// Methods
const selectInstrument = (instrument) => {
  selectedInstrument.value = instrument
  selectedMethod.value = ''
  
  // Update control values to match instrument
  if (instrument.temperature) controlValues.temperature = instrument.temperature
  if (instrument.speed) controlValues.speed = instrument.speed
  if (instrument.pressure) controlValues.pressure = instrument.pressure
  
  addEvent(`Selected ${instrument.name}`, 'info')
}

const getStatusType = (status) => {
  const types = {
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
  
  const method = selectedInstrument.value.methods.find(m => m.id === selectedMethod.value)
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

const addEvent = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  eventLog.value.unshift({ timestamp, message, type })
  
  // Keep only last 10 events
  if (eventLog.value.length > 10) {
    eventLog.value.pop()
  }
}

// Data collection simulation
let dataInterval = null

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
  padding: 1rem;
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
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.instrument-card:hover {
  transform: translateY(-4px);
}

.instrument-card.active {
  border: 2px solid var(--primary);
}

.instrument-card.running::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--success);
  animation: pulse 2s ease-in-out infinite;
}

.instrument-card.error::before {
  background: var(--danger);
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
  color: var(--primary);
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
  background: var(--text-light);
}

.status-indicator.idle {
  background: var(--text-light);
}

.status-indicator.running {
  background: var(--success);
  animation: blink 1s ease-in-out infinite;
}

.status-indicator.error {
  background: var(--danger);
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
  color: var(--primary);
}

.control-panel {
  background: var(--card-bg);
  border-radius: 0.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.control-panel h4 {
  margin-bottom: 1.5rem;
  color: var(--text);
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
  color: var(--text);
}

.method-selection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.method-selection label {
  font-weight: 500;
  color: var(--text);
}

.data-visualization {
  background: var(--card-bg);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.data-visualization h4 {
  margin-bottom: 1rem;
  color: var(--text);
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
  color: var(--text);
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
  border-left: 3px solid var(--border);
}

.log-entry.success {
  border-left-color: var(--success);
}

.log-entry.warning {
  border-left-color: var(--warning);
}

.log-entry.error {
  border-left-color: var(--danger);
}

.log-entry.info {
  border-left-color: var(--primary);
}

.timestamp {
  color: var(--text-light);
  font-family: monospace;
  white-space: nowrap;
}

.message {
  flex: 1;
  color: var(--text);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .instrument-grid {
    grid-template-columns: 1fr;
  }
  
  .instrument-metrics {
    flex-wrap: wrap;
  }
  
  .control-panel {
    padding: 1rem;
  }
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
</style>