<template>
  <div class="workflow-thumbnail" :class="{ 'has-connections': hasLiquidHandlerConnections }">
    <!-- Priority Badge -->
    <div class="priority-badge" :class="getPriorityClass(workflow.priority)">
      P{{ workflow.priority }}
    </div>

    <!-- Workflow Header -->
    <div class="thumbnail-header" @click="handleWorkflowClick">
      <h4 class="workflow-name">{{ workflow.name }}</h4>
      <div class="workflow-metrics">
        <span class="metric">
          <i class="fas fa-road"></i>
          {{ workflow.lanes.length }}
        </span>
        <span class="metric">
          <i class="fas fa-tasks"></i>
          {{ totalSteps }}
        </span>
        <span class="metric">
          <i class="fas fa-clock"></i>
          {{ totalDuration }}m
        </span>
      </div>
      <el-button
        class="edit-workflow-btn"
        type="primary"
        size="small"
        @click.stop="handleWorkflowClick"
      >
        <i class="fas fa-edit"></i>
        <span>Edit Workflow</span>
      </el-button>
    </div>

    <!-- Lanes Preview -->
    <div class="lanes-preview">
      <div 
        v-for="(lane, laneIndex) in workflow.lanes.slice(0, maxLanes)" 
        :key="lane.id"
        class="lane-row"
        @click.stop="handleLaneClick(lane.id)"
      >
        <div class="lane-label">{{ lane.name }}</div>
        <div class="steps-row">
          <div 
            v-for="(step, stepIndex) in lane.steps.slice(0, maxStepsPerLane)" 
            :key="step.id"
            class="step-block"
            :class="{ 
              'liquid-handler': step.type === 'Liquid Handler',
              'transfer-task': isTransferTask(step)
            }"
            :style="{
              backgroundColor: getStepColor(step),
              color: getStepTextColor(step)
            }"
            :title="`${step.type}: ${step.task}`"
            :data-lane-index="laneIndex"
            :data-step-index="stepIndex"
          >
            <i :class="getStepIcon(step)"></i>
          </div>
          <div v-if="lane.steps.length > maxStepsPerLane" class="more-steps">
            +{{ lane.steps.length - maxStepsPerLane }}
          </div>
        </div>
      </div>
      
      <!-- More lanes indicator -->
      <div v-if="workflow.lanes.length > maxLanes" class="more-lanes-row">
        <i class="fas fa-ellipsis-h"></i>
        +{{ workflow.lanes.length - maxLanes }} more lanes
      </div>
    </div>

    <!-- Liquid Handler Connections Overlay -->
    <svg 
      v-if="hasLiquidHandlerConnections"
      class="connections-overlay"
      ref="connectionsSvg"
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
            fill="var(--primary-color)"
            opacity="0.6"
          />
        </marker>
      </defs>
    </svg>

    <!-- Connection Legend -->
    <div v-if="hasLiquidHandlerConnections" class="connection-legend">
      <div class="legend-item">
        <svg width="20" height="10">
          <line 
            x1="0" y1="5" x2="20" y2="5" 
            stroke="var(--primary-color)" 
            stroke-width="2" 
            stroke-dasharray="3,2"
            opacity="0.6"
          />
        </svg>
        <span>LH Transfer</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { Workflow, Step } from '@/types/workflow'
import { INSTRUMENT_ICONS, DEFAULT_DURATIONS, getInstrumentColor, getInstrumentTextColor } from '@/constants/instruments'
import { useTheme } from '@/composables/useTheme'

interface Props {
  workflow: Workflow
  maxLanes?: number
  maxStepsPerLane?: number
  showConnections?: boolean
}

const emit = defineEmits<{
  laneClick: [workflowId: string, laneId: string]
  workflowClick: [workflowId: string]
}>()

const props = withDefaults(defineProps<Props>(), {
  maxLanes: 3,
  maxStepsPerLane: 6,
  showConnections: true
})

const connectionsSvg = ref<SVGSVGElement | null>(null)

// Theme integration
const { currentTheme } = useTheme()

// Map application themes to instrument color schemes
const themeColorMapping = {
  'forest': 'naturals',
  'ocean': 'blues',
  'monochrome': 'monochrome',
  'purdue': 'default',
  'pacers': 'default'
} as const

// Computed properties
const totalSteps = computed(() => {
  return props.workflow.lanes.reduce((sum, lane) => sum + lane.steps.length, 0)
})

const totalDuration = computed(() => {
  return props.workflow.lanes.reduce((sum, lane) => {
    return sum + lane.steps.reduce((laneSum, step) => {
      return laneSum + (step.duration || DEFAULT_DURATIONS[step.type] || 5)
    }, 0)
  }, 0)
})

const liquidHandlerTransfers = computed(() => {
  const transfers: Array<{laneIndex: number, stepIndex: number, step: Step}> = []
  
  props.workflow.lanes.slice(0, props.maxLanes).forEach((lane, laneIndex) => {
    lane.steps.slice(0, props.maxStepsPerLane).forEach((step, stepIndex) => {
      if (isTransferTask(step)) {
        transfers.push({ laneIndex, stepIndex, step })
      }
    })
  })
  
  return transfers
})

const hasLiquidHandlerConnections = computed(() => {
  return props.showConnections && liquidHandlerTransfers.value.length > 1
})

// Methods
const getPriorityClass = (priority: number) => {
  if (priority <= 2) return 'high'
  if (priority <= 4) return 'medium'
  return 'low'
}

const getStepIcon = (step: Step) => {
  if (step.customIcon) return step.customIcon
  return INSTRUMENT_ICONS[step.type] || 'fas fa-cog'
}

const isTransferTask = (step: Step) => {
  return step.type === 'Liquid Handler' && 
         step.task.toLowerCase().includes('transfer')
}

const getStepColor = (step: Step) => {
  const colorScheme = themeColorMapping[currentTheme.value as keyof typeof themeColorMapping] || 'default'
  return getInstrumentColor(step.type, colorScheme)
}

const getStepTextColor = (step: Step) => {
  const colorScheme = themeColorMapping[currentTheme.value as keyof typeof themeColorMapping] || 'default'
  return getInstrumentTextColor(step.type, colorScheme)
}

const handleLaneClick = (laneId: string) => {
  emit('laneClick', props.workflow.id, laneId)
}

const handleWorkflowClick = () => {
  emit('workflowClick', props.workflow.id)
}

// Draw connections between liquid handler transfer steps
const drawConnections = async () => {
  await nextTick()
  
  if (!connectionsSvg.value || !hasLiquidHandlerConnections.value) return
  
  const svg = connectionsSvg.value
  svg.innerHTML = '' // Clear existing
  
  // Re-add marker definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  marker.setAttribute('id', 'arrowhead')
  marker.setAttribute('markerWidth', '10')
  marker.setAttribute('markerHeight', '7')
  marker.setAttribute('refX', '9')
  marker.setAttribute('refY', '3.5')
  marker.setAttribute('orient', 'auto')
  
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
  polygon.setAttribute('points', '0 0, 10 3.5, 0 7')
  polygon.setAttribute('fill', 'var(--primary-color)')
  polygon.setAttribute('opacity', '0.6')
  
  marker.appendChild(polygon)
  defs.appendChild(marker)
  svg.appendChild(defs)
  
  // Get positions of transfer steps
  const transfers = liquidHandlerTransfers.value
  const positions: Array<{x: number, y: number}> = []
  
  transfers.forEach(({ laneIndex, stepIndex }) => {
    const stepEl = svg.parentElement?.querySelector(
      `[data-lane-index="${laneIndex}"][data-step-index="${stepIndex}"]`
    )
    
    if (stepEl) {
      const rect = stepEl.getBoundingClientRect()
      const svgRect = svg.getBoundingClientRect()
      
      positions.push({
        x: rect.left + rect.width / 2 - svgRect.left,
        y: rect.top + rect.height / 2 - svgRect.top
      })
    }
  })
  
  // Draw connections between consecutive transfers
  for (let i = 0; i < positions.length - 1; i++) {
    const start = positions[i]
    const end = positions[i + 1]
    
    if (start && end) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      
      // Create a curved path
      const controlY1 = start.y - 15
      const controlY2 = end.y - 15
      
      const d = `M ${start.x} ${start.y} 
                 C ${start.x} ${controlY1}, 
                   ${end.x} ${controlY2}, 
                   ${end.x} ${end.y}`
      
      path.setAttribute('d', d)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', 'var(--primary-color)')
      path.setAttribute('stroke-width', '2')
      path.setAttribute('stroke-dasharray', '3,2')
      path.setAttribute('opacity', '0.6')
      path.setAttribute('marker-end', 'url(#arrowhead)')
      
      svg.appendChild(path)
    }
  }
  
  // Draw connection lines between different lanes
  if (positions.length > 1) {
    // Find transfers in different lanes
    const laneGroups: Record<number, Array<{x: number, y: number, index: number}>> = {}
    
    transfers.forEach((transfer, index) => {
      if (!laneGroups[transfer.laneIndex]) {
        laneGroups[transfer.laneIndex] = []
      }
      if (positions[index]) {
        laneGroups[transfer.laneIndex].push({ ...positions[index], index })
      }
    })
    
    // Connect between lanes
    const laneIndices = Object.keys(laneGroups).map(Number).sort()
    
    for (let i = 0; i < laneIndices.length - 1; i++) {
      const lane1 = laneGroups[laneIndices[i]]
      const lane2 = laneGroups[laneIndices[i + 1]]
      
      if (lane1?.length && lane2?.length) {
        // Connect last step of lane1 to first step of lane2
        const start = lane1[lane1.length - 1]
        const end = lane2[0]
        
        if (start.index < end.index) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          
          const d = `M ${start.x} ${start.y} 
                     Q ${start.x + 20} ${(start.y + end.y) / 2}, 
                       ${end.x} ${end.y}`
          
          path.setAttribute('d', d)
          path.setAttribute('fill', 'none')
          path.setAttribute('stroke', 'var(--primary-color)')
          path.setAttribute('stroke-width', '2')
          path.setAttribute('stroke-dasharray', '5,3')
          path.setAttribute('opacity', '0.4')
          
          svg.appendChild(path)
        }
      }
    }
  }
}

// Lifecycle
onMounted(() => {
  if (hasLiquidHandlerConnections.value) {
    drawConnections()
  }
})
</script>

<style scoped>
.workflow-thumbnail {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.2s ease;
  overflow: hidden;
}

.workflow-thumbnail.has-connections {
  padding-bottom: 2rem;
}

.priority-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-badge.high {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.priority-badge.medium {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.priority-badge.low {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.thumbnail-header {
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0.5rem;
  border-radius: 6px;
  margin: -0.5rem -0.5rem 0.25rem -0.5rem;
}

.thumbnail-header:hover {
  background-color: var(--el-fill-color-lighter);
}

.workflow-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
  line-height: 1.2;
  padding-right: 2rem;
}

.workflow-metrics {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.metric i {
  color: var(--primary-color);
  font-size: 0.625rem;
}

.edit-workflow-btn {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.edit-workflow-btn i {
  margin-right: 0.25rem;
}

.edit-workflow-btn:hover {
  transform: translateY(-1px);
}

.lanes-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lane-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.lane-row:hover {
  background: var(--hover-bg);
  transform: translateX(2px);
}

.lane-label {
  width: 60px;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.steps-row {
  flex: 1;
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.step-block {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 0.625rem;
  transition: all 0.2s ease;
  cursor: default;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.step-block.transfer-task {
  position: relative;
}

.step-block.transfer-task::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  background: var(--primary-color);
  border-radius: 50%;
}

.more-steps {
  font-size: 0.625rem;
  color: var(--text-muted);
  padding: 0 0.25rem;
}

.more-lanes-row {
  text-align: center;
  padding: 0.5rem 0 0;
  color: var(--text-muted);
  font-size: 0.75rem;
  border-top: 1px solid var(--border-light);
  margin-top: 0.25rem;
}

.connections-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.connection-legend {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.625rem;
  color: var(--text-muted);
  background: var(--card-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-light);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Hover state */
.workflow-thumbnail:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.workflow-thumbnail:hover .step-block {
  background: var(--card-bg);
}

/* Compact mode */
.workflow-thumbnail.compact {
  padding: 0.75rem;
}

.workflow-thumbnail.compact .workflow-name {
  font-size: 0.875rem;
}

.workflow-thumbnail.compact .lanes-preview {
  gap: 0.375rem;
}

.workflow-thumbnail.compact .step-block {
  width: 20px;
  height: 20px;
}
</style>