<template>
  <div 
    class="lane-preview" 
    :class="{ 
      'is-selected': isSelected,
      'is-empty': lane.steps.length === 0,
      'has-pending': hasPendingTask
    }"
    @click="$emit('select', lane.id)"
  >
    <!-- Lane Header -->
    <div class="lane-header">
      <div class="lane-info">
        <h4 class="lane-name">{{ lane.name }}</h4>
        <div class="lane-badges">
          <span v-if="lane.steps.length === 0" class="badge empty">
            Empty
          </span>
          <span v-else class="badge count">
            {{ lane.steps.length }} {{ lane.steps.length === 1 ? 'step' : 'steps' }}
          </span>
          <span v-if="duration > 0" class="badge duration">
            <i class="fas fa-clock"></i>
            {{ duration }}m
          </span>
        </div>
      </div>
      
      <!-- Selection Indicator -->
      <div class="selection-indicator">
        <i v-if="isSelected" class="fas fa-check-circle"></i>
        <i v-else class="fas fa-circle"></i>
      </div>
    </div>

    <!-- Steps Preview -->
    <div v-if="lane.steps.length > 0" class="steps-preview">
      <!-- Compact step blocks -->
      <div class="steps-row">
        <div 
          v-for="(step, index) in lane.steps.slice(0, maxSteps)" 
          :key="step.id"
          class="step-dot"
          :class="getStepClass(step)"
          :title="`${step.type}: ${step.task}`"
        >
          <i :class="getStepIcon(step)"></i>
        </div>
        
        <!-- More indicator -->
        <div v-if="lane.steps.length > maxSteps" class="more-indicator">
          +{{ lane.steps.length - maxSteps }}
        </div>
      </div>

      <!-- Instrument summary -->
      <div class="instrument-summary">
        <div 
          v-for="(count, instrument) in instrumentCounts" 
          :key="instrument"
          class="instrument-chip"
          :title="`${count} ${instrument} ${count === 1 ? 'step' : 'steps'}`"
        >
          <i :class="INSTRUMENT_ICONS[instrument as string] || 'fas fa-cog'"></i>
          <span>{{ count }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-plus-circle"></i>
      </div>
      <p>Click to add steps</p>
    </div>

    <!-- Pending Task Preview -->
    <div v-if="hasPendingTask && pendingTask" class="pending-preview">
      <div class="pending-header">
        <i class="fas fa-plus"></i>
        <span>Will add:</span>
      </div>
      <div class="pending-task">
        <i :class="getStepIcon(pendingTask)"></i>
        <span>{{ pendingTask.type }}: {{ pendingTask.task }}</span>
      </div>
    </div>

    <!-- Visual Indicators -->
    <div class="visual-indicators">
      <!-- Complexity bar -->
      <div class="complexity-bar" v-if="lane.steps.length > 0">
        <div 
          class="complexity-fill"
          :style="{ width: `${complexity}%` }"
          :class="getComplexityClass(complexity)"
        ></div>
      </div>
      
      <!-- Connection indicator -->
      <div v-if="hasLiquidHandlerTransfers" class="connection-indicator">
        <i class="fas fa-exchange-alt"></i>
        <span>Has transfers</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Lane, Step } from '@/types/workflow'
import { INSTRUMENT_ICONS, DEFAULT_DURATIONS } from '@/constants/instruments'

interface Props {
  lane: Lane
  isSelected?: boolean
  hasPendingTask?: boolean
  pendingTask?: Step | null
  maxSteps?: number
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  hasPendingTask: false,
  pendingTask: null,
  maxSteps: 8
})

const emit = defineEmits<{
  select: [laneId: string]
}>()

// Computed properties
const duration = computed(() => {
  return props.lane.steps.reduce((sum, step) => {
    return sum + (step.duration || DEFAULT_DURATIONS[step.type] || 5)
  }, 0)
})

const instrumentCounts = computed(() => {
  const counts: Record<string, number> = {}
  
  props.lane.steps.forEach(step => {
    counts[step.type] = (counts[step.type] || 0) + 1
  })
  
  // Sort by count descending, limit to top 3
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .reduce((acc, [instrument, count]) => {
      acc[instrument] = count
      return acc
    }, {} as Record<string, number>)
})

const complexity = computed(() => {
  if (props.lane.steps.length === 0) return 0
  
  const factors = {
    stepCount: Math.min(props.lane.steps.length * 10, 40),
    instrumentVariety: Object.keys(instrumentCounts.value).length * 15,
    duration: Math.min(duration.value / 10, 30),
    hasTransfers: hasLiquidHandlerTransfers.value ? 15 : 0
  }
  
  const total = Object.values(factors).reduce((sum, val) => sum + val, 0)
  return Math.min(total, 100)
})

const hasLiquidHandlerTransfers = computed(() => {
  return props.lane.steps.some(step => 
    step.type === 'Liquid Handler' && 
    step.task.toLowerCase().includes('transfer')
  )
})

// Methods
const getStepIcon = (step: Step) => {
  if (step.customIcon) return step.customIcon
  return INSTRUMENT_ICONS[step.type] || 'fas fa-cog'
}

const getStepClass = (step: Step) => {
  const classes = []
  
  if (step.type === 'Liquid Handler') {
    classes.push('liquid-handler')
    if (step.task.toLowerCase().includes('transfer')) {
      classes.push('transfer')
    }
  }
  
  if (step.duration > 30) {
    classes.push('long-duration')
  }
  
  return classes.join(' ')
}

const getComplexityClass = (value: number) => {
  if (value < 30) return 'low'
  if (value < 60) return 'medium'
  return 'high'
}
</script>

<style scoped>
.lane-preview {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.lane-preview:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.lane-preview.is-selected {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
}

.lane-preview.is-empty {
  border-style: dashed;
}

.lane-preview.has-pending {
  border-color: var(--success-color);
}

.lane-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.lane-info {
  flex: 1;
}

.lane-name {
  margin: 0 0 0.375rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
}

.lane-badges {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 500;
  background: var(--background-alt);
  color: var(--text-muted);
  border: 1px solid var(--border-light);
}

.badge.empty {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}

.badge.count {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  border-color: rgba(var(--primary-color-rgb), 0.3);
}

.badge.duration {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.badge.duration i {
  font-size: 0.5rem;
}

.selection-indicator {
  font-size: 1.25rem;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.selection-indicator .fa-check-circle {
  color: var(--primary-color);
}

.steps-preview {
  margin-bottom: 0.75rem;
}

.steps-row {
  display: flex;
  gap: 0.375rem;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.step-dot {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-alt);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.step-dot.liquid-handler {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.step-dot.transfer {
  background: rgba(var(--primary-color-rgb), 0.1);
}

.step-dot.long-duration {
  border-width: 2px;
}

.more-indicator {
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
}

.instrument-summary {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.instrument-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--background-alt);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  font-size: 0.625rem;
  color: var(--text-muted);
}

.instrument-chip i {
  color: var(--primary-color);
}

.empty-state {
  text-align: center;
  padding: 1.5rem 0;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.75rem;
}

.pending-preview {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(var(--success-color-rgb, 34, 197, 94), 0.1);
  border: 1px solid rgba(var(--success-color-rgb, 34, 197, 94), 0.3);
  border-radius: 6px;
}

.pending-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--success-color);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.pending-task {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-light);
}

.pending-task i {
  color: var(--success-color);
}

.visual-indicators {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.complexity-bar {
  height: 3px;
  background: var(--background-alt);
  overflow: hidden;
}

.complexity-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.complexity-fill.low {
  background: #22c55e;
}

.complexity-fill.medium {
  background: #f59e0b;
}

.complexity-fill.high {
  background: #ef4444;
}

.connection-indicator {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  color: var(--primary-color);
  background: var(--card-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  border: 1px solid var(--primary-color);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .lane-preview {
    padding: 0.75rem;
  }
  
  .lane-name {
    font-size: 0.875rem;
  }
  
  .step-dot {
    width: 24px;
    height: 24px;
    font-size: 0.625rem;
  }
}
</style>