<template>
  <div class="cell-imaging-scheduler">
    <!-- Streamlined Header -->
    <header class="optimizer-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">Cell Imaging & Hit Picking Scheduler</h1>
          <p class="page-description">Intelligent scheduling for high-throughput screening workflows with automated hit determination</p>
        </div>
        <div class="header-controls">
          <div class="header-actions">
            <el-button class="control-btn help-btn" type="info" size="default" circle @click="showHelp = true">
              <i class="fas fa-question-circle"></i>
            </el-button>
            <el-button class="control-btn config-btn" type="info" size="default" circle @click="showConfig = true">
              <i class="fas fa-cog"></i>
            </el-button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="demo-content">
      <div class="content-container">
        <!-- Control Panel -->
        <el-row :gutter="20">
          <el-col :xs="24" :lg="8">
            <el-card class="control-panel" shadow="hover">
              <template #header>
                <div class="card-header">
                  <i class="fas fa-sliders-h"></i>
                  <span>Screening Configuration</span>
                </div>
              </template>
              
              <el-form label-position="top" :model="screeningConfig">
                <el-form-item label="Plate Count">
                  <el-input-number 
                    v-model="screeningConfig.plateCount" 
                    :min="1" 
                    :max="100" 
                    @change="updateSchedule"
                  />
                </el-form-item>
                
                <el-form-item label="Imaging Time (min/plate)">
                  <el-input-number 
                    v-model="screeningConfig.imagingTime" 
                    :min="5" 
                    :max="60" 
                    @change="updateSchedule"
                  />
                </el-form-item>
                
                <el-form-item label="Hit Determination Threshold">
                  <el-slider 
                    v-model="screeningConfig.hitThreshold" 
                    :min="1" 
                    :max="10" 
                    show-stops 
                    @change="updateSchedule"
                  />
                </el-form-item>
                
                <el-form-item label="Priority Samples">
                  <el-switch v-model="screeningConfig.priorityMode" @change="updateSchedule"/>
                </el-form-item>
                
                <el-form-item>
                  <el-button 
                    type="primary" 
                    @click="runOptimization" 
                    :loading="isOptimizing"
                    style="width: 100%"
                  >
                    <i class="fas fa-play"></i>
                    Optimize Schedule
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :lg="16">
            <!-- Schedule Visualization -->
            <el-card class="schedule-card" shadow="hover">
              <template #header>
                <div class="card-header">
                  <i class="fas fa-calendar-alt"></i>
                  <span>Optimized Schedule</span>
                  <div class="header-actions">
                    <el-tag :type="scheduleStatus === 'optimal' ? 'success' : 'warning'" size="small">
                      {{ scheduleStatusText }}
                    </el-tag>
                  </div>
                </div>
              </template>
              
              <div class="schedule-timeline" v-loading="isOptimizing">
                <div class="timeline-header">
                  <div class="time-labels">
                    <span v-for="hour in timeLabels" :key="hour" class="time-label">
                      {{ hour }}:00
                    </span>
                  </div>
                </div>
                
                <div class="timeline-content">
                  <div class="instrument-lane" v-for="instrument in instruments" :key="instrument.id">
                    <div class="lane-header">
                      <span class="instrument-name">{{ instrument.name }}</span>
                      <el-tag size="small" type="info">{{ instrument.type }}</el-tag>
                    </div>
                    <div class="lane-timeline">
                      <div 
                        v-for="task in getInstrumentTasks(instrument.id)" 
                        :key="task.id"
                        class="task-block"
                        :style="getTaskStyle(task)"
                        :class="getTaskClass(task)"
                      >
                        <div class="task-content">
                          <span class="task-name">{{ task.name }}</span>
                          <span class="task-duration">{{ task.duration }}m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Results & Metrics -->
        <el-row :gutter="20" style="margin-top: 2rem;">
          <el-col :xs="24" :md="8">
            <el-card class="metric-card" shadow="hover">
              <div class="metric-content">
                <div class="metric-icon throughput">
                  <i class="fas fa-tachometer-alt"></i>
                </div>
                <div class="metric-info">
                  <h3>{{ metrics.throughput }}</h3>
                  <p>Plates/Hour</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :md="8">
            <el-card class="metric-card" shadow="hover">
              <div class="metric-content">
                <div class="metric-icon utilization">
                  <i class="fas fa-chart-pie"></i>
                </div>
                <div class="metric-info">
                  <h3>{{ metrics.utilization }}%</h3>
                  <p>Instrument Utilization</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :md="8">
            <el-card class="metric-card" shadow="hover">
              <div class="metric-content">
                <div class="metric-icon time-saving">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="metric-info">
                  <h3>{{ metrics.timeSaved }}%</h3>
                  <p>Time Reduction</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Hit Determination Results -->
        <el-card class="results-card" shadow="hover" style="margin-top: 2rem;">
          <template #header>
            <div class="card-header">
              <i class="fas fa-bullseye"></i>
              <span>Hit Determination Results</span>
            </div>
          </template>
          
          <div class="results-grid">
            <div 
              v-for="plate in plateResults" 
              :key="plate.id"
              class="plate-result"
              :class="plate.status"
            >
              <div class="plate-header">
                <span class="plate-id">{{ plate.id }}</span>
                <el-tag :type="plate.status === 'hit' ? 'success' : 'info'" size="small">
                  {{ plate.status }}
                </el-tag>
              </div>
              <div class="plate-stats">
                <span>Score: {{ plate.score }}/10</span>
                <span>{{ plate.hitCount }} hits</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Navigation -->
        <div class="demo-navigation">
          <el-button type="default" @click="$router.push('/projects')">
            <i class="fas fa-arrow-left"></i>
            Back to Projects
          </el-button>
          <el-button type="primary" @click="$router.push('/demos')">
            <i class="fas fa-th-large"></i>
            View All Demos
          </el-button>
        </div>
      </div>
    </div>

    <!-- Help Dialog -->
    <el-dialog v-model="showHelp" title="Cell Imaging Scheduler Help" width="90%" max-width="700px">
      <div class="help-content">
        <h4>Overview</h4>
        <p>This scheduler optimizes high-throughput screening workflows by intelligently managing imaging resources and prioritizing hit determination.</p>
        
        <h4>Key Features:</h4>
        <ul>
          <li><strong>Automated Scheduling:</strong> Optimizes instrument utilization and minimizes bottlenecks</li>
          <li><strong>Hit Determination:</strong> Intelligent scoring system for identifying promising samples</li>
          <li><strong>Priority Handling:</strong> Fast-tracks high-priority samples through the workflow</li>
          <li><strong>Resource Management:</strong> Balances workload across available instruments</li>
        </ul>
        
        <h4>How to Use:</h4>
        <ol>
          <li>Configure your screening parameters on the left panel</li>
          <li>Click "Optimize Schedule" to generate the optimal workflow</li>
          <li>Review the timeline and hit determination results</li>
          <li>Adjust parameters as needed to meet your requirements</li>
        </ol>
      </div>
    </el-dialog>

    <!-- Config Dialog -->
    <el-dialog v-model="showConfig" title="Advanced Configuration" width="90%" max-width="600px">
      <div class="config-content">
        <el-form label-position="top">
          <el-form-item label="Simulation Speed">
            <el-slider v-model="simulationSpeed" :min="1" :max="10" show-stops></el-slider>
          </el-form-item>
          <el-form-item label="Show Detailed Metrics">
            <el-switch v-model="showDetailedMetrics"></el-switch>
          </el-form-item>
          <el-form-item label="Enable Real-time Updates">
            <el-switch v-model="realTimeUpdates"></el-switch>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElNotification } from 'element-plus'

// State
const showHelp = ref(false)
const showConfig = ref(false)
const isOptimizing = ref(false)
const simulationSpeed = ref(5)
const showDetailedMetrics = ref(true)
const realTimeUpdates = ref(false)

// Screening configuration
const screeningConfig = ref({
  plateCount: 24,
  imagingTime: 15,
  hitThreshold: 6,
  priorityMode: false
})

// Instruments
const instruments = ref([
  { id: 'imager1', name: 'High-Content Imager A', type: 'Imaging' },
  { id: 'imager2', name: 'High-Content Imager B', type: 'Imaging' },
  { id: 'picker1', name: 'Automated Picker', type: 'Hit Picking' },
  { id: 'analyzer1', name: 'Data Analyzer', type: 'Analysis' }
])

// Schedule tasks
const scheduleTasks = ref([
  { id: 'img1', instrumentId: 'imager1', name: 'Plate 1-6', startTime: 0, duration: 90, type: 'imaging', priority: 'normal' },
  { id: 'img2', instrumentId: 'imager2', name: 'Plate 7-12', startTime: 0, duration: 90, type: 'imaging', priority: 'high' },
  { id: 'pick1', instrumentId: 'picker1', name: 'Hit Picking 1-6', startTime: 100, duration: 45, type: 'picking', priority: 'normal' },
  { id: 'anal1', instrumentId: 'analyzer1', name: 'Data Analysis', startTime: 95, duration: 60, type: 'analysis', priority: 'normal' }
])

// Time labels for timeline
const timeLabels = computed(() => {
  return Array.from({ length: 8 }, (_, i) => 9 + i) // 9 AM to 4 PM
})

// Schedule status
const scheduleStatus = ref<'optimal' | 'suboptimal'>('optimal')
const scheduleStatusText = computed(() => 
  scheduleStatus.value === 'optimal' ? 'Optimized' : 'Needs Optimization'
)

// Metrics
const metrics = ref({
  throughput: 9.6,
  utilization: 87,
  timeSaved: 40
})

// Plate results
const plateResults = ref([
  { id: 'Plate-001', status: 'hit', score: 8, hitCount: 12 },
  { id: 'Plate-002', status: 'normal', score: 4, hitCount: 3 },
  { id: 'Plate-003', status: 'hit', score: 9, hitCount: 18 },
  { id: 'Plate-004', status: 'normal', score: 3, hitCount: 1 },
  { id: 'Plate-005', status: 'hit', score: 7, hitCount: 8 },
  { id: 'Plate-006', status: 'normal', score: 5, hitCount: 4 }
])

// Methods
const getInstrumentTasks = (instrumentId: string) => {
  return scheduleTasks.value.filter(task => task.instrumentId === instrumentId)
}

const getTaskStyle = (task: any) => {
  const timelineWidth = 100 // percentage
  const totalTime = 8 * 60 // 8 hours in minutes
  const left = (task.startTime / totalTime) * timelineWidth
  const width = (task.duration / totalTime) * timelineWidth
  
  return {
    left: `${left}%`,
    width: `${width}%`
  }
}

const getTaskClass = (task: any) => {
  return [
    'task-block',
    task.type,
    task.priority
  ]
}

const updateSchedule = () => {
  // Simulate schedule recalculation
  const newThroughput = (screeningConfig.value.plateCount / screeningConfig.value.imagingTime) * 60
  metrics.value.throughput = Math.round(newThroughput * 10) / 10
  
  // Update utilization based on priority mode
  if (screeningConfig.value.priorityMode) {
    metrics.value.utilization = Math.min(95, metrics.value.utilization + 8)
    metrics.value.timeSaved = Math.min(50, metrics.value.timeSaved + 5)
  } else {
    metrics.value.utilization = Math.max(70, 87)
    metrics.value.timeSaved = 40
  }
}

const runOptimization = async () => {
  isOptimizing.value = true
  
  // Simulate optimization process
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  updateSchedule()
  scheduleStatus.value = 'optimal'
  
  ElNotification({
    title: 'Optimization Complete',
    message: `Schedule optimized for ${screeningConfig.value.plateCount} plates`,
    type: 'success',
    duration: 3000
  })
  
  isOptimizing.value = false
}

// Initialize
onMounted(() => {
  updateSchedule()
})
</script>

<style scoped>
.cell-imaging-scheduler {
  min-height: 100vh;
  background: var(--bg-color);
}

/* Header styling (following demo layout standards) */
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
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--section-bg);
  color: var(--text-color);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-btn:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

/* Main content */
.demo-content {
  padding: 0 2rem 2rem;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 2rem;
}

/* Cards */
.control-panel,
.schedule-card,
.metric-card,
.results-card {
  background: var(--card-bg);
  border-color: var(--border-color);
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.card-header i {
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Schedule Timeline */
.schedule-timeline {
  height: 400px;
  position: relative;
}

.timeline-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
}

.time-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-left: 200px; /* Account for instrument names */
}

.timeline-content {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.instrument-lane {
  display: flex;
  margin-bottom: 1rem;
  height: 60px;
}

.lane-header {
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
  padding-right: 1rem;
  border-right: 1px solid var(--border-color);
}

.instrument-name {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.lane-timeline {
  flex: 1;
  position: relative;
  height: 100%;
  background: var(--section-bg);
  border-radius: 0.25rem;
  margin-left: 1rem;
}

.task-block {
  position: absolute;
  height: 80%;
  top: 10%;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.task-block.imaging {
  background: var(--primary-color);
}

.task-block.picking {
  background: var(--success-color);
}

.task-block.analysis {
  background: var(--info-color);
}

.task-block.high {
  border: 2px solid var(--warning-color);
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.task-name {
  font-weight: 600;
}

.task-duration {
  opacity: 0.9;
  font-size: 0.65rem;
}

/* Metrics */
.metric-card {
  text-align: center;
}

.metric-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.metric-icon.throughput {
  background: var(--primary-color);
}

.metric-icon.utilization {
  background: var(--success-color);
}

.metric-icon.time-saving {
  background: var(--info-color);
}

.metric-info h3 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
}

.metric-info p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.plate-result {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background: var(--section-bg);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.plate-result.hit {
  border-color: var(--success-color);
  background: rgba(var(--success-color-rgb, 76, 175, 80), 0.1);
}

.plate-result:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.plate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.plate-id {
  font-weight: 600;
  color: var(--text-color);
}

.plate-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Navigation */
.demo-navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

/* Help content */
.help-content h4 {
  color: var(--text-color);
  margin: 1.5rem 0 0.5rem 0;
}

.help-content h4:first-child {
  margin-top: 0;
}

.help-content p,
.help-content li {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.help-content ul,
.help-content ol {
  padding-left: 1.5rem;
}

.config-content {
  padding: 1rem 0;
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
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .demo-content {
    padding: 0 1rem 2rem;
  }
  
  .time-labels {
    margin-left: 120px;
    font-size: 0.75rem;
  }
  
  .lane-header {
    width: 120px;
  }
  
  .instrument-name {
    font-size: 0.75rem;
  }
  
  .metric-content {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .metric-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-navigation {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Theme compatibility */
.cell-imaging-scheduler,
.cell-imaging-scheduler * {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>