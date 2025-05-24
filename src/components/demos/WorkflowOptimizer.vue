<template>
  <div class="workflow-optimizer">
    <div class="optimizer-header">
      <div class="header-left">
        <h3>Workflow Optimizer</h3>
        <button class="help-button" @click="showInstructions = !showInstructions" v-if="!showInstructions">
          <i class="fas fa-question-circle"></i> How to Use
        </button>
      </div>
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
        <el-button size="small" @click="initializeInstrumentPalette">
          <i class="fas fa-sync"></i> Refresh
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

    <!-- Enhanced Condensed Instrument Palette -->
    <div class="instrument-palette">
      <h4>Instrument Palette</h4>
      <p class="palette-instructions">Drag these instrument templates to workflow lanes below</p>
      
      <!-- Custom Task Creator -->
      <div class="custom-task-creator">
        <div class="creator-header" @click="toggleCustomTaskForm">
          <h5>
            <i class="fas fa-plus-circle"></i>
            Create Custom Task
          </h5>
          <i :class="showCustomTaskForm ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </div>
        
        <div class="creator-form" v-if="showCustomTaskForm">
          <div class="form-row">
            <div class="form-group">
              <label>Instrument Type</label>
              <select v-model="customTask.type" class="form-control">
                <option v-for="(tasks, instrument) in INSTRUMENTS" :key="instrument" :value="instrument">
                  {{ instrument }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Task Name</label>
              <input type="text" v-model="customTask.task" class="form-control" placeholder="Enter task name">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Duration (minutes)</label>
              <input type="number" v-model.number="customTask.duration" class="form-control" min="1" step="1">
            </div>
            <div class="form-group">
              <label>Custom Icon</label>
              <select v-model="customTask.customIcon" class="form-control">
                <option value="">Use Default Icon</option>
                <option v-for="(icon, index) in AVAILABLE_ICONS" :key="index" :value="icon.class">
                  {{ icon.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group icon-preview">
              <label>Icon Preview</label>
              <div class="preview-icon">
                <i :class="customTask.customIcon || getInstrumentIcon(customTask.type)"></i>
              </div>
            </div>
            <div class="form-group">
              <div class="form-actions">
                <button @click="addCustomTask" class="add-task-btn" :disabled="!isCustomTaskValid">
                  <i class="fas fa-plus"></i> Add to Palette
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Condensed Instrument Drawers Grid -->
      <div class="instrument-drawers">
        <div v-for="(tasks, instrument) in INSTRUMENTS" :key="instrument" 
             class="instrument-drawer" 
             :class="{ 'drawer-open': isDrawerOpen(instrument) }">
          <div class="drawer-header" @click="toggleDrawer(instrument)">
            <div class="drawer-title">
              <i :class="getInstrumentIcon(instrument)"></i>
              <span>{{ instrument }}</span>
            </div>
            <i :class="isDrawerOpen(instrument) ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          </div>
          
          <div class="drawer-content">
            <div class="palette-grid">
              <!-- Standard Tasks -->
              <div 
                v-for="(task, index) in tasks" 
                :key="instrument + '-' + task + '-' + index"
                class="instrument-card" 
                draggable="true" 
                @dragstart="onDragStart($event, {type: instrument, task, duration: DEFAULT_DURATIONS[instrument]})"
              >
                <i :class="getInstrumentIcon(instrument)"></i>
                <span>{{ instrument }}</span>
                <small>{{ task }}</small>
                <small>{{ DEFAULT_DURATIONS[instrument] }}min</small>
              </div>
              
              <!-- Custom Tasks for this instrument -->
              <div 
                v-for="(customTaskItem, index) in getCustomTasksForInstrument(instrument)" 
                :key="'custom-' + instrument + '-' + index"
                class="instrument-card custom-card" 
                draggable="true" 
                @dragstart="onDragStart($event, customTaskItem)"
              >
                <i :class="customTaskItem.customIcon || getInstrumentIcon(customTaskItem.type)"></i>
                <span>{{ customTaskItem.type }}</span>
                <small>{{ customTaskItem.task }}</small>
                <small>{{ customTaskItem.duration }}min</small>
                <button @click.stop="removeCustomTask(customTaskItem)" class="remove-custom-task">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Workflows Section -->
    <div class="workflows-container">
      <div v-for="workflow in workflows" :key="workflow.id" class="workflow-section">
        <div class="workflow-header">
          <div class="workflow-name-container">
            <h4 v-if="!workflow.isEditingName" @click="startEditingWorkflowName(workflow)">
              {{ workflow.name }}
              <i class="fas fa-pen edit-icon"></i>
            </h4>
            <div v-else class="edit-name-container">
              <input 
                type="text" 
                v-model="workflow.editName" 
                @keyup.enter="saveWorkflowName(workflow)" 
                ref="workflowNameInput"
                class="edit-name-input"
              />
              <div class="edit-actions">
                <button @click="saveWorkflowName(workflow)" class="edit-action-btn save-btn">
                  <i class="fas fa-check"></i>
                </button>
                <button @click="cancelEditWorkflowName(workflow)" class="edit-action-btn cancel-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="workflow-controls">
            <el-tag :type="getWorkflowTagType(workflow.priority)" size="small">
              Priority {{ workflow.priority }}
            </el-tag>
            <button class="add-lane-btn" @click="addNewLane(workflow)">
              <i class="fas fa-plus"></i> Add Lane
            </button>
          </div>
        </div>
        
        <div class="workflow-lanes">
          <div v-for="lane in workflow.lanes" :key="lane.id" class="labware-lane">
            <div class="lane-header">
              <div class="lane-name-container">
                <span v-if="!lane.isEditingName" @click="startEditingLaneName(lane)">
                  <i class="fas fa-flask"></i>
                  {{ lane.name }}
                  <i class="fas fa-pen edit-icon"></i>
                </span>
                <div v-else class="edit-name-container">
                  <input 
                    type="text" 
                    v-model="lane.editName" 
                    @keyup.enter="saveLaneName(lane)" 
                    ref="laneNameInput"
                    class="edit-name-input"
                  />
                  <div class="edit-actions">
                    <button @click="saveLaneName(lane)" class="edit-action-btn save-btn">
                      <i class="fas fa-check"></i>
                    </button>
                    <button @click="cancelEditLaneName(lane)" class="edit-action-btn cancel-btn">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              <button class="remove-lane-btn" @click="removeLane(workflow, lane)" v-if="workflow.lanes.length > 1">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <div 
              class="lane-steps" 
              @dragover.prevent="handleDragOver($event)" 
              @dragleave="handleDragLeave($event)" 
              @drop="onDrop($event, workflow, lane)"
            >
              <div 
                v-for="(step, stepIndex) in lane.steps" 
                :key="step.id"
                class="device-step"
                :class="{ 'liquid-handler': step.type === 'Liquid Handler' }"
                :data-step-id="step.id"
                draggable="true"
                @dragstart="onDragStart($event, step, true)"
              >
                <div class="step-content">
                  <span class="step-name">{{ step.task || step.type }}</span>
                  <span class="step-duration">{{ step.duration }}min</span>
                </div>
                <button class="remove-step-btn" @click="removeStep(workflow.id, lane.id, stepIndex)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
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
      class="instrument-config-dialog"
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
import { ref, reactive, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'

// Instrument definitions
const INSTRUMENTS = {
  'Centrifuge': ['Spin', 'Balance', 'Load/Unload'],
  'Liquid Handler': ['Transfer', 'Prime Tips', 'Wash Tips', 'Run Method'],
  'Plate Reader': ['Read Absorbance', 'Read Fluorescence', 'Kinetic Read'],
  'Plate Sealer': ['Heat Seal', 'Pressure Seal', 'Apply Film'],
  'Plate Peeler': ['Peel Seal', 'Remove Film'],
  'Incubator': ['Incubate', 'Set Temperature', 'Orbital Shake'],
  'Plate Shaker': ['Orbital Mix', 'Linear Shake', 'Vortex'],
  'Bulk Dispenser': ['Dispense Reagent', 'Prime Lines', 'Load Tips'],
  'Storage': ['Get', 'Store', 'Transfer']
}

const DEFAULT_DURATIONS = {
  'Centrifuge': 12,
  'Liquid Handler': 15,
  'Plate Reader': 4,
  'Plate Sealer': 3,
  'Plate Peeler': 2,
  'Incubator': 60,
  'Plate Shaker': 20,
  'Bulk Dispenser': 8,
  'Storage': 2
}

// Available icons for custom tasks
const AVAILABLE_ICONS = [
  { name: 'Flask', class: 'fas fa-flask' },
  { name: 'Vial', class: 'fas fa-vial' },
  { name: 'Atom', class: 'fas fa-atom' },
  { name: 'Test Tube', class: 'fas fa-test-tube' },
  { name: 'Fire', class: 'fas fa-fire' },
  { name: 'Snowflake', class: 'fas fa-snowflake' },
  { name: 'Lightning', class: 'fas fa-bolt' },
  { name: 'Magnet', class: 'fas fa-magnet' },
  { name: 'Radiation', class: 'fas fa-radiation' },
  { name: 'Biohazard', class: 'fas fa-biohazard' },
  { name: 'Virus', class: 'fas fa-virus' },
  { name: 'DNA', class: 'fas fa-dna' },
  { name: 'Prescription', class: 'fas fa-prescription' },
  { name: 'Pills', class: 'fas fa-pills' },
  { name: 'Capsules', class: 'fas fa-capsules' },
  { name: 'Syringe', class: 'fas fa-syringe' },
  { name: 'Heartbeat', class: 'fas fa-heartbeat' },
  { name: 'Stethoscope', class: 'fas fa-stethoscope' },
  { name: 'X-Ray', class: 'fas fa-x-ray' },
  { name: 'Microscope', class: 'fas fa-microscope' },
  { name: 'Funnel', class: 'fas fa-filter' },
  { name: 'Hourglass', class: 'fas fa-hourglass-half' },
  { name: 'Thermometer', class: 'fas fa-thermometer-half' },
  { name: 'Scale', class: 'fas fa-weight' },
  { name: 'Droplet', class: 'fas fa-tint' },
  { name: 'Sun', class: 'fas fa-sun' },
  { name: 'Moon', class: 'fas fa-moon' },
  { name: 'Star', class: 'fas fa-star' },
  { name: 'Cog', class: 'fas fa-cog' },
  { name: 'Tools', class: 'fas fa-tools' }
]

// Pre-built workflows
const DEFAULT_WORKFLOWS = [
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

export default {
  name: 'WorkflowOptimizer',
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
    const showInstructions = ref(false) // Changed to false initially
    const currentDragItem = ref(null)
    
    // Enhanced instrument palette state
    const openDrawers = ref(['Liquid Handler']) // Initially open the Liquid Handler drawer
    const customTasks = ref([])
    const showCustomTaskForm = ref(false)
    const customTask = reactive({
      type: 'Liquid Handler',
      task: '',
      duration: 15,
      customIcon: '', // New field for custom icon
      id: ''
    })
    
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

    // Enhanced instrument palette computed properties
    const isCustomTaskValid = computed(() => {
      return (
        customTask.type && 
        customTask.task && 
        customTask.task.trim() !== '' && 
        customTask.duration && 
        customTask.duration >= 1
      )
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
            task,
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
      return priority === 1 ? 'danger' : priority === 2 ? 'warning' : 'info'
    }

    // Enhanced instrument palette methods
    const toggleDrawer = (instrument) => {
      const index = openDrawers.value.indexOf(instrument)
      if (index === -1) {
        openDrawers.value.push(instrument)
      } else {
        openDrawers.value.splice(index, 1)
      }
    }

    const isDrawerOpen = (instrument) => {
      return openDrawers.value.includes(instrument)
    }

    const toggleCustomTaskForm = () => {
      showCustomTaskForm.value = !showCustomTaskForm.value
    }

    const addCustomTask = () => {
      if (!isCustomTaskValid.value) return
      
      // Create a new custom task with a unique ID
      const newCustomTask = {
        ...customTask,
        id: `custom-${Date.now()}`
      }
      
      // Add to custom tasks
      customTasks.value.push(newCustomTask)
      
      // Reset form (except for the instrument type)
      customTask.task = ''
      customTask.duration = 15
      customTask.customIcon = ''
      customTask.id = ''
      
      // Save to localStorage
      saveToLocalStorage()
    }

    const getCustomTasksForInstrument = (instrument) => {
      return customTasks.value.filter(task => task.type === instrument)
    }

    const removeCustomTask = (taskToRemove) => {
      const index = customTasks.value.findIndex(task => task.id === taskToRemove.id)
      if (index !== -1) {
        customTasks.value.splice(index, 1)
        saveToLocalStorage()
      }
    }

    const onDragStart = (event, item, isExistingStep = false) => {
      currentDragItem.value = { ...item, isExistingStep }
      // Set drag data
      event.dataTransfer.setData('text/plain', JSON.stringify(item))
      event.dataTransfer.effectAllowed = isExistingStep ? 'move' : 'copy'
    }

    const onDrop = (event, workflow, lane) => {
      event.preventDefault()
      event.currentTarget.classList.remove('drag-over')
      removeDropIndicators() // Remove drop indicators
      
      if (!currentDragItem.value) return
      
      const item = currentDragItem.value
      
      // If it's an existing step, remove it from its current location
      if (item.isExistingStep) {
        // Find and remove the step from its original location
        let found = false
        workflows.value.forEach(w => {
          if (found) return
          w.lanes.forEach(l => {
            if (found) return
            const stepIndex = l.steps.findIndex(s => s.id === item.id)
            if (stepIndex !== -1) {
              l.steps.splice(stepIndex, 1)
              found = true
            }
          })
        })
      }
      
      // Create a new step from the palette item
      const newStep = {
        id: `${lane.id}-step-${Date.now()}-${lane.steps.length}`,
        type: item.type,
        task: item.task,
        duration: item.duration,
        customIcon: item.customIcon || null // Preserve custom icon if it exists
      }
      
      // Add the new step to the lane
      lane.steps.push(newStep)
      
      // Update connections after adding
      nextTick(() => {
        drawConnections()
      })
      
      // Save to localStorage for dev
      saveToLocalStorage()
      
      // Reset drag item
      currentDragItem.value = null
    }

    // New drag and drop enhancement methods
    const handleDragOver = (event) => {
      event.preventDefault()
      event.currentTarget.classList.add('drag-over')
      
      // Find the closest device step if any
      const closestStep = findClosestStepElement(event)
      
      // Remove any existing drop indicators
      removeDropIndicators()
      
      if (closestStep) {
        // Determine if we should place before or after
        const rect = closestStep.getBoundingClientRect()
        const midpoint = rect.left + rect.width / 2
        
        // Create and position the indicator
        const indicator = document.createElement('div')
        indicator.className = 'drop-indicator'
        
        if (event.clientX < midpoint) {
          // Place before
          closestStep.before(indicator)
        } else {
          // Place after
          closestStep.after(indicator)
        }
      }
    }

    const handleDragLeave = (event) => {
      // Only remove the class if we're leaving the container itself, not just moving between children
      if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
        event.currentTarget.classList.remove('drag-over')
        removeDropIndicators()
      }
    }

    const findClosestStepElement = (event) => {
      // Get all steps in this lane
      const steps = Array.from(event.currentTarget.querySelectorAll('.device-step'))
      if (steps.length === 0) return null
      
      // Find the closest step based on horizontal position
      return steps.reduce((closest, step) => {
        const rect = step.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const distance = Math.abs(event.clientX - centerX)
        
        if (!closest || distance < closest.distance) {
          return { element: step, distance }
        }
        return closest
      }, null)?.element
    }

    const removeDropIndicators = () => {
      document.querySelectorAll('.drop-indicator').forEach(el => el.remove())
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
      
      // Add dependencies for Liquid Handler tasks that need to be paired
      const liquidHandlerTasks = allTasks.filter(task => task.type === 'Liquid Handler')
      const liquidHandlersByWorkflow = {}
      
      // Group Liquid Handler tasks by workflow
      liquidHandlerTasks.forEach(task => {
        if (!liquidHandlersByWorkflow[task.workflowId]) {
          liquidHandlersByWorkflow[task.workflowId] = []
        }
        liquidHandlersByWorkflow[task.workflowId].push(task)
      })
      
      // For each workflow, add dependencies between Liquid Handler tasks
      Object.values(liquidHandlersByWorkflow).forEach(tasks => {
        if (tasks.length > 1) {
          // Add all other liquid handler tasks in this workflow as dependencies
          tasks.forEach(task => {
            const liquidHandlerDependencies = tasks
              .filter(t => t.id !== task.id)
              .map(t => t.id)
              
            // Add these dependencies if they don't already exist
            liquidHandlerDependencies.forEach(depId => {
              if (!task.dependencies.includes(depId)) {
                task.dependencies.push(depId)
              }
            })
          })
        }
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
        
        // For Liquid Handler tasks, make sure multiple LH tasks within the same workflow start at the same time
        if (task.type === 'Liquid Handler' && liquidHandlersByWorkflow[task.workflowId]?.length > 1) {
          const workflowLHTasks = liquidHandlersByWorkflow[task.workflowId]
          const earliestLHStarts = workflowLHTasks
            .filter(t => t.id !== task.id && taskCompletionTimes[t.id])
            .map(t => taskCompletionTimes[t.id] - t.duration)
          
          if (earliestLHStarts.length > 0) {
            earliestStart = Math.max(earliestStart, ...earliestLHStarts)
          }
        }
        
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
          instrumentConfig: instrumentConfig,
          customTasks: customTasks.value
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
          customTasks.value = data.customTasks || []
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

    // Name editing functions
    const startEditingWorkflowName = (workflow) => {
      // First cancel any other editing in progress
      workflows.value.forEach(w => {
        w.isEditingName = false
      })
      
      // Set edit mode and prepare edit value
      workflow.isEditingName = true
      workflow.editName = workflow.name
      
      // Focus the input on next tick
      nextTick(() => {
        const input = document.querySelector('.workflow-name-container .edit-name-input')
        if (input) input.focus()
      })
    }
    
    const saveWorkflowName = (workflow) => {
      if (workflow.editName && workflow.editName.trim() !== '') {
        workflow.name = workflow.editName.trim()
      }
      workflow.isEditingName = false
    }
    
    const cancelEditWorkflowName = (workflow) => {
      workflow.isEditingName = false
    }
    
    const startEditingLaneName = (lane) => {
      // First cancel any other editing in progress
      workflows.value.forEach(w => {
        w.lanes.forEach(l => {
          l.isEditingName = false
        })
      })
      
      // Set edit mode and prepare edit value
      lane.isEditingName = true
      lane.editName = lane.name
      
      // Focus the input on next tick
      nextTick(() => {
        const input = document.querySelector('.lane-name-container .edit-name-input')
        if (input) input.focus()
      })
    }
    
    const saveLaneName = (lane) => {
      if (lane.editName && lane.editName.trim() !== '') {
        lane.name = lane.editName.trim()
      }
      lane.isEditingName = false
    }
    
    const cancelEditLaneName = (lane) => {
      lane.isEditingName = false
    }
    
    // Lane management
    const addNewLane = (workflow) => {
      const newLaneId = `lane-${workflow.id}-${Date.now()}`
      workflow.lanes.push({
        id: newLaneId,
        name: `New Lane ${workflow.lanes.length + 1}`,
        isEditingName: false,
        editName: '',
        steps: []
      })
      
      // Start editing the name of the new lane
      nextTick(() => {
        const newLane = workflow.lanes[workflow.lanes.length - 1]
        startEditingLaneName(newLane)
      })
    }
    
    const removeLane = (workflow, lane) => {
      // Don't allow removing the last lane
      if (workflow.lanes.length <= 1) return
      
      const laneIndex = workflow.lanes.findIndex(l => l.id === lane.id)
      if (laneIndex !== -1) {
        workflow.lanes.splice(laneIndex, 1)
        
        // Update connections after removal
        nextTick(() => {
          drawConnections()
        })
      }
    }

    // Lifecycle
    onMounted(() => {
      initializeInstrumentPalette()
      loadFromLocalStorage()
      
      // Ensure workflows have editing properties
      workflows.value.forEach(workflow => {
        workflow.isEditingName = false
        workflow.editName = ''
        workflow.lanes.forEach(lane => {
          lane.isEditingName = false
          lane.editName = ''
        })
      })
      
      nextTick(() => {
        updateSvgSize()
        drawConnections()
      })
      
      window.addEventListener('resize', updateSvgSize)
    })
    
    // Clean up
    onUnmounted(() => {
      window.removeEventListener('resize', updateSvgSize)
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
      currentDragItem,
      // Enhanced instrument palette
      openDrawers,
      customTasks,
      showCustomTaskForm,
      customTask,
      isCustomTaskValid,
      toggleDrawer,
      isDrawerOpen,
      toggleCustomTaskForm,
      addCustomTask,
      getCustomTasksForInstrument,
      removeCustomTask,
      INSTRUMENTS,
      DEFAULT_DURATIONS,
      AVAILABLE_ICONS, // New export for icon selection
      getInstrumentIcon,
      getWorkflowTagType,
      removeStep,
      onStepsChange,
      optimizeSchedule,
      getUniqueInstruments,
      getTasksForInstrument,
      resetWorkflows,
      saveInstrumentConfig,
      initializeInstrumentPalette,
      onDragStart,
      onDrop,
      // New drag and drop handlers
      handleDragOver,
      handleDragLeave,
      findClosestStepElement,
      removeDropIndicators,
      // Name editing functions
      startEditingWorkflowName,
      saveWorkflowName,
      cancelEditWorkflowName,
      startEditingLaneName,
      saveLaneName,
      cancelEditLaneName,
      // Lane management
      addNewLane,
      removeLane
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
}

.help-button:hover {
  background-color: var(--primary-dark);
}

/* Enhanced Condensed Instrument Palette */
.instrument-palette {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.instrument-palette h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-light);
  font-size: 1rem;
}

.palette-instructions {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 1rem 0;
  font-style: italic;
}

/* Custom Task Creator */
.custom-task-creator {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.creator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.creator-header:hover {
  background-color: var(--primary-dark);
}

.creator-header h5 {
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.creator-form {
  padding: 1rem;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.875rem;
  color: var(--text-light);
  font-weight: 500;
}

.form-control {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  padding: 0.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

.form-control:focus {
  border-color: var(--primary-color);
  outline: none;
}

.icon-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--section-bg);
  border-radius: 0.25rem;
  font-size: 1.25rem;
  color: var(--primary-color);
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100%;
}

.add-task-btn {
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.add-task-btn:hover:not(:disabled) {
  background-color: #0e9f6e;
}

.add-task-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Condensed Instrument Drawers Grid with Sliding Effect */
.instrument-drawers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  position: relative;
}

.instrument-drawer {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: visible;
  position: relative;
  z-index: 1;
}

.instrument-drawer.drawer-open {
  z-index: 10;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--section-bg);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.drawer-header:hover {
  background-color: var(--card-bg);
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-light);
  font-weight: 500;
}

.drawer-title i {
  font-size: 1rem;
  color: var(--primary-color);
}

.drawer-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 1rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 20;
  min-width: 320px;
}

.instrument-drawer.drawer-open .drawer-content {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
}

.instrument-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.instrument-card.custom-card {
  border-color: var(--primary-color);
  border-style: dashed;
  background-color: var(--section-bg);
}

.instrument-card i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.instrument-card span {
  font-size: 0.875rem;
  color: var(--text-light);
  font-weight: 500;
}

.instrument-card small {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.remove-custom-task {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--error-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  padding: 0;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.instrument-card.custom-card:hover .remove-custom-task {
  opacity: 1;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: var(--secondary-color);
  font-weight: 500;
}

.lane-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 60px;
  padding: 0.5rem;
  background-color: var(--bg-color);
  border: 1px dashed var(--border-color);
  border-radius: 0.25rem;
  transition: all 0.2s ease;
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

.remove-step-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  background-color: var(--error-color);
  color: white;
  border: none;
  border-radius: 50%;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0;
}

.device-step:hover .remove-step-btn {
  display: flex;
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

/* Name editing */
.workflow-name-container,
.lane-name-container {
  position: relative;
  display: flex;
  align-items: center;
}

.edit-icon {
  font-size: 0.75rem;
  margin-left: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  color: var(--primary-color);
}

.workflow-name-container:hover .edit-icon,
.lane-name-container:hover .edit-icon {
  opacity: 1;
}

.edit-name-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-name-input {
  background-color: var(--bg-color);
  border: 1px solid var(--primary-color);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  color: var(--text-light);
  width: 200px;
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
}

.edit-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 0.75rem;
}

.save-btn {
  background-color: var(--success-color);
  color: white;
}

.cancel-btn {
  background-color: var(--error-color);
  color: white;
}

/* Lane management */
.workflow-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-lane-btn {
  background-color: var(--success-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  margin-left: 0.5rem;
}

.remove-lane-btn {
  background-color: var(--error-color);
  color: white;
  border: none;
  border-radius: 0.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
}

/* Dialog header fix */
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

/* Drag and drop visual improvements */
.lane-steps.drag-over {
  background-color: var(--hover-bg);
  border: 1px solid var(--primary-color);
}

.drop-indicator {
  width: 4px;
  height: 40px;
  background-color: var(--primary-color);
  border-radius: 2px;
  margin: 0 6px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.device-step:active {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  opacity: 0.8;
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 1200px) {
  .instrument-drawers {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .optimizer-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .control-buttons {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .control-buttons .el-button {
    margin-bottom: 0.5rem;
  }

  .instrument-drawers {
    grid-template-columns: 1fr;
  }

  .drawer-content {
    min-width: 280px;
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
  
  .workflow-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .workflow-name-container {
    width: 100%;
  }
  
  .lane-header {
    flex-wrap: wrap;
  }
  
  .device-step {
    min-width: 90px;
  }
  
  .instructions-panel {
    width: 95%;
    top: 3rem;
  }
  
  .feature-highlights {
    grid-template-columns: 1fr;
  }
  
  .help-button {
    margin-left: 0;
    margin-top: 0.5rem;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  /* Enhanced instrument palette responsive */
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>