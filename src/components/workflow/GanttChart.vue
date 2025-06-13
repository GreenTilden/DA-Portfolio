<template>
  <div class="gantt-chart" v-if="schedule && schedule.length > 0 && workflows && workflows.length > 0">
    <div class="gantt-header">
      <div class="gantt-header-left">
        <h4 class="gantt-title">Schedule Timeline</h4>
        <el-tag class="gantt-subtitle" type="info" effect="plain">
          {{ totalTasks }} tasks across {{ workflowGroups.length }} workflows
        </el-tag>
      </div>
      <div class="gantt-controls">
        <!-- Search Input -->
        <el-input
          v-model="searchQuery"
          placeholder="Search tasks..."
          prefix-icon="fas fa-search"
          size="default"
          clearable
          class="search-input"
          @clear="searchQuery = ''"
        />
        
        <!-- View Controls -->
        <el-button-group class="view-controls">
          <el-tooltip content="Zoom Out" placement="top">
            <el-button 
              @click="zoomOut" 
              :disabled="currentPixelsPerMinute <= 1"
              size="default"
              icon="fas fa-search-minus"
            />
          </el-tooltip>
          
          <el-button size="default" class="zoom-display">
            {{ currentPixelsPerMinute }}x
          </el-button>
          
          <el-tooltip content="Zoom In" placement="top">
            <el-button 
              @click="zoomIn" 
              :disabled="currentPixelsPerMinute >= 10"
              size="default"
              icon="fas fa-search-plus"
            />
          </el-tooltip>
          
          <el-tooltip content="Fit to View" placement="top">
            <el-button 
              @click="fitToView"
              size="default"
              icon="fas fa-expand-arrows-alt"
            />
          </el-tooltip>
        </el-button-group>
        
        <!-- Additional Actions -->
        <el-dropdown trigger="click" class="more-actions">
          <el-button size="default" icon="fas fa-ellipsis-v" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="fas fa-download" @click="exportTimeline">
                Export as PNG
              </el-dropdown-item>
              <el-dropdown-item icon="fas fa-filter" @click="showFilterDialog = true">
                Filter Tasks
              </el-dropdown-item>
              <el-dropdown-item icon="fas fa-expand" @click="toggleFullscreen">
                Fullscreen
              </el-dropdown-item>
              <el-dropdown-item icon="fas fa-redo" @click="resetView">
                Reset View
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <div class="gantt-container">
      <div class="gantt-sidebar">
        <div class="gantt-header-cell">
          <span>Workflow / Lane</span>
          <div class="header-stats">{{ workflowGroups.length || 0 }} workflows</div>
        </div>
        
        <div v-for="group in workflowGroups" :key="group.workflowId" class="workflow-group">
          <div 
            class="workflow-group-header"
            :class="`workflow-${group.workflowId}`"
            :style="{ background: getWorkflowColors[group.workflowId]?.background }"
            @click="toggleWorkflowGroup(group.workflowId)"
          >
            <div class="workflow-header-content">
              <i :class="group.collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-down'" class="collapse-icon"></i>
              <span class="workflow-name">{{ group.workflowName }}</span>
              <div class="workflow-priority" :class="`priority-${group.priority || 'medium'}`">
                {{ group.priority || 'medium' }}
              </div>
            </div>
            <div class="workflow-stats">
              <span class="task-count">{{ group.taskCount }} tasks</span>
              <span class="total-duration">{{ group.totalDuration }}min</span>
            </div>
          </div>
          
          <div v-if="!group.collapsed" class="workflow-lanes">
            <div 
              v-for="(lane, laneIndex) in group.lanes" 
              :key="lane.id"
              class="gantt-row-header"
              :class="{ 'alternate-row': laneIndex % 2 === 1 }"
              :style="{
                height: `${getLaneHeight(group.workflowId, lane.id)}px`,
                minHeight: `${getLaneHeight(group.workflowId, lane.id)}px`
              }"
            >
              <div class="lane-header-content">
                <span class="lane-name">{{ lane.name }}</span>
                <div class="lane-stats">
                  <span class="task-count">{{ getTasksForLane(group.workflowId, lane.id).length }} tasks</span>
                  <span v-if="getLaneHeight(group.workflowId, lane.id) > 40" class="sub-row-info">
                    {{ Math.ceil((getLaneHeight(group.workflowId, lane.id) - 40) / 35) + 1 }} rows
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="gantt-timeline" ref="ganttTimeline" @scroll="handleScroll">
        <div class="time-header">
          <div class="time-markers">
            <div 
              v-for="time in majorTimeMarkers" 
              :key="`major-${time}`" 
              class="time-marker major-marker" 
              :style="{ left: `${time * currentPixelsPerMinute}px` }"
            >
              {{ formatTime(time) }}
            </div>
            <div 
              v-for="time in minorTimeMarkers" 
              :key="`minor-${time}`" 
              class="time-marker minor-marker" 
              :style="{ left: `${time * currentPixelsPerMinute}px` }"
            >
              <div class="minor-tick"></div>
            </div>
            <div 
              v-if="showNowIndicator" 
              class="now-indicator" 
              :style="{ left: `${currentTime * currentPixelsPerMinute}px` }"
            >
              <div class="now-line"></div>
              <div class="now-label">NOW</div>
            </div>
          </div>
        </div>
        
        <div class="gantt-rows">
          <div v-for="group in workflowGroups" :key="group.workflowId" class="workflow-timeline-group">
            <div 
              class="workflow-group-timeline-header"
              :class="`workflow-${group.workflowId}`"
              :style="{ background: getWorkflowColors[group.workflowId]?.background }"
              v-if="!group.collapsed"
            >
              <div 
                class="workflow-separator-line"
                :style="{ background: getWorkflowColors[group.workflowId]?.background }"
              ></div>
            </div>
            
            <div v-if="!group.collapsed" class="workflow-lanes-timeline">
              <div 
                v-for="(lane, laneIndex) in group.lanes" 
                :key="lane.id"
                class="gantt-row"
                :class="[
                  `workflow-${group.workflowId}`,
                  { 'alternate-row': laneIndex % 2 === 1 }
                ]"
                :style="{
                  height: `${getLaneHeight(group.workflowId, lane.id)}px`
                }"
              >
                <div
                  v-for="task in getPositionedTasksForLane(group.workflowId, lane.id)"
                  :key="task.id"
                  class="gantt-task"
                  :class="[
                    `workflow-${task.workflowId}`,
                    `instrument-${task.type.toLowerCase().replace(/\s+/g, '-')}`,
                    { 
                      conflict: task.conflict,
                      searched: searchQuery && isTaskMatchingSearch(task),
                      selected: selectedTasks.has(task.id)
                    }
                  ]"
                  :style="{
                    left: `${task.startTime * currentPixelsPerMinute}px`,
                    top: `${task.displayTop}px`,
                    width: `${Math.max(task.duration * currentPixelsPerMinute, 60)}px`,
                    height: `${task.displayHeight}px`,
                    background: getWorkflowColors[task.workflowId]?.background,
                    color: getWorkflowColors[task.workflowId]?.text
                  }"
                  @click="$emit('task-clicked', task)"
                  @mouseenter="showTooltip($event, task)"
                  @mouseleave="hideTooltip"
                >
                  <div class="gantt-task-content">
                    <i :class="getTaskIcon(task.type)" class="task-icon"></i>
                    <div class="task-info">
                      <span class="task-name">{{ task.task }}</span>
                      <span class="task-type">{{ task.type }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="gantt-legend">
      <div v-for="workflow in workflows" :key="workflow.id" class="legend-item">
        <div 
          class="legend-color" 
          :class="`workflow-${workflow.id}`"
          :style="{ background: getWorkflowColors[workflow.id]?.background }"
        ></div>
        <span>{{ workflow.name }}</span>
      </div>
      <div class="legend-item">
        <div class="legend-color conflict-indicator"></div>
        <span>Conflict</span>
      </div>
    </div>
    
    <!-- Tooltip -->
    <div v-if="tooltip.visible" class="task-tooltip" :style="tooltip.style">
      <div class="tooltip-header">
        <strong>{{ tooltip.task?.task }}</strong>
        <span class="tooltip-type">{{ tooltip.task?.type }}</span>
      </div>
      <div class="tooltip-details">
        <div class="tooltip-row">
          <span class="tooltip-label">Duration:</span>
          <span>{{ tooltip.task?.duration }} minutes</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Start:</span>
          <span>{{ formatTime(tooltip.task?.startTime || 0) }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">End:</span>
          <span>{{ formatTime(tooltip.task?.endTime || 0) }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Workflow:</span>
          <span>{{ getWorkflowName(tooltip.task?.workflowId) }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Lane:</span>
          <span>{{ getLaneName(tooltip.task?.workflowId, tooltip.task?.laneId) }}</span>
        </div>
        <div v-if="tooltip.task?.conflict" class="tooltip-conflict">
          <i class="fas fa-exclamation-triangle"></i>
          Resource conflict detected
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { ScheduledTask, Workflow } from '@/types/workflow'
import { INSTRUMENT_ICONS, getInstrumentColor, getInstrumentTextColor } from '@/constants/instruments'
import { useTheme } from '@/composables/useTheme'

interface Props {
  schedule: ScheduledTask[]
  workflows: Workflow[]
  pixelsPerMinute?: number
}

const props = withDefaults(defineProps<Props>(), {
  pixelsPerMinute: 2
})

defineEmits<{
  'task-clicked': [task: ScheduledTask]
}>()

const ganttTimeline = ref<HTMLElement>()
const currentPixelsPerMinute = ref(props.pixelsPerMinute)
const collapsedWorkflows = ref<Set<string>>(new Set())
const currentTime = ref(0)
const tooltip = ref({
  visible: false,
  task: null as ScheduledTask | null,
  style: {}
})

// Enhanced UI state
const searchQuery = ref('')
const showFilterDialog = ref(false)
const selectedTasks = ref<Set<string>>(new Set())
const isFullscreen = ref(false)

// Theme integration
const { currentTheme } = useTheme()

// Total tasks count
const totalTasks = computed(() => {
  return props.schedule?.length || 0
})

// Generate theme-aware workflow colors
const getWorkflowColors = computed(() => {
  const instrumentTypes = Object.keys(INSTRUMENT_ICONS)
  const workflowColors: Record<string, { background: string; text: string }> = {}
  
  props.workflows?.forEach((workflow, index) => {
    const instrumentType = instrumentTypes[index % instrumentTypes.length]
    const bgColor = getInstrumentColor(instrumentType, currentTheme.value)
    const textColor = getInstrumentTextColor(instrumentType, currentTheme.value)
    
    workflowColors[workflow.id] = {
      background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
      text: textColor
    }
  })
  
  return workflowColors
})

// Calculate the actual timeline width based on max end time
const timelineWidth = computed(() => {
  if (!props.schedule || props.schedule.length === 0) {
    return 120 * currentPixelsPerMinute.value + 100
  }
  const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
  return maxTime * currentPixelsPerMinute.value + 100
})

// Generate workflow groups with statistics
const workflowGroups = computed(() => {
  if (!props.workflows || !props.schedule) {
    return []
  }
  
  const groups = props.workflows.map((workflow, index) => {
    const workflowTasks = props.schedule.filter(t => t.workflowId === workflow.id)
    const totalDuration = workflowTasks.reduce((sum, task) => sum + task.duration, 0)
    const taskCount = workflowTasks.length
    
    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      priority: workflow.priority || 'medium',
      lanes: workflow.lanes,
      collapsed: collapsedWorkflows.value.has(workflow.id),
      totalDuration,
      taskCount,
      colorIndex: index % 5
    }
  })
  
  return groups
})

// Generate major time markers (every 30-60 minutes)
const majorTimeMarkers = computed(() => {
  const maxTime = props.schedule && props.schedule.length > 0 
    ? Math.max(...props.schedule.map(t => t.endTime), 120)
    : 120
  const markers = []
  const interval = maxTime > 300 ? 60 : 30
  
  for (let i = 0; i <= maxTime; i += interval) {
    markers.push(i)
  }
  
  return markers
})

// Generate minor time markers (every 15 minutes)
const minorTimeMarkers = computed(() => {
  const maxTime = props.schedule && props.schedule.length > 0 
    ? Math.max(...props.schedule.map(t => t.endTime), 120)
    : 120
  const markers = []
  
  for (let i = 15; i <= maxTime; i += 15) {
    if (!majorTimeMarkers.value.includes(i)) {
      markers.push(i)
    }
  }
  
  return markers
})

// Show "now" indicator if within timeline
const showNowIndicator = computed(() => {
  const maxTime = props.schedule && props.schedule.length > 0 
    ? Math.max(...props.schedule.map(t => t.endTime), 120)
    : 120
  return currentTime.value >= 0 && currentTime.value <= maxTime
})

// Enhanced collision detection and sub-row assignment
interface PositionedTask extends ScheduledTask {
  subRow: number
  displayTop: number
  displayHeight: number
}

// Check if two tasks collide
const tasksCollide = (task1: ScheduledTask, task2: ScheduledTask): boolean => {
  return task1.startTime < task2.endTime && task2.startTime < task1.endTime
}

// Assign sub-rows to tasks to prevent overlaps
const assignSubRows = (tasks: ScheduledTask[]): PositionedTask[] => {
  if (tasks.length === 0) return []
  
  // Sort tasks by start time for efficient processing
  const sortedTasks = [...tasks].sort((a, b) => a.startTime - b.startTime)
  const positionedTasks: PositionedTask[] = []
  const subRowHeight = 35 // Height per sub-row in pixels
  const taskHeight = 32 // Height of each task
  const taskPadding = 4 // Padding from top of sub-row
  
  // Greedy algorithm to assign sub-rows
  for (const task of sortedTasks) {
    let assignedSubRow = 0
    
    // Find the first available sub-row
    let subRowAvailable = false
    while (!subRowAvailable) {
      subRowAvailable = true
      
      // Check if this sub-row conflicts with any already positioned task
      for (const positioned of positionedTasks) {
        if (positioned.subRow === assignedSubRow && tasksCollide(task, positioned)) {
          subRowAvailable = false
          break
        }
      }
      
      if (!subRowAvailable) {
        assignedSubRow++
      }
    }
    
    positionedTasks.push({
      ...task,
      subRow: assignedSubRow,
      displayTop: assignedSubRow * subRowHeight + taskPadding,
      displayHeight: taskHeight
    })
  }
  
  return positionedTasks
}

// Get positioned tasks for a specific lane with collision handling
const getPositionedTasksForLane = (workflowId: string, laneId: string): PositionedTask[] => {
  const laneTasks = props.schedule.filter(
    task => task.workflowId === workflowId && task.laneId === laneId
  )
  return assignSubRows(laneTasks)
}

// Calculate dynamic lane height based on max sub-rows needed
const getLaneHeight = (workflowId: string, laneId: string): number => {
  const positionedTasks = getPositionedTasksForLane(workflowId, laneId)
  if (positionedTasks.length === 0) return 40 // Base height
  
  const maxSubRow = Math.max(...positionedTasks.map(task => task.subRow))
  const baseHeight = 40
  const subRowHeight = 35
  
  return baseHeight + (maxSubRow * subRowHeight)
}

// Get tasks for a specific lane - maintained for backward compatibility
const getTasksForLane = (workflowId: string, laneId: string) => {
  return props.schedule.filter(
    task => task.workflowId === workflowId && task.laneId === laneId
  )
}

// Get icon for task type
const getTaskIcon = (type: string) => {
  return INSTRUMENT_ICONS[type] || 'fas fa-cog'
}

// Get workflow name by ID
const getWorkflowName = (workflowId?: string) => {
  if (!props.workflows || !workflowId) return 'Unknown'
  const workflow = props.workflows.find(w => w.id === workflowId)
  return workflow?.name || 'Unknown'
}

// Get lane name by workflow and lane ID
const getLaneName = (workflowId?: string, laneId?: string) => {
  if (!props.workflows || !workflowId || !laneId) return 'Unknown'
  const workflow = props.workflows.find(w => w.id === workflowId)
  const lane = workflow?.lanes?.find(l => l.id === laneId)
  return lane?.name || 'Unknown'
}

// Format time for display
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${minutes}min`
}

// Calculate optimal zoom based on container width
const calculateOptimalZoom = () => {
  if (ganttTimeline.value && props.schedule && props.schedule.length > 0) {
    const containerWidth = ganttTimeline.value.offsetWidth - 100 // Account for padding
    const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
    const optimalZoom = Math.max(1, Math.min(10, Math.floor(containerWidth / maxTime)))
    return optimalZoom
  }
  return 2
}

// Zoom controls
const zoomIn = () => {
  if (currentPixelsPerMinute.value < 10) {
    currentPixelsPerMinute.value = Math.min(10, currentPixelsPerMinute.value + 1)
  }
}

const zoomOut = () => {
  if (currentPixelsPerMinute.value > 1) {
    currentPixelsPerMinute.value = Math.max(1, currentPixelsPerMinute.value - 1)
  }
}

const fitToView = () => {
  const optimalZoom = calculateOptimalZoom()
  currentPixelsPerMinute.value = optimalZoom
}

// Toggle workflow group collapse
const toggleWorkflowGroup = (workflowId: string) => {
  if (collapsedWorkflows.value.has(workflowId)) {
    collapsedWorkflows.value.delete(workflowId)
  } else {
    collapsedWorkflows.value.add(workflowId)
  }
}

// Tooltip functions
const showTooltip = (event: MouseEvent, task: ScheduledTask) => {
  tooltip.value = {
    visible: true,
    task,
    style: {
      left: `${event.pageX + 10}px`,
      top: `${event.pageY - 10}px`
    }
  }
}

const hideTooltip = () => {
  tooltip.value.visible = false
}

// Handle timeline scroll for better performance
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
const handleScroll = () => {
  // Throttle scroll events to improve performance
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  scrollTimeout = setTimeout(() => {
    // Could implement virtual scrolling here for very large schedules
    scrollTimeout = null
  }, 16) // ~60fps throttling
}

// Export timeline as PNG
const exportTimeline = () => {
  // Implementation for exporting timeline
  console.log('Exporting timeline...')
  // TODO: Implement canvas export
}

// Toggle fullscreen mode
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// Reset view to default
const resetView = () => {
  currentPixelsPerMinute.value = 2
  searchQuery.value = ''
  collapsedWorkflows.value.clear()
  selectedTasks.value.clear()
}

// Check if task matches search query
const isTaskMatchingSearch = (task: ScheduledTask): boolean => {
  if (!searchQuery.value) return false
  const query = searchQuery.value.toLowerCase()
  return (
    task.task.toLowerCase().includes(query) ||
    task.type.toLowerCase().includes(query) ||
    task.workflowName.toLowerCase().includes(query) ||
    task.laneName.toLowerCase().includes(query)
  )
}

// CSS variable updates
const updateCSSVariables = () => {
  const root = document.documentElement
  if (ganttTimeline.value) {
    const tlWidth = timelineWidth.value
    const ppm = currentPixelsPerMinute.value
    const gridInterval = 15 * ppm
    
    ganttTimeline.value.style.setProperty('--timeline-width', `${tlWidth}px`)
    ganttTimeline.value.style.setProperty('--pixels-per-minute', `${ppm}px`)
    ganttTimeline.value.style.setProperty('--grid-interval', `${gridInterval}px`)
  }
}

// Watch for changes and update CSS variables
watch([timelineWidth, currentPixelsPerMinute], () => {
  nextTick(updateCSSVariables)
})

// Update current time periodically
let timeInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  // Set initial time
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  currentTime.value = Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60))
  
  // Wait for DOM to be ready, then set optimal zoom
  await nextTick()
  setTimeout(() => {
    const optimalZoom = calculateOptimalZoom()
    currentPixelsPerMinute.value = optimalZoom
    updateCSSVariables()
  }, 100)
  
  // Update current time every 5 minutes for "now" indicator to reduce performance impact
  timeInterval = setInterval(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    currentTime.value = Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60))
  }, 300000) // 5 minutes instead of 1 minute
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style scoped>
/* Enhanced theme variables */
.gantt-chart {
  --gantt-bg: var(--card-bg);
  --gantt-border: var(--border-color);
  --gantt-header-bg: var(--section-bg);
  --task-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --task-hover-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  --timeline-grid: rgba(var(--text-muted-rgb, 150, 150, 150), 0.1);
  
  background-color: var(--gantt-bg);
  border: 1px solid var(--gantt-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fullscreen mode */
:fullscreen .gantt-chart {
  max-height: 100vh;
  height: 100vh;
  border-radius: 0;
  border: none;
  padding: 2rem;
}

:fullscreen .gantt-container {
  height: calc(100vh - 200px);
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.gantt-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 200px;
}

.gantt-title {
  margin: 0;
  color: var(--text-light);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.2;
}

.gantt-subtitle {
  font-size: 0.875rem;
}

.gantt-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 200px;
}

.view-controls {
  display: flex;
}

.zoom-display {
  min-width: 60px;
  font-weight: 600;
  color: var(--text-light);
  background: var(--section-bg) !important;
  border-color: var(--border-color) !important;
  cursor: default !important;
}

.zoom-display:hover {
  background: var(--section-bg) !important;
  color: var(--text-light) !important;
}

.more-actions {
  margin-left: 0.5rem;
}

/* Element Plus customizations for controls */
.gantt-header :deep(.el-button) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.gantt-header :deep(.el-input__wrapper) {
  background-color: var(--section-bg);
  border-color: var(--border-color);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.gantt-header :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color);
}

.gantt-header :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb, 74, 144, 226), 0.1);
}

.gantt-container {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background-color: var(--card-bg);
  max-width: 100%;
  height: 450px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  position: relative;
}

.gantt-sidebar {
  flex-shrink: 0;
  width: 280px;
  border-right: 2px solid var(--border-color);
  background-color: var(--section-bg);
  overflow-y: auto;
}

.gantt-header-cell {
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1rem;
  font-weight: 600;
  color: var(--text-light);
  border-bottom: 2px solid var(--border-color);
  background-color: var(--card-bg);
  position: sticky;
  top: 0;
  z-index: 15;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-stats {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: normal;
}

.workflow-group {
  border-bottom: 4px solid var(--border-color);
}

.workflow-group:last-child {
  border-bottom: none;
}

.workflow-group-header {
  height: auto;
  min-height: 60px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
  overflow: hidden;
}

.workflow-group-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary-color);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.workflow-group-header:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%);
  transform: translateX(2px);
}

.workflow-group-header:hover::before {
  transform: translateX(0);
}

.workflow-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.collapse-icon {
  font-size: 0.75rem;
  color: var(--text-muted);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.workflow-name {
  font-weight: 600;
  color: white;
  flex: 1;
  font-size: 0.95rem;
}

.workflow-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.workflow-priority::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.priority-high {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.2) 0%, rgba(231, 76, 60, 0.1) 100%);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.priority-medium {
  background: linear-gradient(135deg, rgba(243, 156, 18, 0.2) 0%, rgba(243, 156, 18, 0.1) 100%);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.priority-low {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.2) 0%, rgba(39, 174, 96, 0.1) 100%);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.workflow-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.task-count, .total-duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.workflow-lanes {
  background: rgba(0, 0, 0, 0.1);
}

.gantt-row-header {
  min-height: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  color: var(--text-light);
  background-color: var(--section-bg);
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.lane-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-top: 0.25rem;
}

.gantt-row-header.alternate-row {
  background-color: rgba(0, 0, 0, 0.05);
}

.lane-name {
  font-weight: 500;
  color: var(--text-light);
}

.lane-stats {
  font-size: 0.7rem;
  color: var(--text-muted);
  opacity: 0.8;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.task-count {
  font-weight: 500;
}

.sub-row-info {
  font-size: 0.65rem;
  color: var(--primary-color);
  opacity: 0.9;
  font-style: italic;
}

.gantt-timeline {
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  min-width: 0;
  scroll-behavior: smooth;
  --timeline-width: 1000px;
  --pixels-per-minute: 2px;
  --grid-interval: 30px;
}

.time-header {
  height: 50px;
  border-bottom: 2px solid var(--border-color);
  position: sticky;
  top: 0;
  background-color: var(--card-bg);
  z-index: 15;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.time-markers {
  position: relative;
  height: 100%;
  width: var(--timeline-width, 1000px);
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent calc(var(--grid-interval, 30px) - 1px),
    var(--timeline-grid) var(--grid-interval, 30px),
    var(--timeline-grid) var(--grid-interval, 30px)
  );
}

.time-marker {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
}

.major-marker {
  padding-left: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-light);
  border-left: 2px solid var(--border-color);
}

.minor-marker {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.minor-tick {
  width: 1px;
  height: 50%;
  background: var(--text-muted);
  opacity: 0.3;
}

.now-indicator {
  position: absolute;
  top: 0;
  height: 100%;
  z-index: 20;
}

.now-line {
  width: 2px;
  height: 100%;
  background: #e74c3c;
  box-shadow: 0 0 4px rgba(231, 76, 60, 0.5);
  animation: pulse-now 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.now-label {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 0.6rem;
  font-weight: bold;
  color: #e74c3c;
  background: white;
  padding: 1px 3px;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes pulse-now {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .now-line {
    animation: none;
  }
  
  .gantt-task.searched {
    animation: none;
    outline: 2px solid var(--primary-color);
  }
  
  .deck-position.pending {
    animation: none;
    border-color: var(--primary-color);
  }
}

.gantt-rows {
  position: relative;
  width: var(--timeline-width, 1000px);
  min-width: 100%;
  background-image: repeating-linear-gradient(
    90deg,
    transparent,
    transparent calc(var(--grid-interval, 30px) - 1px),
    var(--timeline-grid) var(--grid-interval, 30px),
    var(--timeline-grid) var(--grid-interval, 30px)
  );
}

.workflow-timeline-group {
  border-bottom: 4px solid var(--border-color);
}

.workflow-group-timeline-header {
  height: 4px;
  position: relative;
  margin-bottom: 4px;
}

.workflow-separator-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  opacity: 0.6;
}

.workflow-lanes-timeline {
  margin-bottom: 4px;
}

.gantt-row {
  min-height: 40px;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.gantt-row.alternate-row {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Enhanced task styling with improved visual design */
.gantt-task {
  position: absolute;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--task-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  white-space: nowrap;
  min-width: 60px;
  backdrop-filter: blur(2px);
  z-index: 10;
  position: relative;
}

/* Task progress indicator */
.gantt-task::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--task-progress, 0%);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px 0 0 6px;
  transition: width 0.3s ease;
}

.gantt-task:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--task-hover-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 20;
  border-color: rgba(255, 255, 255, 0.3);
}

.gantt-task.selected {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.gantt-task.searched {
  animation: pulse-highlight 2s ease-in-out infinite;
}

@keyframes pulse-highlight {
  0%, 100% {
    box-shadow: var(--task-shadow), 0 0 0 0 rgba(var(--primary-color-rgb, 74, 144, 226), 0.4);
  }
  50% {
    box-shadow: var(--task-shadow), 0 0 0 6px rgba(var(--primary-color-rgb, 74, 144, 226), 0.2);
  }
}

/* Visual indicator for multi-row lanes */
.gantt-row[style*="height"] {
  position: relative;
}

.gantt-row[style*="height"]:not([style*="height: 40px"]) {
  background: linear-gradient(
    to right,
    var(--section-bg) 0%,
    rgba(var(--primary-rgb, 74, 144, 226), 0.02) 50%,
    var(--section-bg) 100%
  );
}

/* Subtle sub-row guidelines */
.gantt-row[style*="height"]:not([style*="height: 40px"])::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 40px;
  bottom: 0;
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 34px,
    rgba(var(--border-color-rgb, 200, 200, 200), 0.1) 34px,
    rgba(var(--border-color-rgb, 200, 200, 200), 0.1) 35px
  );
  pointer-events: none;
  z-index: 1;
}

.gantt-task-content {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.task-icon {
  font-size: 14px;
  flex-shrink: 0;
  opacity: 0.95;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.task-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.task-name {
  font-weight: 600;
  font-size: 11px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.task-type {
  font-size: 10px;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}


/* Dynamic workflow colors based on theme */

/* Conflict styling */
.gantt-task.conflict {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%) !important;
  border: 2px solid #fff !important;
  box-shadow: 0 0 0 2px #e74c3c, 0 2px 4px rgba(0, 0, 0, 0.3) !important;
}

/* Tooltip */
.task-tooltip {
  position: fixed;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 200px;
  max-width: 300px;
  backdrop-filter: blur(10px);
  animation: tooltip-appear 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes tooltip-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.tooltip-header strong {
  display: block;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.tooltip-type {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.tooltip-label {
  color: var(--text-muted);
  font-weight: 500;
}

.tooltip-conflict {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: 0.25rem;
  color: #e74c3c;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Legend */
.gantt-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  justify-content: center;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.legend-color {
  width: 24px;
  height: 14px;
  border-radius: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.conflict-indicator {
  background-image: repeating-linear-gradient(
    45deg,
    #e74c3c,
    #e74c3c 5px,
    rgba(255, 255, 255, 0.3) 5px,
    rgba(255, 255, 255, 0.3) 10px
  );
  border: 1px solid #e74c3c;
}

/* Scrollbar styling */
.gantt-timeline::-webkit-scrollbar {
  height: 12px;
}

.gantt-timeline::-webkit-scrollbar-track {
  background: var(--bg-color);
  border-radius: 6px;
}

.gantt-timeline::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--border-color) 0%, var(--text-muted) 100%);
  border-radius: 6px;
  border: 2px solid var(--bg-color);
}

.gantt-timeline::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
}

.gantt-sidebar::-webkit-scrollbar {
  width: 8px;
}

.gantt-sidebar::-webkit-scrollbar-track {
  background: var(--section-bg);
}

.gantt-sidebar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

/* Enhanced mobile responsiveness */
@media (max-width: 768px) {
  .gantt-chart {
    padding: 1rem;
  }
  
  .gantt-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .gantt-header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .gantt-controls {
    justify-content: space-between;
  }
  
  .search-input {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .gantt-sidebar {
    width: 180px;
  }
  
  .gantt-row-header {
    min-height: 44px; /* Touch-friendly */
    padding: 0.5rem;
  }
  
  .gantt-row {
    min-height: 44px;
  }
  
  .gantt-task {
    padding: 0 8px;
    min-width: 50px;
    font-size: 11px;
    min-height: 36px; /* Touch-friendly */
  }
  
  .gantt-task-content {
    gap: 4px;
  }
  
  .task-icon {
    font-size: 12px;
  }
  
  .task-name {
    font-size: 10px;
  }
  
  .task-type {
    font-size: 9px;
  }
  
  .zoom-controls {
    flex-wrap: wrap;
  }
  
  .fit-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .lane-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .lane-stats {
    font-size: 0.75rem;
    opacity: 0.8;
  }
}
</style>