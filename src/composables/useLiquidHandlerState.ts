import { reactive, toRefs, computed } from 'vue'
import type { 
  LiquidHandlerStep, 
  ProtocolSequence, 
  ProtocolHistory, 
  HistoryAction,
  ExecutionState,
  ValidationError
} from '@/types/liquidHandler'

interface LiquidHandlerState {
  currentProtocol: ProtocolSequence
  history: ProtocolHistory
  execution: ExecutionState
  validationErrors: ValidationError[]
  isValidating: boolean
}

// Create singleton state
const state = reactive<LiquidHandlerState>({
  currentProtocol: {
    id: 'protocol-1',
    name: 'New Protocol',
    description: '',
    steps: [],
    created: new Date(),
    modified: new Date()
  },
  history: {
    actions: [],
    currentIndex: -1,
    maxSize: 50
  },
  execution: {
    isRunning: false,
    isPaused: false,
    currentStepIndex: -1,
    totalPausedDuration: 0
  },
  validationErrors: [],
  isValidating: false
})

export function useLiquidHandlerState() {
  // History management
  const addHistoryAction = (action: Omit<HistoryAction, 'timestamp'>) => {
    const fullAction: HistoryAction = {
      ...action,
      timestamp: new Date()
    }
    
    // Remove any actions after current index (for redo invalidation)
    state.history.actions = state.history.actions.slice(0, state.history.currentIndex + 1)
    
    // Add new action
    state.history.actions.push(fullAction)
    state.history.currentIndex++
    
    // Limit history size
    if (state.history.actions.length > state.history.maxSize) {
      state.history.actions.shift()
      state.history.currentIndex--
    }
    
    // Update protocol modified time
    state.currentProtocol.modified = new Date()
    
    // Save to localStorage
    saveProtocolState()
  }

  const generateStepId = (): string => {
    return `step-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }

  // Protocol management
  const addStep = (stepData: Omit<LiquidHandlerStep, 'id'>) => {
    const newStep: LiquidHandlerStep = {
      ...stepData,
      id: generateStepId()
    }
    
    state.currentProtocol.steps.push(newStep)
    
    addHistoryAction({
      type: 'add',
      stepId: newStep.id,
      step: newStep
    })
  }

  const removeStep = (stepId: string) => {
    const stepIndex = state.currentProtocol.steps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) return
    
    const removedStep = state.currentProtocol.steps[stepIndex]
    state.currentProtocol.steps.splice(stepIndex, 1)
    
    addHistoryAction({
      type: 'remove',
      stepId: stepId,
      step: removedStep,
      fromIndex: stepIndex
    })
  }

  const editStep = (stepId: string, updates: Partial<LiquidHandlerStep>) => {
    const stepIndex = state.currentProtocol.steps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) return
    
    const originalStep = { ...state.currentProtocol.steps[stepIndex] }
    Object.assign(state.currentProtocol.steps[stepIndex], updates)
    
    addHistoryAction({
      type: 'edit',
      stepId: stepId,
      previousValue: originalStep,
      newValue: { ...state.currentProtocol.steps[stepIndex] }
    })
  }

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
    if (fromIndex >= state.currentProtocol.steps.length || toIndex > state.currentProtocol.steps.length) return
    
    const step = state.currentProtocol.steps[fromIndex]
    state.currentProtocol.steps.splice(fromIndex, 1)
    state.currentProtocol.steps.splice(toIndex, 0, step)
    
    addHistoryAction({
      type: 'move',
      stepId: step.id,
      fromIndex: fromIndex,
      toIndex: toIndex
    })
  }

  const clearProtocol = () => {
    const clearedSteps = [...state.currentProtocol.steps]
    state.currentProtocol.steps = []
    
    addHistoryAction({
      type: 'clear',
      previousValue: clearedSteps
    })
  }

  // Undo/Redo functionality
  const canUndo = computed(() => state.history.currentIndex >= 0)
  const canRedo = computed(() => state.history.currentIndex < state.history.actions.length - 1)

  const undo = () => {
    if (!canUndo.value) return
    
    const action = state.history.actions[state.history.currentIndex]
    applyUndoAction(action)
    state.history.currentIndex--
    state.currentProtocol.modified = new Date()
    saveProtocolState()
  }

  const redo = () => {
    if (!canRedo.value) return
    
    state.history.currentIndex++
    const action = state.history.actions[state.history.currentIndex]
    applyRedoAction(action)
    state.currentProtocol.modified = new Date()
    saveProtocolState()
  }

  const applyUndoAction = (action: HistoryAction) => {
    switch (action.type) {
      case 'add':
        if (action.stepId) {
          const index = state.currentProtocol.steps.findIndex(step => step.id === action.stepId)
          if (index !== -1) {
            state.currentProtocol.steps.splice(index, 1)
          }
        }
        break
      
      case 'remove':
        if (action.step && action.fromIndex !== undefined) {
          state.currentProtocol.steps.splice(action.fromIndex, 0, action.step)
        }
        break
      
      case 'edit':
        if (action.stepId && action.previousValue) {
          const index = state.currentProtocol.steps.findIndex(step => step.id === action.stepId)
          if (index !== -1) {
            state.currentProtocol.steps[index] = { ...action.previousValue }
          }
        }
        break
      
      case 'move':
        if (action.fromIndex !== undefined && action.toIndex !== undefined) {
          // Reverse the move
          moveStepWithoutHistory(action.toIndex, action.fromIndex)
        }
        break
      
      case 'clear':
        if (action.previousValue) {
          state.currentProtocol.steps = [...action.previousValue]
        }
        break
    }
  }

  const applyRedoAction = (action: HistoryAction) => {
    switch (action.type) {
      case 'add':
        if (action.step) {
          state.currentProtocol.steps.push(action.step)
        }
        break
      
      case 'remove':
        if (action.stepId) {
          const index = state.currentProtocol.steps.findIndex(step => step.id === action.stepId)
          if (index !== -1) {
            state.currentProtocol.steps.splice(index, 1)
          }
        }
        break
      
      case 'edit':
        if (action.stepId && action.newValue) {
          const index = state.currentProtocol.steps.findIndex(step => step.id === action.stepId)
          if (index !== -1) {
            state.currentProtocol.steps[index] = { ...action.newValue }
          }
        }
        break
      
      case 'move':
        if (action.fromIndex !== undefined && action.toIndex !== undefined) {
          moveStepWithoutHistory(action.fromIndex, action.toIndex)
        }
        break
      
      case 'clear':
        state.currentProtocol.steps = []
        break
    }
  }

  const moveStepWithoutHistory = (fromIndex: number, toIndex: number) => {
    const step = state.currentProtocol.steps[fromIndex]
    state.currentProtocol.steps.splice(fromIndex, 1)
    state.currentProtocol.steps.splice(toIndex, 0, step)
  }

  // Enhanced protocol validation
  const validateProtocol = () => {
    state.isValidating = true
    state.validationErrors = []
    
    try {
      // Individual step validation
      state.currentProtocol.steps.forEach((step, index) => {
        const errors = validateStep(step, index)
        state.validationErrors.push(...errors)
      })
      
      // Protocol-wide validations
      validateProtocolFlow()
      
    } finally {
      state.isValidating = false
    }
  }
  
  // Protocol flow validation
  const validateProtocolFlow = () => {
    const steps = state.currentProtocol.steps
    
    if (steps.length === 0) {
      state.validationErrors.push({
        stepId: 'protocol',
        stepIndex: -1,
        rule: {
          id: 'empty-protocol',
          name: 'Empty Protocol',
          type: 'warning',
          check: () => false,
          message: () => 'Protocol has no steps defined'
        },
        message: 'Protocol has no steps defined',
        type: 'warning'
      })
      return
    }
    
    // Check for orphaned wash steps
    steps.forEach((step, index) => {
      if (step.task.toLowerCase().includes('wash') && index === 0) {
        state.validationErrors.push({
          stepId: step.id,
          stepIndex: index,
          rule: {
            id: 'orphaned-wash',
            name: 'Orphaned Wash Step',
            type: 'warning',
            check: () => false,
            message: () => 'Wash step at beginning of protocol may be unnecessary'
          },
          message: 'Wash step at beginning of protocol may be unnecessary',
          type: 'warning'
        })
      }
    })
    
    // Check protocol efficiency
    const transferSteps = steps.filter(s => s.task.toLowerCase().includes('transfer'))
    const washSteps = steps.filter(s => s.task.toLowerCase().includes('wash'))
    
    if (transferSteps.length > 5 && washSteps.length === 0) {
      state.validationErrors.push({
        stepId: 'protocol',
        stepIndex: -1,
        rule: {
          id: 'missing-wash-steps',
          name: 'Missing Wash Steps',
          type: 'warning',
          check: () => false,
          message: () => 'Protocol with many transfers should include tip washing for accuracy'
        },
        message: 'Protocol with many transfers should include tip washing for accuracy',
        type: 'warning'
      })
    }
    
    // Check for excessive protocol length
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)
    if (totalDuration > 3600) { // More than 1 hour
      state.validationErrors.push({
        stepId: 'protocol',
        stepIndex: -1,
        rule: {
          id: 'long-protocol',
          name: 'Long Protocol Duration',
          type: 'warning',
          check: () => false,
          message: () => `Protocol duration is ${Math.round(totalDuration/60)} minutes. Consider breaking into smaller protocols.`
        },
        message: `Protocol duration is ${Math.round(totalDuration/60)} minutes. Consider breaking into smaller protocols.`,
        type: 'warning'
      })
    }
  }

  const validateStep = (step: LiquidHandlerStep, stepIndex: number): ValidationError[] => {
    const errors: ValidationError[] = []
    
    // Task-specific validation based on task type
    const taskType = step.task.toLowerCase()
    
    // Transfer validation
    if (taskType.includes('transfer') || taskType.includes('aspirate') || taskType.includes('dispense')) {
      if (!step.source && (taskType.includes('transfer') || taskType.includes('aspirate'))) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'transfer-source-required',
            name: 'Source Position Required',
            type: 'error',
            check: () => false,
            message: () => `${step.task} operations require a source position`
          },
          message: `${step.task} operations require a source position`,
          type: 'error'
        })
      }
      
      if (!step.destination && (taskType.includes('transfer') || taskType.includes('dispense'))) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'transfer-destination-required',
            name: 'Destination Position Required',
            type: 'error',
            check: () => false,
            message: () => `${step.task} operations require a destination position`
          },
          message: `${step.task} operations require a destination position`,
          type: 'error'
        })
      }
      
      if (!step.volume || step.volume <= 0) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'volume-required',
            name: 'Volume Required',
            type: 'error',
            check: () => false,
            message: () => `${step.task} operations require a valid volume`
          },
          message: `${step.task} operations require a valid volume`,
          type: 'error'
        })
      }
      
      // Volume range validation
      if (step.volume && (step.volume > 1000 || step.volume < 0.1)) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'volume-range-warning',
            name: 'Volume Out of Range',
            type: 'warning',
            check: () => false,
            message: () => 'Volume should be between 0.1µL and 1000µL for typical liquid handlers'
          },
          message: 'Volume should be between 0.1µL and 1000µL for typical liquid handlers',
          type: 'warning'
        })
      }
      
      // Check for same source and destination
      if (step.source && step.destination && step.source === step.destination) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'same-position-error',
            name: 'Same Source and Destination',
            type: 'error',
            check: () => false,
            message: () => 'Source and destination positions cannot be the same'
          },
          message: 'Source and destination positions cannot be the same',
          type: 'error'
        })
      }
    }
    
    // Prime/Wash Tips validation
    if (taskType.includes('prime') || taskType.includes('wash')) {
      // These operations typically don't need source/destination but might benefit from warnings
      if (step.volume && step.volume > 500) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'tip-operation-volume-warning',
            name: 'High Volume for Tip Operation',
            type: 'warning',
            check: () => false,
            message: () => 'Tip operations typically use lower volumes (<500µL)'
          },
          message: 'Tip operations typically use lower volumes (<500µL)',
          type: 'warning'
        })
      }
      
      // Warn if tip operations have positions defined (unusual)
      if (step.source || step.destination) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'tip-operation-position-warning',
            name: 'Unusual Position for Tip Operation',
            type: 'warning',
            check: () => false,
            message: () => 'Tip operations typically don\'t require specific deck positions'
          },
          message: 'Tip operations typically don\'t require specific deck positions',
          type: 'warning'
        })
      }
    }
    
    // Mix validation
    if (taskType.includes('mix')) {
      if (!step.source && !step.destination) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'mix-position-required',
            name: 'Mix Position Required',
            type: 'error',
            check: () => false,
            message: () => 'Mix operations require a position to mix at'
          },
          message: 'Mix operations require a position to mix at',
          type: 'error'
        })
      }
      
      if (!step.volume || step.volume <= 0) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'mix-volume-required',
            name: 'Mix Volume Required',
            type: 'error',
            check: () => false,
            message: () => 'Mix operations require a volume to mix'
          },
          message: 'Mix operations require a volume to mix',
          type: 'error'
        })
      }
      
      // Mix cycles parameter
      if (step.parameters?.cycles && (step.parameters.cycles < 1 || step.parameters.cycles > 50)) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'mix-cycles-range',
            name: 'Mix Cycles Out of Range',
            type: 'warning',
            check: () => false,
            message: () => 'Mix cycles should typically be between 1 and 50'
          },
          message: 'Mix cycles should typically be between 1 and 50',
          type: 'warning'
        })
      }
    }
    
    // General duration validation
    if (step.duration <= 0) {
      errors.push({
        stepId: step.id,
        stepIndex: stepIndex,
        rule: {
          id: 'invalid-duration',
          name: 'Invalid Duration',
          type: 'error',
          check: () => false,
          message: () => 'Step duration must be greater than 0'
        },
        message: 'Step duration must be greater than 0',
        type: 'error'
      })
    }
    
    // Duration reasonableness check
    if (step.duration > 300) { // More than 5 minutes
      errors.push({
        stepId: step.id,
        stepIndex: stepIndex,
        rule: {
          id: 'long-duration-warning',
          name: 'Long Duration Warning',
          type: 'warning',
          check: () => false,
          message: () => 'Step duration is unusually long (>5 minutes). Verify this is correct.'
        },
        message: 'Step duration is unusually long (>5 minutes). Verify this is correct.',
        type: 'warning'
      })
    }
    
    // Protocol-level validations (check against other steps)
    const protocolSteps = state.currentProtocol.steps
    
    // Check for potential tip contamination (transfer without wash)
    if (taskType.includes('transfer') && stepIndex > 0) {
      const previousStep = protocolSteps[stepIndex - 1]
      if (previousStep?.task.toLowerCase().includes('transfer') && 
          !previousStep?.task.toLowerCase().includes('wash') &&
          step.source !== previousStep.destination) {
        errors.push({
          stepId: step.id,
          stepIndex: stepIndex,
          rule: {
            id: 'potential-contamination',
            name: 'Potential Cross-Contamination',
            type: 'warning',
            check: () => false,
            message: () => 'Consider washing tips between transfers from different sources'
          },
          message: 'Consider washing tips between transfers from different sources',
          type: 'warning'
        })
      }
    }
    
    // Check for efficient tip usage (prime tips at start)
    if (stepIndex === 0 && !taskType.includes('prime')) {
      errors.push({
        stepId: step.id,
        stepIndex: stepIndex,
        rule: {
          id: 'missing-prime-tips',
          name: 'Missing Tip Priming',
          type: 'warning',
          check: () => false,
          message: () => 'Consider starting protocol with "Prime Tips" for better accuracy'
        },
        message: 'Consider starting protocol with "Prime Tips" for better accuracy',
        type: 'warning'
      })
    }
    
    return errors
  }

  // Execution control
  const startExecution = () => {
    state.execution.isRunning = true
    state.execution.isPaused = false
    state.execution.currentStepIndex = 0
    state.execution.startTime = new Date()
  }

  const pauseExecution = () => {
    if (state.execution.isRunning && !state.execution.isPaused) {
      state.execution.isPaused = true
      state.execution.pausedTime = new Date()
    }
  }

  const resumeExecution = () => {
    if (state.execution.isRunning && state.execution.isPaused && state.execution.pausedTime) {
      const pauseDuration = Date.now() - state.execution.pausedTime.getTime()
      state.execution.totalPausedDuration += pauseDuration
      state.execution.isPaused = false
      state.execution.pausedTime = undefined
    }
  }

  const stopExecution = () => {
    state.execution.isRunning = false
    state.execution.isPaused = false
    state.execution.currentStepIndex = -1
    state.execution.startTime = undefined
    state.execution.pausedTime = undefined
    state.execution.totalPausedDuration = 0
  }

  // Persistence with enhanced error handling
  const isLocalStorageAvailable = (): boolean => {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, 'test')
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  const saveProtocolState = () => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, protocol state will not persist')
      return
    }

    try {
      const stateToSave = {
        version: '1.0.0', // For future migration support
        currentProtocol: state.currentProtocol,
        history: state.history,
        timestamp: new Date().toISOString()
      }
      const serialized = JSON.stringify(stateToSave)
      
      // Check for quota exceeded
      if (serialized.length > 5000000) { // ~5MB limit
        console.warn('Protocol state too large, trimming history')
        const trimmedState = {
          ...stateToSave,
          history: {
            ...state.history,
            actions: state.history.actions.slice(-10) // Keep only last 10 actions
          }
        }
        localStorage.setItem('liquid-handler-protocol-state', JSON.stringify(trimmedState))
      } else {
        localStorage.setItem('liquid-handler-protocol-state', serialized)
      }
    } catch (error) {
      console.warn('Failed to save protocol state to localStorage:', error)
      // Fallback: try to save minimal state
      try {
        const minimalState = {
          currentProtocol: {
            id: state.currentProtocol.id,
            name: state.currentProtocol.name,
            steps: state.currentProtocol.steps
          }
        }
        localStorage.setItem('liquid-handler-protocol-state-minimal', JSON.stringify(minimalState))
      } catch (fallbackError) {
        console.error('Complete localStorage failure:', fallbackError)
      }
    }
  }

  const loadProtocolState = () => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, using default protocol state')
      return
    }

    try {
      const saved = localStorage.getItem('liquid-handler-protocol-state')
      if (saved) {
        const data = JSON.parse(saved)
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format')
        }
        
        if (data.currentProtocol && validateProtocolData(data.currentProtocol)) {
          state.currentProtocol = {
            ...data.currentProtocol,
            created: new Date(data.currentProtocol.created),
            modified: new Date(data.currentProtocol.modified)
          }
        }
        
        if (data.history && validateHistoryData(data.history)) {
          state.history = {
            ...data.history,
            actions: data.history.actions.map((action: any) => ({
              ...action,
              timestamp: new Date(action.timestamp)
            }))
          }
        }
      } else {
        // Try loading minimal fallback state
        const minimal = localStorage.getItem('liquid-handler-protocol-state-minimal')
        if (minimal) {
          const minimalData = JSON.parse(minimal)
          if (minimalData.currentProtocol && validateProtocolData(minimalData.currentProtocol)) {
            state.currentProtocol = {
              ...minimalData.currentProtocol,
              created: new Date(),
              modified: new Date()
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load protocol state from localStorage:', error)
      console.info('Using default protocol state')
      // Clear corrupted data
      try {
        localStorage.removeItem('liquid-handler-protocol-state')
        localStorage.removeItem('liquid-handler-protocol-state-minimal')
      } catch (clearError) {
        console.warn('Could not clear corrupted localStorage data:', clearError)
      }
    }
  }

  // Data validation helpers
  const validateProtocolData = (protocol: any): boolean => {
    return protocol &&
           typeof protocol.id === 'string' &&
           typeof protocol.name === 'string' &&
           Array.isArray(protocol.steps)
  }

  const validateHistoryData = (history: any): boolean => {
    return history &&
           Array.isArray(history.actions) &&
           typeof history.currentIndex === 'number' &&
           typeof history.maxSize === 'number'
  }

  const resetProtocol = () => {
    state.currentProtocol = {
      id: generateStepId(),
      name: 'New Protocol',
      description: '',
      steps: [],
      created: new Date(),
      modified: new Date()
    }
    state.history = {
      actions: [],
      currentIndex: -1,
      maxSize: 50
    }
    state.validationErrors = []
    stopExecution()
    saveProtocolState()
  }

  // Computed values
  const totalProtocolDuration = computed(() => {
    return state.currentProtocol.steps.reduce((total, step) => total + step.duration, 0)
  })

  const hasValidationErrors = computed(() => {
    return state.validationErrors.some(error => error.type === 'error')
  })

  const hasValidationWarnings = computed(() => {
    return state.validationErrors.some(error => error.type === 'warning')
  })

  return {
    // State
    ...toRefs(state),
    
    // Computed
    canUndo,
    canRedo,
    totalProtocolDuration,
    hasValidationErrors,
    hasValidationWarnings,
    
    // Methods
    addStep,
    removeStep,
    editStep,
    moveStep,
    clearProtocol,
    undo,
    redo,
    validateProtocol,
    startExecution,
    pauseExecution,
    resumeExecution,
    stopExecution,
    saveProtocolState,
    loadProtocolState,
    resetProtocol
  }
}