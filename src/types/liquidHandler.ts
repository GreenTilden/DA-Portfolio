// Liquid Handler specific types
export interface LabwareItem {
  id: string
  name: string
  icon: string
  maxVolume: number
  currentVolume?: number
}

export interface DeckPosition {
  id: string
  label: string
  x: number
  y: number
  labware: LabwareItem | null
}

export interface TransferStep {
  name: string
  source: string
  destination: string
  volume: number
  duration?: number
  color?: string
}

export interface LiquidHandlerProtocol {
  id: string
  name: string
  description: string
  steps: TransferStep[]
}

export interface ProtocolValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Extended types for Protocol Builder
export interface LiquidHandlerStep {
  id: string
  type: string           // Instrument type (always 'Liquid Handler' for this demo)
  task: string           // Task name (Transfer, Prime Tips, etc.)
  source?: string        // Source deck position ID
  destination?: string   // Destination deck position ID
  volume?: number        // Volume in µL
  duration: number       // Duration in minutes
  color?: string         // Color from INSTRUMENT_COLOR_SCHEMES
  parameters?: Record<string, any> // Additional task-specific parameters
}

export interface ProtocolSequence {
  id: string
  name: string
  description?: string
  steps: LiquidHandlerStep[]
  created: Date
  modified: Date
}

export interface HistoryAction {
  type: 'add' | 'remove' | 'move' | 'edit' | 'clear'
  stepId?: string
  step?: LiquidHandlerStep
  fromIndex?: number
  toIndex?: number
  previousValue?: any
  newValue?: any
  timestamp: Date
}

export interface ProtocolHistory {
  actions: HistoryAction[]
  currentIndex: number
  maxSize: number
}

export interface ExecutionState {
  isRunning: boolean
  isPaused: boolean
  currentStepIndex: number
  startTime?: Date
  pausedTime?: Date
  totalPausedDuration: number
}

export interface ValidationRule {
  id: string
  name: string
  type: 'error' | 'warning'
  check: (step: LiquidHandlerStep, sequence: ProtocolSequence, deckPositions: DeckPosition[]) => boolean
  message: (step: LiquidHandlerStep) => string
}

export interface ValidationError {
  stepId: string
  stepIndex: number
  rule: ValidationRule
  message: string
  type: 'error' | 'warning'
}