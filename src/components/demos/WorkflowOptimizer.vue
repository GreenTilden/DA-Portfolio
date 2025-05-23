<template>
  <div class="workflow-optimizer">
    <div class="optimizer-header">
      <h3>Workflow Optimizer</h3>
      <div class="control-buttons">
        <el-button size="small" @click="showInstrumentConfig = true">
          <i class="fas fa-cog"></i> Configure Instruments
        </el-button>
        <el-button type="primary" size="small" @click="optimizeSchedule" :disabled="isOptimizing">
          <i class="fas fa-chart-line"></i> {{ isOptimizing ? 'Optimizing...' : 'Optimize' }}
        </el-button>
        <el-button size="small" @click="resetWorkflows">
          <i class="fas fa-undo"></i> Reset
        </el-button>
      </div>
    </div>

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

    <button class="help-button" @click="showInstructions = !showInstructions" v-if="!showInstructions">
      <i class="fas fa-question-circle"></i> How to Use
    </button>

    <!-- Instrument Palette -->
    <div class="instrument-palette">
      <h4>Instrument Palette</h4>
      <div class="palette-grid">
        <draggable
          v-model="instrumentPalette"
          :group="{ name: 'instruments', pull: 'clone', put: false }"
          :sort="false"
          item-key="id"
        >
          <template #item="{ element }">
            <div class="instrument-card">
              <i :class="getInstrumentIcon(element.type)"></i>
              <span>{{ element.type }}</span>
              <small>{{ element.duration }}min</small>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Workflows Section -->
    <div class="workflows-container">
      <div v-for="workflow in workflows" :key="workflow.id" class="workflow-section">
        <div class="workflow-header">
          <h4>{{ workflow.name }}</h4>
          <el-tag :type="getWorkflowTagType(workflow.priority)" size="small">
            Priority {{ workflow.priority }}
          </el-tag>
        </div>
        
        <div class="workflow-lanes">
          <div v-for="lane in workflow.lanes" :key="lane.id" class="labware-lane">
            <div class="lane-header">
              <i class="fas fa-flask"></i>
              {{ lane.name }}
            </div>
            <draggable
              v-model="lane.steps"
              :group="{ name: 'instruments' }"
              item-key="id"
              class="lane-steps"
              @change="onStepsChange"
            >
              <template #item="{ element, index }">
                <div 
                  class="device-step"
                  :class="{ 'liquid-handler': element.type === 'Liquid Handler' }"
                  :data-step-id="element.id"
                >
                  <div class="step-content">
                    <span class="step-name">{{ element.task || element.type }}</span>
                    <span class="step-duration">{{ element.duration }}min</span>
                  </div>
                  <el-button
                    circle
                    size="small"
                    type="danger"
                    plain
                    class="remove-step"
                    @click="removeStep(workflow.id, lane.id, index)"
                  >
                    <i class="fas fa-times"></i>
                  </el-button>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Lines Canvas -->
    <svg class="connections-svg" ref="connectionsSvg"></svg>

    <!-- Gantt Chart -->
    <div class="gantt-section" v-if="schedule.length > 0">
      <h4>Schedule Timeline</h4>
      <div class="gantt-container">
        <div class="gantt-instruments">
          <div v-for="inst in getUniqueInstruments()" :key="inst" class="gantt-row-header">
            {{ inst }}
          </div>
        </div>
        <div class="gantt-timeline" ref="ganttTimeline">
          <div class="time-markers">
            <div v-for="time in timeMarkers" :key="time" class="time-marker" :style="{ left: `${time * 2}px` }">
              {{ time }}min
            </div>
          </div>
          <div v-for="inst in getUniqueInstruments()" :key="inst" class="gantt-row">
            <div
              v-for="task in getTasksForInstrument(inst)"
              :key="task.id"
              class="gantt-task"
              :class="[`workflow-${task.workflowId}`, { conflict: task.conflict }]"
              :style="{
                left: `${task.startTime * 2}px`,
                width: `${task.duration * 2}px`
              }"
              :title="`${task.workflowName} - ${task.laneName}: ${task.task}`"
            >
              <span class="task-label">{{ task.task }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Metrics -->
    <div class="metrics-section" v-if="metrics.totalTime > 0">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="metric-card">
            <i class="fas fa-clock"></i>
            <div class="metric-value">{{ metrics.totalTime }}min</div>
            <div class="metric-label">Total Time</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="metric-card" :class="{ 'has-conflicts': metrics.conflicts > 0 }">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="metric-value">{{ metrics.conflicts }}</div>
            <div class="metric-label">Conflicts</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="metric-card">
            <i class="fas fa-chart-pie"></i>
            <div class="metric-value">{{ metrics.utilization }}%</div>
            <div class="metric-label">Utilization</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Instrument Configuration Dialog -->
    <el-dialog 
      v-model="showInstrumentConfig" 
      title="Configure Instrument Nests"
      width="600px"
    >
      <div class="config-content">
        <div v-for="(config, instrument) in instrumentConfig" :key="instrument" class="config-row">
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
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import InstrumentControlSimulator from '@/components/demos/InstrumentControlSimulator.vue'
import LiquidHandlerVisualizer from '@/components/demos/LiquidHandlerVisualizer.vue'
import WorkflowOptimizer from '@/components/demos/WorkflowOptimizer.vue'

// Instrument definitions
const INSTRUMENTS = {
  'Centrifuge': ['Spin', 'Balance', 'Load/Unload'],
  'Liquid Handler': ['Transfer', 'Prime Tips', 'Wash Tips', 'Run Method'],
  'Plate Reader': ['Read Absorbance', 'Read Fluorescence', 'Kinetic Read'],
  'Plate Sealer': ['Heat Seal', 'Pressure Seal', 'Apply Film'],
  'Plate Peeler': ['Peel Seal', 'Remove Film'],
  'Incubator': ['Incubate', 'Set Temperature', 'Orbital Shake'],
  'Plate Shaker': ['Orbital Mix', 'Linear Shake', 'Vortex'],
  'Bulk Dispenser': ['Dispense Reagent', 'Prime Lines', 'Load Tips']
}

const DEFAULT_DURATIONS = {
  'Centrifuge': 12,
  'Liquid Handler': 15,
  'Plate Reader': 4,
  'Plate Sealer': 3,
  'Plate Peeler': 2,
  'Incubator': 60,
  'Plate Shaker': 20,
  'Bulk Dispenser': 8
}

// Pre-built workflows
const DEFAULT_WORKFLOWS = [
  {
    id: 'workflow-a',
    name: 'Workflow A: Protein Binding',
    priority: 1,
    lanes: [
      {
        id: 'lane-a1',
        name: 'Compound Plate',
        steps: [
          { id: 'step-a1-1', type: 'Storage', task: 'Get', duration: 2 },
          { id: 'step-a1-2', type: 'Liquid Handler', task: 'Transfer', duration: 15 },
          { id: 'step-a1-3', type: 'Storage', task: 'Store', duration: 2 }
        ]
      },
      {
        id: 'lane-a2',
        name: 'Assay Plate',
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
    lanes: [
      {
        id: 'lane-b1',
        name: 'Source Plate',
        steps: [
          { id: 'step-b1-1', type: 'Storage', task: 'Get', duration: 2 },
          { id: 'step-b1-2', type: 'Bulk Dispenser', task: 'Dispense', duration: 12 },
          { id: 'step-b1-3', type: 'Storage', task: 'Store', duration: 2 }
        ]
      },
      {
        id: 'lane-b2',
        name: 'Read Plate',
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
    lanes: [
      {
        id: 'lane-c1',
        name: 'Sample Plate',
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

export default {
  name: 'WorkflowOptimizer',
  components: {
    draggable
  },
  setup() {
    // State
    const workflows = ref(JSON.parse(JSON.stringify(DEFAULT_WORKFLOWS)))
    const instrumentPalette = ref([])
    const schedule = ref([])
    const connections = ref([])
    const isOptimizing = ref(false)
    const showInstrumentConfig = ref(false)
    const connectionsSvg = ref(null)
    const ganttTimeline = ref(null)
    const showInstructions = ref(true);
    
    // Instrument configuration
    const instrumentConfig = reactive({
      'Centrifuge': { nests: 1 },
      'Liquid Handler': { nests: 2 },
      'Plate Reader': { nests: 1 },
      'Plate Sealer': { nests: 1 },
      'Plate Peeler': { nests: 1 },
      'Incubator': { nests: 3 },
      'Plate Shaker': { nests: 2 },
      'Bulk Dispenser': { nests: 1 },
      'Storage': { nests: 99 } // Unlimited
    })

    // Metrics
    const metrics = reactive({
      totalTime: 0,
      conflicts: 0,
      utilization: 0
    })

    // Computed
    const timeMarkers = computed(() => {
      const maxTime = Math.max(...schedule.value.map(t => t.endTime), 120)
      const markers = []
      for (let i = 0; i <= maxTime; i += 30) {
        markers.push(i)
      }
      return markers
    })

    // Methods
    const initializeInstrumentPalette = () => {
      const palette = []
      let id = 0
      
      Object.entries(INSTRUMENTS).forEach(([instrument, tasks]) => {
        tasks.forEach(task => {
          palette.push({
            id: `palette-${id++}`,
            type: instrument,
            task: task,
            duration: DEFAULT_DURATIONS[instrument]
          })
        })
      })
      
      instrumentPalette.value = palette
    }

    const getInstrumentIcon = (type) => {
      const icons = {
        'Centrifuge': 'fas fa-circle-notch',
        'Liquid Handler': 'fas fa-syringe',
        'Plate Reader': 'fas fa-microscope',
        'Plate Sealer': 'fas fa-stamp',
        'Plate Peeler': 'fas fa-tape',
        'Incubator': 'fas fa-temperature-high',
        'Plate Shaker': 'fas fa-blender',
        'Bulk Dispenser': 'fas fa-tint',
        'Storage': 'fas fa-box'
      }
      return icons[type] || 'fas fa-cog'
    }

    const getWorkflowTagType = (priority) => {
      return priority === 1 ? 'danger' : priority === 2 ? 'warning' : ''
    }

    const removeStep = (workflowId, laneId, stepIndex) => {
      const workflow = workflows.value.find(w => w.id === workflowId)
      const lane = workflow.lanes.find(l => l.id === laneId)
      lane.steps.splice(stepIndex, 1)
      
      // Update connections after removal
      nextTick(() => {
        drawConnections()
      })
    }

    const onStepsChange = () => {
      // Generate unique IDs for new steps
      workflows.value.forEach(workflow => {
        workflow.lanes.forEach(lane => {
          lane.steps.forEach((step, index) => {
            if (!step.id || step.id.startsWith('palette-')) {
              step.id = `${lane.id}-step-${Date.now()}-${index}`
            }
          })
        })
      })
      
      // Update connections when steps change
      nextTick(() => {
        drawConnections()
      })
      
      // Save to localStorage for dev
      saveToLocalStorage()
    }

    const drawConnections = () => {
      if (!connectionsSvg.value) return
      
      const svg = connectionsSvg.value
      svg.innerHTML = '' // Clear existing connections
      
      // Find all liquid handler steps
      const liquidHandlerSteps = []
      const stepElements = document.querySelectorAll('.device-step.liquid-handler')
      
      stepElements.forEach(el => {
        const rect = el.getBoundingClientRect()
        const svgRect = svg.getBoundingClientRect()
        
        liquidHandlerSteps.push({
          element: el,
          x: rect.left + rect.width / 2 - svgRect.left,
          y: rect.top + rect.height / 2 - svgRect.top,
          stepId: el.dataset.stepId
        })
      })
      
      // Group by workflow and detect connections
      const workflowGroups = {}
      workflows.value.forEach(workflow => {
        workflowGroups[workflow.id] = []
        workflow.lanes.forEach(lane => {
          lane.steps.forEach(step => {
            if (step.type === 'Liquid Handler') {
              const stepEl = liquidHandlerSteps.find(s => s.stepId === step.id)
              if (stepEl) {
                workflowGroups[workflow.id].push({
                  ...stepEl,
                  laneId: lane.id,
                  laneName: lane.name
                })
              }
            }
          })
        })
      })
      
      // Draw connections within each workflow
      Object.values(workflowGroups).forEach(group => {
        if (group.length > 1) {
          // Connect all liquid handler steps in the workflow
          for (let i = 0; i < group.length - 1; i++) {
            for (let j = i + 1; j < group.length; j++) {
              drawConnection(svg, group[i], group[j])
            }
          }
        }
      })
    }

    const drawConnection = (svg, step1, step2) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      
      // Create curved path
      const midX = (step1.x + step2.x) / 2
      const midY = (step1.y + step2.y) / 2
      const controlOffset = Math.abs(step1.y - step2.y) * 0.3
      
      const d = `M ${step1.x} ${step1.y} Q ${midX} ${midY - controlOffset}, ${step2.x} ${step2.y}`
      
      path.setAttribute('d', d)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', 'var(--primary-color)')
      path.setAttribute('stroke-width', '2')
      path.setAttribute('stroke-dasharray', '5,5')
      path.setAttribute('opacity', '0.5')
      
      svg.appendChild(path)
    }

    const optimizeSchedule = () => {
      isOptimizing.value = true
      schedule.value = []
      
      // Collect all tasks with metadata
      const allTasks = []
      workflows.value.forEach(workflow => {
        workflow.lanes.forEach(lane => {
          lane.steps.forEach((step, index) => {
            allTasks.push({
              id: step.id,
              workflowId: workflow.id,
              workflowName: workflow.name,
              workflowPriority: workflow.priority,
              laneId: lane.id,
              laneName: lane.name,
              stepIndex: index,
              type: step.type,
              task: step.task,
              duration: step.duration,
              dependencies: lane.steps.slice(0, index).map(s => s.id)
            })
          })
        })
      })
      
      // Sort by workflow priority and step order
      allTasks.sort((a, b) => {
        if (a.workflowPriority !== b.workflowPriority) {
          return a.workflowPriority - b.workflowPriority
        }
        return a.stepIndex - b.stepIndex
      })
      
      // Track instrument availability
      const instrumentAvailability = {}
      Object.keys(instrumentConfig).forEach(inst => {
        instrumentAvailability[inst] = Array(instrumentConfig[inst].nests).fill(0)
      })
      
      // Track task completion times for dependencies
      const taskCompletionTimes = {}
      
      // Schedule each task
      allTasks.forEach(task => {
        // Find earliest start time considering dependencies
        let earliestStart = 0
        task.dependencies.forEach(depId => {
          if (taskCompletionTimes[depId]) {
            earliestStart = Math.max(earliestStart, taskCompletionTimes[depId])
          }
        })
        
        // Find available nest
        const instrument = task.type
        const nests = instrumentAvailability[instrument] || [0]
        let selectedNest = 0
        let startTime = Infinity
        
        nests.forEach((nestAvailable, nestIndex) => {
          const possibleStart = Math.max(earliestStart, nestAvailable)
          if (possibleStart < startTime) {
            startTime = possibleStart
            selectedNest = nestIndex
          }
        })
        
        // Update availability
        instrumentAvailability[instrument][selectedNest] = startTime + task.duration
        taskCompletionTimes[task.id] = startTime + task.duration
        
        // Add to schedule
        schedule.value.push({
          ...task,
          startTime,
          endTime: startTime + task.duration,
          nest: selectedNest,
          instrument: `${instrument} ${selectedNest + 1}`,
          conflict: false
        })
      })
      
      // Detect conflicts (same instrument, overlapping times)
      schedule.value.forEach((task1, i) => {
        schedule.value.forEach((task2, j) => {
          if (i !== j && task1.instrument === task2.instrument) {
            if (task1.startTime < task2.endTime && task2.startTime < task1.endTime) {
              task1.conflict = true
              task2.conflict = true
            }
          }
        })
      })
      
      // Calculate metrics
      calculateMetrics()
      
      setTimeout(() => {
        isOptimizing.value = false
      }, 500)
    }

    const calculateMetrics = () => {
      const tasks = schedule.value
      
      // Total time
      metrics.totalTime = tasks.length > 0 
        ? Math.max(...tasks.map(t => t.endTime))
        : 0
      
      // Conflicts
      metrics.conflicts = tasks.filter(t => t.conflict).length / 2
      
      // Utilization
      if (metrics.totalTime > 0) {
        const totalTaskTime = tasks.reduce((sum, task) => sum + task.duration, 0)
        const totalAvailableTime = Object.entries(instrumentConfig).reduce(
          (sum, [inst, config]) => sum + (config.nests * metrics.totalTime),
          0
        )
        metrics.utilization = Math.round((totalTaskTime / totalAvailableTime) * 100)
      } else {
        metrics.utilization = 0
      }
    }

    const getUniqueInstruments = () => {
      const instruments = new Set()
      schedule.value.forEach(task => {
        instruments.add(task.instrument)
      })
      return Array.from(instruments).sort()
    }

    const getTasksForInstrument = (instrument) => {
      return schedule.value.filter(task => task.instrument === instrument)
    }

    const resetWorkflows = () => {
      workflows.value = JSON.parse(JSON.stringify(DEFAULT_WORKFLOWS))
      schedule.value = []
      metrics.totalTime = 0
      metrics.conflicts = 0
      metrics.utilization = 0
      
      nextTick(() => {
        drawConnections()
      })
    }

    const saveInstrumentConfig = () => {
      showInstrumentConfig.value = false
      if (schedule.value.length > 0) {
        optimizeSchedule()
      }
    }

    const saveToLocalStorage = () => {
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem('workflow-optimizer-state', JSON.stringify({
          workflows: workflows.value,
          instrumentConfig: instrumentConfig
        }))
      }
    }

    const loadFromLocalStorage = () => {
      if (process.env.NODE_ENV === 'development') {
        const saved = localStorage.getItem('workflow-optimizer-state')
        if (saved) {
          const data = JSON.parse(saved)
          workflows.value = data.workflows || workflows.value
          Object.assign(instrumentConfig, data.instrumentConfig || {})
        }
      }
    }

    // Update SVG size on window resize
    const updateSvgSize = () => {
      if (connectionsSvg.value) {
        const container = document.querySelector('.workflow-optimizer')
        if (container) {
          const rect = container.getBoundingClientRect()
          connectionsSvg.value.style.width = `${rect.width}px`
          connectionsSvg.value.style.height = `${rect.height}px`
          drawConnections()
        }
      }
    }

    // Lifecycle
    onMounted(() => {
      initializeInstrumentPalette()
      loadFromLocalStorage()
      // No need to call showInstructions as it's a ref, not a method
      nextTick(() => {
        updateSvgSize()
        drawConnections()
      })
      
      window.addEventListener('resize', updateSvgSize)
    })

    // Watch for workflow changes
    watch(workflows, () => {
      nextTick(() => {
        drawConnections()
      })
    }, { deep: true })

    return {
      workflows,
      instrumentPalette,
      schedule,
      connections,
      isOptimizing,
      showInstrumentConfig,
      instrumentConfig,
      metrics,
      timeMarkers,
      connectionsSvg,
      ganttTimeline,
      showInstructions,
      getInstrumentIcon,
      getWorkflowTagType,
      removeStep,
      onStepsChange,
      optimizeSchedule,
      getUniqueInstruments,
      getTasksForInstrument,
      resetWorkflows,
      saveInstrumentConfig
    }
  }
}
</script>

<style scoped>
.workflow-optimizer {
  padding: 2rem;
  background-color: var(--card-bg);
  border-radius: 0.5rem;
  position: relative;
  min-height: 600px;
}

.optimizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.optimizer-header h3 {
  margin: 0;
  color: var(--text-light);
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Instrument Palette */
.instrument-palette {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
}

.instrument-palette h4 {
  margin: 0 0 1rem 0;
  color: var(--text-light);
  font-size: 1rem;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.instrument-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  padding: 0.75rem;
  text-align: center;
  cursor: grab;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.instrument-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.instrument-card i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.instrument-card span {
  font-size: 0.875rem;
  color: var(--text-light);
}

.instrument-card small {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Workflows */
.workflows-container {
  margin-bottom: 2rem;
}

.workflow-section {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.workflow-header h4 {
  margin: 0;
  color: var(--text-light);
}

.workflow-lanes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.labware-lane {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.lane-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--secondary-color);
  font-weight: 500;
}

.lane-steps {
  display: flex;
  gap: 0.5rem;
  min-height: 50px;
  padding: 0.5rem;
  background-color: var(--bg-color);
  border: 1px dashed var(--border-color);
  border-radius: 0.25rem;
}

.device-step {
  background-color: var(--primary-color);
  color: white;
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  cursor: move;
  position: relative;
  min-width: 100px;
  transition: all 0.2s ease;
}

.device-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.device-step.liquid-handler {
  background-color: var(--secondary-color);
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.step-duration {
  font-size: 0.75rem;
  opacity: 0.9;
}

.remove-step {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  padding: 0;
  display: none;
}

.device-step:hover .remove-step {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Connections */
.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

/* Gantt Chart */
.gantt-section {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
}

.gantt-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-light);
}

.gantt-container {
  display: flex;
  overflow-x: auto;
}

.gantt-instruments {
  flex-shrink: 0;
  width: 150px;
  border-right: 1px solid var(--border-color);
}

.gantt-row-header {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  color: var(--text-light);
  border-bottom: 1px solid var(--border-color);
}

.gantt-timeline {
  flex-grow: 1;
  position: relative;
  min-width: 600px;
}

.time-markers {
  height: 30px;
  position: relative;
  border-bottom: 1px solid var(--border-color);
}

.time-marker {
  position: absolute;
  font-size: 0.75rem;
  color: var(--text-muted);
  transform: translateX(-50%);
}

.gantt-row {
  height: 40px;
  position: relative;
  border-bottom: 1px solid var(--border-color);
}

.gantt-task {
  position: absolute;
  height: 30px;
  top: 5px;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: white;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gantt-task:hover {
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.gantt-task.workflow-workflow-a {
  background-color: #e74c3c;
}

.gantt-task.workflow-workflow-b {
  background-color: #f39c12;
}

.gantt-task.workflow-workflow-c {
  background-color: #27ae60;
}

.gantt-task.conflict {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(255, 255, 255, 0.2) 5px,
    rgba(255, 255, 255, 0.2) 10px
  );
  border: 2px solid #e74c3c;
}

.task-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Metrics */
.metrics-section {
  margin-top: 2rem;
}

.metric-card {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: var(--primary-color);
}

.metric-card.has-conflicts {
  border-color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.metric-card i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.metric-card.has-conflicts i {
  color: #e74c3c;
}

.metric-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-muted);
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
  width: auto;
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

.help-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  z-index: 10;
  width: auto;
}

.help-button:hover {
  background-color: var(--primary-dark);
}

/* Adjust for mobile */
@media (max-width: 768px) {
  .instructions-panel {
    width: 95%;
    top: 3rem;
  }
  
  .feature-highlights {
    grid-template-columns: 1fr;
  }
  
  .help-button {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
/* Responsive */
@media (max-width: 768px) {
  .optimizer-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .control-buttons {
    width: 100%;
    justify-content: flex-start;
  }

  .palette-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gantt-instruments {
    width: 100px;
  }

  .metric-card {
    padding: 1rem;
  }

  .metric-value {
    font-size: 1.5rem;
  }
}

/* Dark theme adjustments */
:deep(.el-dialog) {
  background-color: var(--card-bg);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-dialog__body) {
  color: var(--text-light);
}

:deep(.el-input-number) {
  background-color: var(--bg-color);
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: var(--bg-color);
  color: var(--text-light);
  border-color: var(--border-color);
}

:deep(.el-input__inner) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
  color: var(--text-light);
}

/* Fix for instrument palette */
.instrument-palette .el-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}

.instrument-palette .el-col {
  padding: 0 10px;
  margin-bottom: 10px;
}

/* Ensure draggable components are visible */
.sortable-ghost {
  opacity: 0.4;
  background-color: var(--primary-color) !important;
}

.sortable-drag {
  opacity: 0.8;
}

/* Fix z-index for dialogs */
.el-dialog__wrapper {
  z-index: 2500 !important;
}

.v-modal {
  z-index: 2400 !important;
}

/* Add these styles to the end of the <style> section in WorkflowOptimizer.vue */

</style>