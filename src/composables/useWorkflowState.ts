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
    
    // Initialize default workflows if none exist
    if (state.workflows.length === 0) {
      state.workflows = createDefaultWorkflows()
      saveState()
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

  // Create default scientific assay workflows
  const createDefaultWorkflows = (): Workflow[] => {
    return [
      {
        id: 'workflow-elisa',
        name: 'ELISA Cytokine Detection',
        priority: 1,
        isEditingName: false,
        editName: '',
        lanes: [
          {
            id: 'lane-elisa-1',
            name: 'Control Samples',
            isEditingName: false,
            editName: '',
            steps: [
              { id: 'step-1', type: 'Liquid Handler', task: 'Prime Tips', duration: 3 },
              { id: 'step-2', type: 'Liquid Handler', task: 'Transfer', duration: 15 },
              { id: 'step-3', type: 'Plate Sealer', task: 'Heat Seal', duration: 3 },
              { id: 'step-4', type: 'Incubator', task: 'Incubate', duration: 120 },
              { id: 'step-5', type: 'Plate Peeler', task: 'Peel Seal', duration: 2 },
              { id: 'step-6', type: 'Liquid Handler', task: 'Wash Tips', duration: 8 },
              { id: 'step-7', type: 'Plate Reader', task: 'Read Absorbance', duration: 4 }
            ]
          },
          {
            id: 'lane-elisa-2',
            name: 'Test Samples',
            isEditingName: false,
            editName: '',
            steps: [
              { id: 'step-8', type: 'Liquid Handler', task: 'Prime Tips', duration: 3 },
              { id: 'step-9', type: 'Liquid Handler', task: 'Transfer', duration: 18 },
              { id: 'step-10', type: 'Plate Sealer', task: 'Heat Seal', duration: 3 },
              { id: 'step-11', type: 'Incubator', task: 'Incubate', duration: 120 },
              { id: 'step-12', type: 'Plate Peeler', task: 'Peel Seal', duration: 2 },
              { id: 'step-13', type: 'Liquid Handler', task: 'Wash Tips', duration: 10 },
              { id: 'step-14', type: 'Plate Reader', task: 'Read Absorbance', duration: 4 }
            ]
          }
        ]
      },
      {
        id: 'workflow-mtt',
        name: 'MTT Cell Viability Assay',
        priority: 2,
        isEditingName: false,
        editName: '',
        lanes: [
          {
            id: 'lane-mtt-1',
            name: 'Vehicle Control',
            isEditingName: false,
            editName: '',
            steps: [
              { id: 'step-15', type: 'Storage', task: 'Get', duration: 2 },
              { id: 'step-16', type: 'Liquid Handler', task: 'Transfer', duration: 12 },
              { id: 'step-17', type: 'Incubator', task: 'Incubate', duration: 240 },
              { id: 'step-18', type: 'Bulk Dispenser', task: 'Dispense Reagent', duration: 8 },
              { id: 'step-19', type: 'Plate Shaker', task: 'Orbital Mix', duration: 5 },
              { id: 'step-20', type: 'Incubator', task: 'Incubate', duration: 180 },
              { id: 'step-21', type: 'Plate Reader', task: 'Read Absorbance', duration: 4 }
            ]
          },
          {
            id: 'lane-mtt-2',
            name: 'Drug Treatment',
            isEditingName: false,
            editName: '',
            steps: [
              { id: 'step-22', type: 'Storage', task: 'Get', duration: 2 },
              { id: 'step-23', type: 'Liquid Handler', task: 'Transfer', duration: 15 },
              { id: 'step-24', type: 'Incubator', task: 'Incubate', duration: 240 },
              { id: 'step-25', type: 'Bulk Dispenser', task: 'Dispense Reagent', duration: 8 },
              { id: 'step-26', type: 'Plate Shaker', task: 'Orbital Mix', duration: 5 },
              { id: 'step-27', type: 'Incubator', task: 'Incubate', duration: 180 },
              { id: 'step-28', type: 'Plate Reader', task: 'Read Absorbance', duration: 4 }
            ]
          }
        ]
      },
      {
        id: 'workflow-pcr',
        name: 'PCR Setup & Thermal Cycling',
        priority: 3,
        isEditingName: false,
        editName: '',
        lanes: [
          {
            id: 'lane-pcr-1',
            name: 'Target Gene',
            isEditingName: false,
            editName: '',
            steps: [
              { id: 'step-29', type: 'Storage', task: 'Get', duration: 2 },
              { id: 'step-30', type: 'Liquid Handler', task: 'Prime Tips', duration: 3 },
              { id: 'step-31', type: 'Liquid Handler', task: 'Transfer', duration: 20 },
              { id: 'step-32', type: 'Centrifuge', task: 'Spin', duration: 2 },
              { id: 'step-33', type: 'Storage', task: 'Store', duration: 2 },
              { id: 'step-34', type: 'Plate Reader', task: 'Read Fluorescence', duration: 6 }
            ]
          },
          {
            id: 'lane-pcr-2',
            name: 'Reference Gene',
            isEditingName: false,
            editName: '',
            steps: [
              { id: 'step-35', type: 'Storage', task: 'Get', duration: 2 },
              { id: 'step-36', type: 'Liquid Handler', task: 'Prime Tips', duration: 3 },
              { id: 'step-37', type: 'Liquid Handler', task: 'Transfer', duration: 22 },
              { id: 'step-38', type: 'Centrifuge', task: 'Spin', duration: 2 },
              { id: 'step-39', type: 'Storage', task: 'Store', duration: 2 },
              { id: 'step-40', type: 'Plate Reader', task: 'Read Fluorescence', duration: 6 }
            ]
          }
        ]
      }
    ]
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