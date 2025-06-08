<template>
  <div class="optimization-metrics" v-if="hasMetrics">
    <div class="metrics-grid">
      <!-- Total Time Card -->
      <div class="kpi-card" @click="$emit('metric-clicked', 'totalTime')">
        <div class="kpi-header">
          <div class="kpi-icon-wrapper time">
            <i class="fas fa-clock"></i>
          </div>
          <div class="kpi-trend" v-if="previousMetrics">
            <i :class="getTrendIcon('totalTime')" :style="{ color: getTrendColor('totalTime') }"></i>
            <span :style="{ color: getTrendColor('totalTime') }">{{ getTrendPercentage('totalTime') }}%</span>
          </div>
        </div>
        <div class="kpi-body">
          <h3 class="kpi-value">{{ metrics.totalTime }}<span class="kpi-unit">min</span></h3>
          <p class="kpi-label">Total Time</p>
          <p class="kpi-sublabel">{{ formatDuration(metrics.totalTime) }}</p>
        </div>
        <div class="kpi-progress">
          <div class="progress-bar">
            <div class="progress-fill time-progress" :style="{ width: getTimeProgress() + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Conflicts Card -->
      <div 
        class="kpi-card" 
        :class="{ 'alert': metrics.conflicts > 0 }"
        @click="$emit('metric-clicked', 'conflicts')"
      >
        <div class="kpi-header">
          <div class="kpi-icon-wrapper" :class="metrics.conflicts > 0 ? 'danger' : 'success'">
            <i :class="metrics.conflicts > 0 ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'"></i>
          </div>
          <div class="kpi-badge" :class="metrics.conflicts > 0 ? 'badge-danger' : 'badge-success'">
            {{ metrics.conflicts > 0 ? 'Issues Found' : 'All Clear' }}
          </div>
        </div>
        <div class="kpi-body">
          <h3 class="kpi-value">{{ metrics.conflicts }}</h3>
          <p class="kpi-label">Conflicts</p>
          <p class="kpi-sublabel">{{ getConflictMessage() }}</p>
        </div>
        <div class="kpi-action" v-if="metrics.conflicts > 0">
          <span class="action-text">View Details →</span>
        </div>
      </div>

      <!-- Utilization Card -->
      <div class="kpi-card" @click="$emit('metric-clicked', 'utilization')">
        <div class="kpi-header">
          <div class="kpi-icon-wrapper" :class="getUtilizationClass()">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="kpi-chart">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                :stroke="getUtilizationColor()"
                :stroke-dasharray="`${metrics.utilization}, 100`"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
        <div class="kpi-body">
          <h3 class="kpi-value">{{ metrics.utilization }}<span class="kpi-unit">%</span></h3>
          <p class="kpi-label">Utilization</p>
          <p class="kpi-sublabel">{{ getUtilizationLabel() }}</p>
        </div>
        <div class="kpi-details">
          <div class="detail-item">
            <span class="detail-label">Efficiency</span>
            <span class="detail-value" :class="getUtilizationClass()">{{ getUtilizationLabel() }}</span>
          </div>
        </div>
      </div>

      <!-- Throughput Card -->
      <div class="kpi-card" @click="$emit('metric-clicked', 'throughput')">
        <div class="kpi-header">
          <div class="kpi-icon-wrapper primary">
            <i class="fas fa-tachometer-alt"></i>
          </div>
        </div>
        <div class="kpi-body">
          <h3 class="kpi-value">{{ getThroughput() }}<span class="kpi-unit">plates/hr</span></h3>
          <p class="kpi-label">Throughput</p>
          <p class="kpi-sublabel">Average processing rate</p>
        </div>
        <div class="kpi-sparkline">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="var(--primary-blue)"
              stroke-width="2"
              points="0,25 20,20 40,22 60,15 80,18 100,10"
            />
            <polyline
              fill="url(#gradient)"
              stroke="none"
              points="0,30 0,25 20,20 40,22 60,15 80,18 100,10 100,30"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:var(--primary-blue);stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:var(--primary-blue);stop-opacity:0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>

    <!-- Insights Section -->
    <div class="insights-section" v-if="insights.length > 0">
      <div class="insights-header">
        <h3><i class="fas fa-lightbulb"></i> Insights & Recommendations</h3>
        <span class="insights-count">{{ insights.length }} insights</span>
      </div>
      <div class="insights-grid">
        <div 
          v-for="(insight, index) in insights" 
          :key="index"
          class="insight-card"
          :class="`insight-${insight.type}`"
        >
          <div class="insight-icon">
            <i :class="getInsightIcon(insight.type)"></i>
          </div>
          <div class="insight-content">
            <h4>{{ getInsightTitle(insight.type) }}</h4>
            <p>{{ insight.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Metrics } from '@/types/workflow'

interface Props {
  metrics: Metrics
  previousMetrics?: Metrics
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

// Get time progress (assuming 8 hour max)
const getTimeProgress = (): number => {
  const maxMinutes = 480 // 8 hours
  return Math.min((props.metrics.totalTime / maxMinutes) * 100, 100)
}

// Get conflict message
const getConflictMessage = (): string => {
  if (props.metrics.conflicts === 0) {
    return 'Schedule is conflict-free'
  } else if (props.metrics.conflicts === 1) {
    return '1 scheduling conflict detected'
  } else {
    return `${props.metrics.conflicts} scheduling conflicts detected`
  }
}

// Calculate throughput (plates per hour)
const getThroughput = (): string => {
  if (props.metrics.totalTime === 0) return '0'
  // Assuming 3 workflows as a baseline
  const workflows = 3
  const platesPerHour = (workflows * 60) / props.metrics.totalTime
  return platesPerHour.toFixed(1)
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

// Get utilization color
const getUtilizationColor = (): string => {
  const util = props.metrics.utilization
  
  if (util >= 80) return '#10b981'
  if (util >= 60) return '#3b82f6'
  if (util >= 40) return '#f59e0b'
  return '#ef4444'
}

// Trend calculations
const getTrendIcon = (metric: string): string => {
  if (!props.previousMetrics) return ''
  const current = props.metrics[metric as keyof Metrics] as number
  const previous = props.previousMetrics[metric as keyof Metrics] as number
  
  if (current > previous) return 'fas fa-arrow-up'
  if (current < previous) return 'fas fa-arrow-down'
  return 'fas fa-minus'
}

const getTrendColor = (metric: string): string => {
  if (!props.previousMetrics) return ''
  const current = props.metrics[metric as keyof Metrics] as number
  const previous = props.previousMetrics[metric as keyof Metrics] as number
  
  // For conflicts and time, lower is better
  if (metric === 'conflicts' || metric === 'totalTime') {
    return current > previous ? '#ef4444' : '#10b981'
  }
  // For utilization, higher is better (to a point)
  return current > previous ? '#10b981' : '#ef4444'
}

const getTrendPercentage = (metric: string): string => {
  if (!props.previousMetrics) return '0'
  const current = props.metrics[metric as keyof Metrics] as number
  const previous = props.previousMetrics[metric as keyof Metrics] as number
  
  if (previous === 0) return '0'
  const percentage = ((current - previous) / previous) * 100
  return percentage > 0 ? `+${percentage.toFixed(0)}` : percentage.toFixed(0)
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
      message: 'Low instrument utilization detected. You may have excess capacity that could be used for additional workflows.'
    })
  } else if (props.metrics.utilization > 90) {
    result.push({
      type: 'warning',
      message: 'Very high utilization may indicate a bottleneck. Consider adding instrument capacity for better resilience.'
    })
  } else if (props.metrics.utilization >= 60 && props.metrics.utilization <= 80) {
    result.push({
      type: 'success',
      message: 'Instrument utilization is optimal, balancing efficiency with flexibility.'
    })
  }
  
  // Check total time
  if (props.metrics.totalTime > 480) { // 8 hours
    result.push({
      type: 'info',
      message: 'Total workflow time exceeds 8 hours. Consider splitting into multiple runs or running overnight.'
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

// Get title for insight type
const getInsightTitle = (type: string): string => {
  const titles: Record<string, string> = {
    success: 'Good News',
    warning: 'Attention',
    error: 'Issue Found',
    info: 'Suggestion'
  }
  
  return titles[type] || 'Insight'
}
</script>

<style scoped>
/* Import design system variables */
.optimization-metrics {
  --primary-blue: #2563eb;
  --primary-blue-light: #3b82f6;
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --danger-red: #ef4444;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-900: #0f172a;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* KPI Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* KPI Card */
.kpi-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.kpi-card.alert {
  border: 2px solid var(--danger-red);
  background: linear-gradient(135deg, white 0%, #fef2f2 100%);
}

/* KPI Header */
.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.kpi-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.kpi-icon-wrapper.time {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: var(--primary-blue);
}

.kpi-icon-wrapper.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: var(--success-green);
}

.kpi-icon-wrapper.danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: var(--danger-red);
}

.kpi-icon-wrapper.primary {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: var(--primary-blue);
}

.kpi-icon-wrapper.excellent {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: var(--success-green);
}

.kpi-icon-wrapper.good {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: var(--primary-blue);
}

.kpi-icon-wrapper.moderate {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: var(--warning-orange);
}

.kpi-icon-wrapper.low {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: var(--danger-red);
}

/* KPI Trend */
.kpi-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

/* KPI Badge */
.kpi-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge-success {
  background: var(--success-green);
  color: white;
}

.badge-danger {
  background: var(--danger-red);
  color: white;
}

/* KPI Body */
.kpi-body {
  margin-bottom: 1rem;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.kpi-unit {
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--gray-600);
}

.kpi-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-700);
  margin: 0.5rem 0 0.25rem;
}

.kpi-sublabel {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
}

/* KPI Progress */
.kpi-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gray-100);
}

.progress-bar {
  height: 100%;
  background: var(--gray-100);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.time-progress {
  background: linear-gradient(90deg, var(--primary-blue) 0%, var(--primary-blue-light) 100%);
}

/* KPI Chart */
.kpi-chart {
  width: 48px;
  height: 48px;
}

.circular-chart {
  max-width: 100%;
  max-height: 100%;
}

.circle-bg {
  fill: none;
  stroke: var(--gray-200);
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke-width: 3.8;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

/* KPI Details */
.kpi-details {
  border-top: 1px solid var(--gray-200);
  padding-top: 1rem;
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-label {
  color: var(--gray-600);
}

.detail-value {
  font-weight: 600;
}

.detail-value.excellent {
  color: var(--success-green);
}

.detail-value.good {
  color: var(--primary-blue);
}

.detail-value.moderate {
  color: var(--warning-orange);
}

.detail-value.low {
  color: var(--danger-red);
}

/* KPI Action */
.kpi-action {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.875rem;
  color: var(--primary-blue);
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover .kpi-action {
  opacity: 1;
}

/* KPI Sparkline */
.kpi-sparkline {
  margin-top: 1rem;
  height: 30px;
  width: 100%;
}

/* Insights Section */
.insights-section {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.insights-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-200);
}

.insights-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.insights-count {
  font-size: 0.875rem;
  color: var(--gray-600);
  background: var(--gray-100);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

/* Insights Grid */
.insights-grid {
  display: grid;
  gap: 1rem;
}

.insight-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--gray-50);
  transition: all 0.2s ease;
}

.insight-card:hover {
  transform: translateX(4px);
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-success .insight-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: var(--success-green);
}

.insight-warning .insight-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: var(--warning-orange);
}

.insight-error .insight-icon {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: var(--danger-red);
}

.insight-info .insight-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: var(--primary-blue);
}

.insight-content h4 {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-900);
}

.insight-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .kpi-card {
    padding: 1.25rem;
  }
  
  .kpi-value {
    font-size: 2rem;
  }
  
  .kpi-unit {
    font-size: 1rem;
  }
  
  .insights-section {
    padding: 1.25rem;
  }
  
  .insight-card {
    padding: 0.75rem;
  }
}
</style>