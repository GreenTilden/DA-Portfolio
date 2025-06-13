<template>
  <div class="multi-lane-editor">
    <!-- Error state -->
    <el-alert
      v-if="!selectedWorkflow"
      title="Workflow not found"
      type="error"
      show-icon
      :closable="false"
    />
    
    <!-- Empty state -->
    <el-empty
      v-else-if="!selectedWorkflow.lanes?.length"
      :image-size="120"
      description="No lanes in this workflow yet"
    >
      <el-button type="primary" @click="$emit('add-lane')">
        <el-icon><Plus /></el-icon>
        Add First Lane
      </el-button>
    </el-empty>
    
    <!-- Multi-lane layout -->
    <div v-else class="lanes-grid">
      <el-row :gutter="20" class="lanes-row">
        <el-col
          v-for="lane in selectedWorkflow.lanes"
          :key="lane.id"
          :xs="24"
          :sm="12" 
          :md="8"
          :lg="6"
          :xl="6"
          class="lane-column"
        >
          <el-card class="lane-card" shadow="hover">
            <!-- Lane Header -->
            <template #header>
              <div class="lane-header">
                <el-icon class="drag-handle"><Rank /></el-icon>
                <span class="lane-name">{{ lane.name }}</span>
                <div class="lane-actions">
                  <el-button 
                    type="primary" 
                    text
                    size="small"
                    @click="$emit('lane-click', lane.id)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button 
                    type="danger" 
                    text
                    size="small"
                    @click="handleDeleteLane(lane.id)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            
            <!-- Lane Stats -->
            <div class="lane-stats">
              <el-tag size="small" type="info">
                <el-icon><List /></el-icon>
                {{ lane.steps.length }} steps
              </el-tag>
              <el-tag size="small" type="warning">
                <el-icon><Timer /></el-icon>
                {{ getLaneDuration(lane) }}min
              </el-tag>
            </div>
            
            <!-- Steps List -->
            <div class="steps-container">
              <el-scrollbar v-if="lane.steps.length" max-height="400px">
                <div class="steps-list">
                  <div 
                    v-for="(step, stepIndex) in lane.steps" 
                    :key="step.id"
                    class="step-item"
                  >
                    <el-avatar 
                      :size="32" 
                      :style="{ backgroundColor: getStepColor(step.type) }"
                    >
                      <el-icon><component :is="getStepIconComponent(step.type)" /></el-icon>
                    </el-avatar>
                    <div class="step-content">
                      <div class="step-header">
                        <span class="step-type">{{ step.type }}</span>
                        <el-tag size="small" round>{{ stepIndex + 1 }}</el-tag>
                      </div>
                      <div class="step-details">
                        <span class="step-task">{{ step.task }}</span>
                        <span class="step-duration">{{ step.duration }}min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
              
              <!-- Empty Lane State -->
              <el-empty 
                v-else
                :image-size="60"
                description="No steps added"
              >
                <el-button 
                  type="primary" 
                  size="small"
                  @click="$emit('lane-click', lane.id)"
                >
                  Add Steps
                </el-button>
              </el-empty>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- Actions Footer -->
    <div class="actions-footer">
      <el-button @click="$emit('complete')">
        Done
      </el-button>
      <el-button type="primary" @click="$emit('add-lane')">
        <el-icon><Plus /></el-icon>
        Add Lane
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Plus, 
  Edit, 
  Delete, 
  Rank,
  List, 
  Timer,
  Setting,
  Monitor,
  MagicStick,
  RefreshRight,
  Brush,
  Eleme
} from '@element-plus/icons-vue'
import { useWorkflowState } from '@/composables/useWorkflowState'
import { DEFAULT_DURATIONS } from '@/constants/instruments'
import type { Lane } from '@/types/workflow'

interface Props {
  workflowId: string | null
}

const props = defineProps<Props>()

// Used in template with $emit calls
const emit = defineEmits<{
  'lane-click': [laneId: string]
  'add-lane': []
  'complete': []
}>()

const { workflows, updateWorkflows } = useWorkflowState()

// Get the selected workflow
const selectedWorkflow = computed(() => {
  if (!props.workflowId) return null
  return workflows.value.find(w => w.id === props.workflowId) || null
})

// Calculate lane duration
const getLaneDuration = (lane: Lane): number => {
  const total = lane.steps.reduce((sum, step) => {
    return sum + (step.duration || DEFAULT_DURATIONS[step.type as keyof typeof DEFAULT_DURATIONS] || 5)
  }, 0)
  return Math.round(total)
}

// Get step icon component for Element Plus
const getStepIconComponent = (stepType: string) => {
  const iconMap: Record<string, any> = {
    'Liquid Handler': Eleme,
    'Plate Reader': Monitor,
    'Incubator': Setting,
    'Centrifuge': RefreshRight,
    'Washer': Brush,
    'Dispenser': MagicStick
  }
  return iconMap[stepType] || Setting
}

// Get step color for avatars
const getStepColor = (stepType: string): string => {
  const colorMap: Record<string, string> = {
    'Liquid Handler': '#409eff',
    'Plate Reader': '#67c23a',
    'Incubator': '#e6a23c',
    'Centrifuge': '#f56c6c',
    'Washer': '#909399',
    'Dispenser': '#9c27b0'
  }
  return colorMap[stepType] || '#409eff'
}

// Handle lane deletion
const handleDeleteLane = (laneId: string) => {
  if (!selectedWorkflow.value) return
  
  if (confirm('Are you sure you want to delete this lane and all its steps?')) {
    const updatedWorkflows = workflows.value.map(w => 
      w.id === props.workflowId 
        ? { ...w, lanes: w.lanes.filter(l => l.id !== laneId) }
        : w
    )
    updateWorkflows(updatedWorkflows)
  }
}
</script>

<style scoped>
.multi-lane-editor {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lanes-grid {
  flex: 1;
  overflow: hidden;
}

.lanes-row {
  height: 100%;
}

.lane-column {
  height: 100%;
  margin-bottom: 1rem;
}

.lane-card {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.lane-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

/* Lane Header */
.lane-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  cursor: grab;
  color: var(--el-text-color-placeholder);
  font-size: 16px;
}

.lane-name {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
}

.lane-actions {
  display: flex;
  gap: 4px;
}

/* Lane Stats */
.lane-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.lane-stats .el-tag {
  font-size: 11px;
}

/* Steps Container */
.steps-container {
  flex: 1;
  min-height: 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.step-item:hover {
  background: var(--el-fill-color-light);
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.step-type {
  font-weight: 600;
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.step-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-task {
  font-size: 11px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.step-duration {
  font-size: 10px;
  color: var(--el-color-warning);
  font-weight: 500;
}

/* Actions Footer */
.actions-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--el-border-color-light);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .lanes-row .el-col {
    margin-bottom: 1rem;
  }
  
  .lane-card {
    height: auto;
    min-height: 300px;
  }
  
  .actions-footer {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>