import { reactive, toRefs, computed } from 'vue'
import type { Workflow, CustomTask, InstrumentConfig, Metrics } from '@/types/workflow'

interface WorkflowState {
  workflows: Workflow[]
  customTasks: CustomTask[]
  instrumentConfig: Record<string, InstrumentConfig>
  schedule: any[] // We'll type this more specifically later
  metrics: Metrics
  isOptimizing: boolean
}

// Create a singleton state that persists across component instances
const state = reactive<WorkflowState>({
  workflows: [],
  customTasks: [],
  instrumentConfig: {
    'Centrifuge': { nests: 1 },
    'Liquid Handler': { nests: 2 },
    'Plate Reader': { nests: 1 },
    'Plate Sealer': { nests: 1 },
    'Plate Peeler': { nests: 1 },
    'Incubator': { nests: 3 },
    'Plate Shaker': { nests: 2 },
    'Bulk Dispenser': { nests: 1 },
    'Storage': { nests: 99 }
  },
  schedule: [],
  metrics: {
    totalTime: 0,
    conflicts: 0,
    utilization: 0
  },
  isOptimizing: false
})

export function useWorkflowState() {
  // Save state to localStorage
  const saveState = () => {
    if (process.env.NODE_ENV === 'development') {
      const stateToSave = {
        workflows: state.workflows,
        customTasks: state.customTasks,
        instrumentConfig: state.instrumentConfig
      }
      localStorage.setItem('workflow-optimizer-state', JSON.stringify(stateToSave))
    }
  }

  // Load state from localStorage
  const loadState = () => {
    if (process.env.NODE_ENV === 'development') {
      const saved = localStorage.getItem('workflow-optimizer-state')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          if (data.workflows) state.workflows = data.workflows
          if (data.customTasks) state.customTasks = data.customTasks
          if (data.instrumentConfig) {
            Object.assign(state.instrumentConfig, data.instrumentConfig)
          }
        } catch (error) {
          console.error('Failed to load state from localStorage:', error)
        }
      }
    }
  }

  // Add a new custom task
  const addCustomTask = (task: Omit<CustomTask, 'id'>) => {
    const newTask: CustomTask = {
      ...task,
      id: `custom-${Date.now()}`
    }
    state.customTasks.push(newTask)
    saveState()
    return newTask
  }

  // Remove a custom task
  const removeCustomTask = (taskId: string) => {
    const index = state.customTasks.findIndex(task => task.id === taskId)
    if (index !== -1) {
      state.customTasks.splice(index, 1)
      saveState()
    }
  }

  // Get custom tasks for a specific instrument
  const getCustomTasksForInstrument = computed(() => {
    return (instrumentType: string) => {
      return state.customTasks.filter(task => task.type === instrumentType)
    }
  })

  // Update workflows
  const updateWorkflows = (workflows: Workflow[]) => {
    state.workflows = workflows
    saveState()
  }

  // Update schedule
  const updateSchedule = (schedule: any[]) => {
    state.schedule = schedule
  }

  // Update metrics
  const updateMetrics = (metrics: Partial<Metrics>) => {
    Object.assign(state.metrics, metrics)
  }

  // Reset to default state
  const resetState = () => {
    state.workflows = []
    state.customTasks = []
    state.schedule = []
    state.metrics = {
      totalTime: 0,
      conflicts: 0,
      utilization: 0
    }
    state.isOptimizing = false
  }

  return {
    // State
    ...toRefs(state),
    
    // Methods
    saveState,
    loadState,
    addCustomTask,
    removeCustomTask,
    getCustomTasksForInstrument,
    updateWorkflows,
    updateSchedule,
    updateMetrics,
    resetState
  }
}