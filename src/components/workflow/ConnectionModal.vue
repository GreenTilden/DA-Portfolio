<template>
  <el-dialog
    v-model="dialogVisible"
    title="Configure Transfer Connection"
    width="400px"
    class="connection-modal"
  >
    <div class="connection-config">
      <div class="form-group">
        <label>Connection Name</label>
        <el-input 
          v-model="connectionName" 
          placeholder="e.g., Sample Transfer"
          @keyup.enter="saveConnection"
        />
      </div>
      
      <div class="form-group">
        <label>Connection Color</label>
        <div class="color-picker">
          <button
            v-for="color in predefinedColors"
            :key="color"
            class="color-option"
            :class="{ selected: selectedColor === color }"
            :style="{ backgroundColor: color }"
            @click="selectedColor = color"
          >
            <i v-if="selectedColor === color" class="fas fa-check"></i>
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label>Connected Steps</label>
        <div class="connected-steps-preview">
          <div 
            v-for="step in connectedSteps" 
            :key="step.id"
            class="step-preview"
            :style="{ borderColor: selectedColor }"
          >
            <i :class="getStepIcon(step.type)"></i>
            {{ step.task }}
            <span class="lane-name">{{ step.laneName }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="cancelConnection">Cancel</el-button>
      <el-button type="primary" @click="saveConnection">Save Connection</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Step } from '@/types/workflow'
import { INSTRUMENT_ICONS } from '@/constants/instruments'

interface Props {
  visible: boolean
  step: Step | null
  existingConnection?: {
    name: string
    color: string
    steps: string[]
  }
  allSteps: Array<Step & { laneName: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'save': [connection: { name: string; color: string; steps: string[] }]
  'cancel': []
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const connectionName = ref('')
const selectedColor = ref('#e74c3c')
const predefinedColors = [
  '#e74c3c', '#f39c12', '#27ae60', '#3498db', 
  '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
]

// Find all connected transfer steps
const connectedSteps = computed(() => {
  if (!props.step) return []
  
  // For now, return all liquid handler transfer steps in the same workflow
  return props.allSteps.filter(s => 
    s.type === 'Liquid Handler' && 
    s.task.toLowerCase().includes('transfer')
  )
})

const getStepIcon = (type: string) => {
  return INSTRUMENT_ICONS[type] || 'fas fa-cog'
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.existingConnection) {
    connectionName.value = props.existingConnection.name
    selectedColor.value = props.existingConnection.color
  } else {
    connectionName.value = ''
    selectedColor.value = predefinedColors[0]
  }
})

const saveConnection = () => {
  emit('save', {
    name: connectionName.value || 'Unnamed Connection',
    color: selectedColor.value,
    steps: connectedSteps.value.map(s => s.id)
  })
  dialogVisible.value = false
}

const cancelConnection = () => {
  emit('cancel')
  dialogVisible.value = false
}
</script>

<style scoped>
.connection-config {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-light);
  font-size: 0.875rem;
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: var(--text-light);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.color-option i {
  color: white;
  font-size: 1rem;
}

.connected-steps-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.step-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: var(--card-bg);
  border-radius: 0.25rem;
  border: 2px solid;
  font-size: 0.875rem;
}

.step-preview i {
  color: var(--primary-color);
}

.lane-name {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>