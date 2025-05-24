<template>
  <div class="optimization-metrics" v-if="hasMetrics">
    <h4>Optimization Results</h4>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="8">
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.totalTime }}min</div>
            <div class="metric-label">Total Time</div>
            <div class="metric-sublabel">{{ formatDuration(metrics.totalTime) }}</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="8">
        <div class="metric-card" :class="{ 'has-conflicts': metrics.conflicts > 0 }">
          <div class="metric-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.conflicts }}</div>
            <div class="metric-label">Conflicts</div>
            <div class="metric-sublabel">
              {{ metrics.conflicts === 0 ? 'Schedule is valid' : 'Needs attention' }}
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="8">
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metrics.utilization }}%</div>
            <div class="metric-label">Utilization</div>
            <div class="metric-sublabel">{{ getUtilizationLabel() }}</div>
          </div>
          <div class="utilization-bar">
            <div 
              class="utilization-fill" 
              :style="{ width: `${metrics.utilization}%` }"
              :class="getUtilizationClass()"
            ></div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <div class="metrics-insights" v-if="insights.length > 0">
      <h5>Insights & Recommendations</h5>
      <div class="insights-list">
        <div 
          v-for="(insight, index) in insights" 
          :key="index"
          class="insight-item"
          :class="`insight-${insight.type}`"
        >
          <i :class="getInsightIcon(insight.type)"></i>
          <span>{{ insight.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Metrics } from '@/types/workflow'

interface Props {
  metrics: Metrics
}

interface Insight {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'metric-clicked': [metric: string]
}>()

// Check if we have any metrics to display
const hasMetrics = computed(() => {
  return props.metrics.totalTime > 0
})

// Format duration in human-readable format
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  
  return `${hours}h ${mins}m`
}

// Get utilization label based on percentage
const getUtilizationLabel = (): string => {
  const util = props.metrics.utilization
  
  if (util >= 80) return 'Excellent'
  if (util >= 60) return 'Good'
  if (util >= 40) return 'Moderate'
  if (util >= 20) return 'Low'
  return 'Very Low'
}

// Get utilization class for styling
const getUtilizationClass = (): string => {
  const util = props.metrics.utilization
  
  if (util >= 80) return 'excellent'
  if (util >= 60) return 'good'
  if (util >= 40) return 'moderate'
  return 'low'
}

// Generate insights based on metrics
const insights = computed((): Insight[] => {
  const result: Insight[] = []
  
  // Check for conflicts
  if (props.metrics.conflicts > 0) {
    result.push({
      type: 'error',
      message: `${props.metrics.conflicts} scheduling conflicts detected. Consider adding more instrument capacity or adjusting workflow priorities.`
    })
  } else {
    result.push({
      type: 'success',
      message: 'Schedule is conflict-free and ready for execution.'
    })
  }
  
  // Check utilization
  if (props.metrics.utilization < 40) {
    result.push({
      type: 'warning',
      message: 'Low instrument utilization detected. You may have excess capacity.'
    })
  } else if (props.metrics.utilization > 90) {
    result.push({
      type: 'warning',
      message: 'Very high utilization may indicate a bottleneck. Consider adding instrument capacity.'
    })
  }
  
  // Check total time
  if (props.metrics.totalTime > 480) { // 8 hours
    result.push({
      type: 'info',
      message: 'Total workflow time exceeds 8 hours. Consider splitting into multiple runs.'
    })
  }
  
  return result
})

// Get icon for insight type
const getInsightIcon = (type: string): string => {
  const icons: Record<string, string> = {
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-circle',
    error: 'fas fa-times-circle',
    info: 'fas fa-info-circle'
  }
  
  return icons[type] || 'fas fa-circle'
}
</script>

<style scoped>
.optimization-metrics {
  margin-top: 2rem;
}

.optimization-metrics h4 {
  color: var(--text-light);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.metric-card {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 120px;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.metric-card.has-conflicts {
  border-color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.05);
}

.metric-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--card-bg);
  border-radius: 50%;
  flex-shrink: 0;
}

.metric-card.has-conflicts .metric-icon {
  color: var(--error-color);
  background-color: rgba(239, 68, 68, 0.1);
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-value {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-light);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 1rem;
  color: var(--text-light);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.metric-sublabel {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.utilization-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: var(--bg-color);
}

.utilization-fill {
  height: 100%;
  transition: width 0.5s ease;
  background-color: var(--primary-color);
}

.utilization-fill.excellent {
  background-color: var(--success-color);
}

.utilization-fill.good {
  background-color: var(--primary-color);
}

.utilization-fill.moderate {
  background-color: var(--warning-color);
}

.utilization-fill.low {
  background-color: var(--error-color);
}

/* Insights section */
.metrics-insights {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
}

.metrics-insights h5 {
  margin: 0 0 1rem 0;
  color: var(--text-light);
  font-size: 1.125rem;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--card-bg);
  border-radius: 0.25rem;
  border-left: 3px solid;
  font-size: 0.875rem;
  line-height: 1.5;
}

.insight-item i {
  font-size: 1rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.insight-success {
  border-left-color: var(--success-color);
  color: var(--text-light);
}

.insight-success i {
  color: var(--success-color);
}

.insight-warning {
  border-left-color: var(--warning-color);
  color: var(--text-light);
}

.insight-warning i {
  color: var(--warning-color);
}

.insight-error {
  border-left-color: var(--error-color);
  color: var(--text-light);
}

.insight-error i {
  color: var(--error-color);
}

.insight-info {
  border-left-color: var(--primary-color);
  color: var(--text-light);
}

.insight-info i {
  color: var(--primary-color);
}

/* Responsive */
@media (max-width: 768px) {
  .metric-card {
    margin-bottom: 1rem;
    min-height: 100px;
  }
  
  .metric-icon {
    font-size: 2rem;
    width: 50px;
    height: 50px;
  }
  
  .metric-value {
    font-size: 1.5rem;
  }
  
  .metric-label {
    font-size: 0.875rem;
  }
  
  .metric-sublabel {
    font-size: 0.75rem;
  }
  
  .metrics-insights {
    padding: 1rem;
  }
  
  .insight-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}
</style>