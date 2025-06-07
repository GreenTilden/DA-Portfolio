<template>
  <div class="gantt-chart" v-if="schedule.length > 0">
    <h4>Schedule Timeline</h4>
    <div class="gantt-container">
      <div class="gantt-sidebar">
        <div class="gantt-header-cell">Workflow / Lane</div>
        <div 
          v-for="(lane, index) in ganttLanes" 
          :key="lane.id"
          class="gantt-row-header"
          :class="{
            'workflow-separator': index > 0 && ganttLanes[index - 1].workflowId !== lane.workflowId
          }"
          :title="`${lane.workflowName} - ${lane.laneName}`"
        >
          <span class="workflow-name">{{ lane.workflowName }}</span>
          <span class="lane-name">{{ lane.laneName }}</span>
        </div>
      </div>
      
      <div class="gantt-timeline" ref="ganttTimeline" @scroll="handleScroll">
        <div class="time-header">
          <div class="time-markers">
            <div 
              v-for="time in timeMarkers" 
              :key="time" 
              class="time-marker" 
              :style="{ left: `${time * pixelsPerMinute}px` }"
            >
              {{ time }}min
            </div>
          </div>
        </div>
        
        <div class="gantt-rows">
          <div 
            v-for="lane in ganttLanes" 
            :key="lane.id"
            class="gantt-row"
          >
            <div
              v-for="task in getTasksForLane(lane.workflowId, lane.laneId)"
              :key="task.id"
              class="gantt-task"
              :class="[
                `workflow-${task.workflowId}`,
                `instrument-${task.type.toLowerCase().replace(/\s+/g, '-')}`,
                { conflict: task.conflict }
              ]"
              :style="{
                left: `${task.startTime * pixelsPerMinute}px`,
                width: `${task.duration * pixelsPerMinute}px`
              }"
              :title="`${task.task} (${task.type}) - ${task.duration}min`"
              @click="$emit('task-clicked', task)"
            >
              <i :class="getTaskIcon(task.type)" class="task-icon"></i>
              <span class="task-label">{{ task.task }}</span>
              <span class="task-time">{{ task.duration }}min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="gantt-legend">
      <div class="legend-item">
        <div class="legend-color workflow-workflow-a"></div>
        <span>Workflow A</span>
      </div>
      <div class="legend-item">
        <div class="legend-color workflow-workflow-b"></div>
        <span>Workflow B</span>
      </div>
      <div class="legend-item">
        <div class="legend-color workflow-workflow-c"></div>
        <span>Workflow C</span>
      </div>
      <div class="legend-item">
        <div class="legend-color conflict-indicator"></div>
        <span>Conflict</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

// Calculate the actual timeline width based on max end time
const timelineWidth = computed(() => {
  const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
  return maxTime * props.pixelsPerMinute + 100 // Add padding
})

// Generate unique lanes based on workflow and lane combinations
const ganttLanes = computed(() => {
  const lanes: Array<{
    id: string
    workflowId: string
    workflowName: string
    laneId: string
    laneName: string
  }> = []
  
  props.workflows.forEach(workflow => {
    workflow.lanes.forEach(lane => {
      lanes.push({
        id: `${workflow.id}-${lane.id}`,
        workflowId: workflow.id,
        workflowName: workflow.name,
        laneId: lane.id,
        laneName: lane.name
      })
    })
  })
  
  return lanes
})

// Generate time markers
const timeMarkers = computed(() => {
  const maxTime = Math.max(...props.schedule.map(t => t.endTime), 120)
  const markers = []
  const interval = maxTime > 300 ? 60 : 30
  
  for (let i = 0; i <= maxTime; i += interval) {
    markers.push(i)
  }
  
  return markers
})

// Get tasks for a specific lane
const getTasksForLane = (workflowId: string, laneId: string) => {
  return props.schedule.filter(
    task => task.workflowId === workflowId && task.laneId === laneId
  )
}

// Get icon for task type
const getTaskIcon = (type: string) => {
  return INSTRUMENT_ICONS[type] || 'fas fa-cog'
}

// Handle timeline scroll for better performance
const handleScroll = (event: Event) => {
  // Could implement virtual scrolling here for very large schedules
}
</script>

<style scoped>
.gantt-chart {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.gantt-chart h4 {
  margin: 0 0 1rem 0;
  color: var(--text-light);
}

.gantt-container {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  background-color: var(--card-bg);
  max-width: 100%;
  height: 300px;
}

.gantt-sidebar {
  flex-shrink: 0;
  width: 200px;
  border-right: 2px solid var(--border-color);
  background-color: var(--section-bg);
}

.gantt-header-cell {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  font-weight: 600;
  color: var(--text-light);
  border-bottom: 2px solid var(--border-color);
  background-color: var(--card-bg);
}

.gantt-row-header {
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 0.75rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-light);
  background-color: var(--section-bg);
}

.workflow-name {
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lane-name {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gantt-timeline {
  flex-grow: 1;
  overflow-x: auto;
  position: relative;
  min-width: 0; /* Allow shrinking */
}

.time-header {
  height: 40px;
  border-bottom: 2px solid var(--border-color);
  position: sticky;
  top: 0;
  background-color: var(--card-bg);
  z-index: 10;
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
  padding-left: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
  border-left: 1px solid var(--border-color);
}

.gantt-rows {
  position: relative;
  width: v-bind('timelineWidth + "px"');
}

.gantt-row {
  height: 50px;
  position: relative;
  border-bottom: 1px solid var(--border-color);
  width: 100%;
}

.gantt-row:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.05);
}

.gantt-task {
  position: absolute;
  height: 34px;
  top: 8px;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  gap: 0.25rem;
  overflow: hidden;
}

.gantt-task:hover {
  z-index: 20;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.task-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.task-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.task-time {
  font-size: 0.65rem;
  opacity: 0.8;
  flex-shrink: 0;
}

/* Workflow colors */
.workflow-workflow-a {
  background-color: #e74c3c;
}

.workflow-workflow-b {
  background-color: #f39c12;
}

.workflow-workflow-c {
  background-color: #27ae60;
}

/* Instrument-specific colors (optional) */
.instrument-liquid-handler {
  opacity: 0.9;
}

.instrument-incubator {
  opacity: 0.85;
}

/* Conflict styling */
.gantt-task.conflict {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(255, 255, 255, 0.2) 5px,
    rgba(255, 255, 255, 0.2) 10px
  );
  border: 2px solid var(--error-color);
  animation: conflict-pulse 2s ease-in-out infinite;
}

@keyframes conflict-pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}

/* Legend */
.gantt-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
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
  width: 20px;
  height: 12px;
  border-radius: 0.25rem;
}

.conflict-indicator {
  background-image: repeating-linear-gradient(
    45deg,
    #e74c3c,
    #e74c3c 5px,
    rgba(255, 255, 255, 0.2) 5px,
    rgba(255, 255, 255, 0.2) 10px
  );
  border: 1px solid var(--error-color);
}

/* Scrollbar styling */
.gantt-timeline::-webkit-scrollbar {
  height: 8px;
}

.gantt-timeline::-webkit-scrollbar-track {
  background: var(--bg-color);
}

.gantt-timeline::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.gantt-timeline::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* Add separator styling */
.workflow-separator {
  border-top: 3px solid var(--border-color) !important;
  margin-top: 2px;
}

.workflow-separator::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
}

/* Add visual indicator for sidebar separators */
.gantt-sidebar .gantt-row-header.workflow-separator {
  border-top: 3px solid var(--border-color);
}

/* Responsive */
@media (max-width: 768px) {
  .gantt-sidebar {
    width: 150px;
  }
  
  .gantt-row-header,
  .gantt-row {
    height: 50px;
  }
  
  .gantt-task {
    height: 32px;
    top: 9px;
    font-size: 0.7rem;
  }
  
  .task-icon {
    font-size: 0.75rem;
  }
  
  .legend-item {
    font-size: 0.8rem;
  }
}
</style>