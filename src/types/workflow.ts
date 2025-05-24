// Core workflow types
export interface Step {
  id: string
  type: string
  task: string
  duration: number
  customIcon?: string
}

export interface Lane {
  id: string
  name: string
  isEditingName: boolean
  editName: string
  steps: Step[]
}

export interface Workflow {
  id: string
  name: string
  priority: number
  isEditingName: boolean
  editName: string
  lanes: Lane[]
}

// Instrument and task types
export interface InstrumentTask {
  id: string
  type: string
  task: string
  duration: number
  customIcon?: string
}

export interface InstrumentConfig {
  nests: number
}

export interface CustomTask extends InstrumentTask {
  id: string
}

// Schedule and optimization types
export interface ScheduledTask {
  id: string
  workflowId: string
  workflowName: string
  workflowPriority: number
  laneId: string
  laneName: string
  stepIndex: number
  type: string
  task: string
  duration: number
  dependencies: string[]
  startTime: number
  endTime: number
  nest: number
  instrument: string
  conflict: boolean
}

export interface Metrics {
  totalTime: number
  conflicts: number
  utilization: number
}

// Drag and drop types
export interface DragItem extends Step {
  isExistingStep?: boolean
}

// Icon type
export interface IconOption {
  name: string
  class: string
}