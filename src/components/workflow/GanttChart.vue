<template>
  <div class="gantt-chart" v-if="schedule.length > 0">
    <div class="gantt-header">
      <h4>Schedule Timeline</h4>
      <div class="gantt-controls">
        <div class="zoom-controls">
          <button @click="zoomOut" :disabled="currentPixelsPerMinute <= 1" class="zoom-btn">
            <i class="fas fa-search-minus"></i>
          </button>
          <span class="zoom-level">{{ currentPixelsPerMinute }}x</span>
          <button @click="zoomIn" :disabled="currentPixelsPerMinute >= 10" class="zoom-btn">
            <i class="fas fa-search-plus"></i>
          </button>
          <button @click="fitToView" class="zoom-btn fit-btn">
            <i class="fas fa-expand-arrows-alt"></i>
            Fit
          </button>
        </div>
      </div>
    </div>
    
    <div class="gantt-container">
      <div class="gantt-sidebar">
        <div class="gantt-header-cell">
          <span>Workflow / Lane</span>
          <div class="header-stats">{{ workflowGroups.length }} workflows</div>
        </div>
        
        <div v-for="group in workflowGroups" :key="group.workflowId" class="workflow-group">
          <div 
            class="workflow-group-header"
            :class="`workflow-${group.workflowId}`"
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
            >
              <span class="lane-name">{{ lane.name }}</span>
              <div class="lane-stats">
                {{ getTasksForLane(group.workflowId, lane.id).length }} tasks
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
              v-if="!group.collapsed"
            >
              <div class="workflow-separator-line"></div>
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
              >
                <div
                  v-for="task in getTasksForLane(group.workflowId, lane.id)"
                  :key="task.id"
                  class="gantt-task"
                  :class="[
                    `workflow-${task.workflowId}`,
                    `instrument-${task.type.toLowerCase().replace(/\s+/g, '-')}`,
                    { conflict: task.conflict }
                  ]"
                  :style="{
                    left: `${task.startTime * currentPixelsPerMinute}px`,
                    width: `${Math.max(task.duration * currentPixelsPerMinute, 60)}px`
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
        <div class="legend-color" :class="`workflow-${workflow.id}`"></div>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { ScheduledTask, Workflow } from '@/types/workflow'
import { INSTRUMENT_ICONS } from '@/constants/instruments'

interface Props {
  schedule: ScheduledTask[]
  workflows: Workflow[]
  pixelsPerMinute?: number
}

const props = withDefaults(defineProps<Props>(), {
  pixelsPerMinute: 2
})

const emit = defineEmits<{
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

// Calculate the actual timeline width based on max end time
const timelineWidth = computed(() => {
  const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
  return maxTime * currentPixelsPerMinute.value + 100
})

// Generate workflow groups with statistics
const workflowGroups = computed(() => {
  console.log('Computing workflow groups with schedule:', props.schedule)
  console.log('Available workflows:', props.workflows)
  
  const groups = props.workflows.map((workflow, index) => {
    const workflowTasks = props.schedule.filter(t => t.workflowId === workflow.id)
    const totalDuration = workflowTasks.reduce((sum, task) => sum + task.duration, 0)
    const taskCount = workflowTasks.length
    
    console.log(`Workflow ${workflow.id} has ${taskCount} tasks:`, workflowTasks)
    
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
  const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
  const markers = []
  const interval = maxTime > 300 ? 60 : 30
  
  for (let i = 0; i <= maxTime; i += interval) {
    markers.push(i)
  }
  
  return markers
})

// Generate minor time markers (every 15 minutes)
const minorTimeMarkers = computed(() => {
  const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
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
  const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
  return currentTime.value >= 0 && currentTime.value <= maxTime
})

// Get tasks for a specific lane - fixed to return individual tasks
const getTasksForLane = (workflowId: string, laneId: string) => {
  const tasks = props.schedule.filter(
    task => task.workflowId === workflowId && task.laneId === laneId
  )
  console.log(`Lane ${workflowId}-${laneId} has tasks:`, tasks)
  return tasks
}

// Get icon for task type
const getTaskIcon = (type: string) => {
  return INSTRUMENT_ICONS[type] || 'fas fa-cog'
}

// Get workflow name by ID
const getWorkflowName = (workflowId?: string) => {
  const workflow = props.workflows.find(w => w.id === workflowId)
  return workflow?.name || 'Unknown'
}

// Get lane name by workflow and lane ID
const getLaneName = (workflowId?: string, laneId?: string) => {
  const workflow = props.workflows.find(w => w.id === workflowId)
  const lane = workflow?.lanes.find(l => l.id === laneId)
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
  if (ganttTimeline.value && props.schedule.length > 0) {
    const containerWidth = ganttTimeline.value.offsetWidth - 100 // Account for padding
    const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
    const optimalZoom = Math.max(1, Math.min(10, Math.floor(containerWidth / maxTime)))
    console.log(`Calculating optimal zoom: containerWidth=${containerWidth}, maxTime=${maxTime}, optimal=${optimalZoom}`)
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
const handleScroll = (event: Event) => {
  // Could implement virtual scrolling here for very large schedules
}

// Update current time periodically
let timeInterval: number

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
    console.log('Set initial zoom to:', optimalZoom)
  }, 100)
  
  // Update current time every minute for "now" indicator
  timeInterval = setInterval(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    currentTime.value = Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60))
  }, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.gantt-chart {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.gantt-header h4 {
  margin: 0;
  color: var(--text-light);
  font-size: 1.25rem;
  font-weight: 600;
}

.gantt-controls {
  display: flex;
  gap: 1rem;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 0.25rem;
}

.zoom-btn {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.375rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.zoom-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fit-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.zoom-level {
  font-size: 0.875rem;
  color: var(--text-muted);
  min-width: 2rem;
  text-align: center;
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
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.05) 100%);
}

.workflow-group-header:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%);
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
  transition: transform 0.2s ease;
}

.workflow-name {
  font-weight: 600;
  color: white;
  flex: 1;
  font-size: 0.95rem;
}

.workflow-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-high {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.priority-medium {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
  border: 1px solid rgba(243, 156, 18, 0.3);
}

.priority-low {
  background: rgba(39, 174, 96, 0.2);
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
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  color: var(--text-light);
  background-color: var(--section-bg);
  transition: background-color 0.2s ease;
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
}

.gantt-timeline {
  flex-grow: 1;
  overflow-x: auto;
  position: relative;
  min-width: 0;
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
  width: v-bind('timelineWidth + "px"');
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
  animation: pulse-now 2s ease-in-out infinite;
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

.gantt-rows {
  position: relative;
  width: v-bind('timelineWidth + "px"');
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
  height: 40px;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  transition: background-color 0.2s ease;
}

.gantt-row.alternate-row {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Enhanced task styling */
.gantt-task {
  position: absolute;
  height: 32px;
  top: 4px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  white-space: nowrap;
  min-width: 60px;
}

.gantt-task:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  z-index: 20;
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
  opacity: 0.9;
}

.task-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.task-name {
  font-weight: 500;
  font-size: 11px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-type {
  font-size: 10px;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


/* Workflow colors with gradients */
.workflow-workflow-a, .workflow-workflow-a .workflow-separator-line {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

.workflow-workflow-b, .workflow-workflow-b .workflow-separator-line {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.workflow-workflow-c, .workflow-workflow-c .workflow-separator-line {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
}

.workflow-workflow-d, .workflow-workflow-d .workflow-separator-line {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.workflow-workflow-e, .workflow-workflow-e .workflow-separator-line {
  background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
}

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
  animation: tooltip-appear 0.2s ease-out;
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

/* Responsive */
@media (max-width: 768px) {
  .gantt-sidebar {
    width: 220px;
  }
  
  .gantt-row-header,
  .gantt-row {
    height: 36px;
  }
  
  .gantt-task {
    height: 28px;
    top: 6px;
    padding: 0 6px;
    min-width: 50px;
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
}
</style>