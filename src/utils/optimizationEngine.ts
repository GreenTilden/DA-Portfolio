import type { Workflow, ScheduledTask, Metrics, InstrumentConfig } from '@/types/workflow'

interface TaskToSchedule {
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
}

interface InstrumentAvailability {
  [instrument: string]: number[] // Array of nest availability times
}

export class OptimizationEngine {
  private instrumentConfig: Record<string, InstrumentConfig>
  
  constructor(instrumentConfig: Record<string, InstrumentConfig>) {
    this.instrumentConfig = instrumentConfig
  }
  
  /**
   * Optimize the schedule for all workflows
   */
  optimizeSchedule(workflows: Workflow[]): {
    schedule: ScheduledTask[]
    metrics: Metrics
  } {
    // Add at beginning of function:
    if (!this.validateWorkflows(workflows)) {
      throw new Error('Invalid workflow configuration')
    }
    
    // Collect all tasks with metadata
    const allTasks = this.collectTasks(workflows)
    
    // Add liquid handler dependencies
    this.addLiquidHandlerDependencies(allTasks)
    
    // Sort tasks by priority and order
    this.sortTasksByPriority(allTasks)
    
    // Initialize instrument availability tracking
    const instrumentAvailability = this.initializeInstrumentAvailability()
    
    // Schedule tasks
    const schedule = this.scheduleTasks(allTasks, instrumentAvailability)
    
    // Detect conflicts
    this.detectConflicts(schedule)
    
    // Calculate metrics
    const metrics = this.calculateMetrics(schedule)
    
    return { schedule, metrics }
  }
  
  /**
   * Collect all tasks from workflows
   */
  private collectTasks(workflows: Workflow[]): TaskToSchedule[] {
    const tasks: TaskToSchedule[] = []
    
    workflows.forEach(workflow => {
      workflow.lanes.forEach(lane => {
        lane.steps.forEach((step, index) => {
          tasks.push({
            id: step.id,
            workflowId: workflow.id,
            workflowName: workflow.name,
            workflowPriority: workflow.priority,
            laneId: lane.id,
            laneName: lane.name,
            stepIndex: index,
            type: step.type,
            task: step.task,
            duration: step.duration,
            // Dependencies are previous steps in the same lane
            dependencies: lane.steps.slice(0, index).map(s => s.id)
          })
        })
      })
    })
    
    return tasks
  }
  
/**
 * Add dependencies between liquid handler tasks in the same workflow
 * Ensures liquid handler tasks are paired/synchronized
 */
private addLiquidHandlerDependencies(tasks: TaskToSchedule[]): void {
  const liquidHandlerTasks = tasks.filter(task => task.type === 'Liquid Handler')
  const liquidHandlersByWorkflow: Record<string, TaskToSchedule[]> = {}
  
  // Group by workflow
  liquidHandlerTasks.forEach(task => {
    if (!liquidHandlersByWorkflow[task.workflowId]) {
      liquidHandlersByWorkflow[task.workflowId] = []
    }
    liquidHandlersByWorkflow[task.workflowId].push(task)
  })
  
  // For each workflow, ensure liquid handler tasks are connected
  Object.values(liquidHandlersByWorkflow).forEach(workflowTasks => {
    if (workflowTasks.length > 1) {
      // Find all tasks with "Transfer" in their name
      const transferTasks = workflowTasks.filter(t => 
        t.task.toLowerCase().includes('transfer')
      )
      
      // If we have transfer tasks, they must be connected to at least one other LH task
      if (transferTasks.length > 0) {
        transferTasks.forEach(transferTask => {
          // Find the nearest non-transfer LH task in the same workflow
          const otherLHTasks = workflowTasks.filter(t => 
            t.id !== transferTask.id && !t.task.toLowerCase().includes('transfer')
          )
          
          if (otherLHTasks.length > 0) {
            // Add bidirectional dependencies to ensure they run together
            otherLHTasks.forEach(otherTask => {
              if (!transferTask.dependencies.includes(otherTask.id)) {
                transferTask.dependencies.push(otherTask.id)
              }
              if (!otherTask.dependencies.includes(transferTask.id)) {
                otherTask.dependencies.push(transferTask.id)
              }
            })
          } else {
            // If no other non-transfer tasks, connect all transfer tasks together
            const otherTransferTasks = transferTasks.filter(t => t.id !== transferTask.id)
            otherTransferTasks.forEach(otherTask => {
              if (!transferTask.dependencies.includes(otherTask.id)) {
                transferTask.dependencies.push(otherTask.id)
              }
            })
          }
        })
      } else {
        // Original logic for non-transfer liquid handler tasks
        workflowTasks.forEach(task => {
          const otherTaskIds = workflowTasks
            .filter(t => t.id !== task.id)
            .map(t => t.id)
          
          otherTaskIds.forEach(depId => {
            if (!task.dependencies.includes(depId)) {
              task.dependencies.push(depId)
            }
          })
        })
      }
    }
  })
}
  
  /**
   * Sort tasks by workflow priority and step order
   */
  private sortTasksByPriority(tasks: TaskToSchedule[]): void {
    tasks.sort((a, b) => {
      // First sort by workflow priority (lower number = higher priority)
      if (a.workflowPriority !== b.workflowPriority) {
        return a.workflowPriority - b.workflowPriority
      }
      // Then by lane within the same workflow
      if (a.laneId !== b.laneId) {
        return a.laneId.localeCompare(b.laneId)
      }
      // Then by step index within the same lane
      return a.stepIndex - b.stepIndex
    })
  }
  
  /**
   * Initialize instrument availability tracking
   */
  private initializeInstrumentAvailability(): InstrumentAvailability {
    const availability: InstrumentAvailability = {}
    
    Object.entries(this.instrumentConfig).forEach(([instrument, config]) => {
      availability[instrument] = Array(config.nests).fill(0)
    })
    
    return availability
  }
  
  /**
   * Schedule tasks considering dependencies and instrument availability
   */
  private scheduleTasks(
    tasks: TaskToSchedule[], 
    instrumentAvailability: InstrumentAvailability
  ): ScheduledTask[] {
    const schedule: ScheduledTask[] = []
    const taskCompletionTimes: Record<string, number> = {}
    const laneCompletionTimes: Record<string, number> = {}
    const laneScheduledTasks: Record<string, ScheduledTask[]> = {}
    
    tasks.forEach(task => {
      // Find earliest start time considering dependencies
      let earliestStart = 0
      
      // Check dependencies within the same lane
      task.dependencies.forEach(depId => {
        if (taskCompletionTimes[depId]) {
          earliestStart = Math.max(earliestStart, taskCompletionTimes[depId])
        }
      })
      
      // For tasks in the same lane, ensure they run sequentially
      if (laneCompletionTimes[task.laneId]) {
        earliestStart = Math.max(earliestStart, laneCompletionTimes[task.laneId])
      }
      
      // Special handling for liquid handler tasks
      if (task.type === 'Liquid Handler') {
        earliestStart = this.adjustForLiquidHandlerSync(
          task, 
          tasks, 
          taskCompletionTimes, 
          earliestStart
        )
      }
      
      // Find available instrument nest
      const instrument = task.type
      const nests = instrumentAvailability[instrument] || [0]
      let selectedNest = 0
      let startTime = Infinity
      
      // Find the nest that can start earliest, but not before earliestStart
      nests.forEach((nestAvailable, nestIndex) => {
        const possibleStart = Math.max(earliestStart, nestAvailable)
        if (possibleStart < startTime) {
          startTime = possibleStart
          selectedNest = nestIndex
        }
      })
      
      // Ensure task waits for instrument availability
      if (startTime === Infinity) {
        startTime = earliestStart
        selectedNest = 0
      }
      
      // CRITICAL: For sequential tasks in a lane, ensure they wait for instruments
      // A task cannot start until:
      // 1. The previous task in the lane is complete
      // 2. The required instrument has a nest available
      if (task.stepIndex > 0 && laneScheduledTasks[task.laneId]) {
        const previousTasksInLane = laneScheduledTasks[task.laneId]
        if (previousTasksInLane.length > 0) {
          const previousTask = previousTasksInLane[previousTasksInLane.length - 1]
          
          // Ensure task doesn't start before previous task completes
          startTime = Math.max(startTime, previousTask.endTime)
          
          // Ensure task waits for instrument availability
          const earliestInstrumentTime = instrumentAvailability[instrument][selectedNest]
          startTime = Math.max(startTime, earliestInstrumentTime)
        }
      }
      
      // Update availability - instrument will be busy until task completes
      // Add a small gap (1 minute) between tasks for visual clarity
      const gapTime = 1
      instrumentAvailability[instrument][selectedNest] = startTime + task.duration + gapTime
      taskCompletionTimes[task.id] = startTime + task.duration
      laneCompletionTimes[task.laneId] = startTime + task.duration + gapTime
      
      // Create scheduled task
      const scheduledTask: ScheduledTask = {
        ...task,
        startTime,
        endTime: startTime + task.duration,
        nest: selectedNest,
        instrument: `${instrument} ${selectedNest + 1}`,
        conflict: false
      }
      
      // Track scheduled tasks by lane for nest readiness checking
      if (!laneScheduledTasks[task.laneId]) {
        laneScheduledTasks[task.laneId] = []
      }
      laneScheduledTasks[task.laneId].push(scheduledTask)
      
      // Add to schedule
      schedule.push(scheduledTask)
    })
    
    return schedule
  }
  
  // Validate workflow before scheduling
  private validateWorkflows(workflows: Workflow[]): boolean {
    for (const workflow of workflows) {
      if (workflow.lanes.length === 0) {
        console.warn(`Workflow ${workflow.name} has no lanes`)
        return false
      }
      for (const lane of workflow.lanes) {
        if (lane.steps.some(step => step.duration <= 0)) {
          console.warn(`Invalid step duration in ${workflow.name}`)
          return false
        }
      }
    }
    return true
  }
  
  /**
   * Adjust timing for liquid handler tasks to ensure they start together
   */
  private adjustForLiquidHandlerSync(
    task: TaskToSchedule,
    allTasks: TaskToSchedule[],
    taskCompletionTimes: Record<string, number>,
    earliestStart: number
  ): number {
    // Find all liquid handler tasks in the same workflow that need to run together
    const workflowLHTasks = allTasks.filter(
      t => t.workflowId === task.workflowId && 
           t.type === 'Liquid Handler' &&
           (t.dependencies.includes(task.id) || task.dependencies.includes(t.id))
    )
    
    if (workflowLHTasks.length === 0) {
      return earliestStart
    }
    
    // Find the latest dependency completion time among related LH tasks
    let latestDependencyTime = earliestStart
    
    workflowLHTasks.forEach(lhTask => {
      lhTask.dependencies.forEach(depId => {
        if (taskCompletionTimes[depId] && depId !== task.id) {
          latestDependencyTime = Math.max(latestDependencyTime, taskCompletionTimes[depId])
        }
      })
    })
    
    return latestDependencyTime
  }
  
  /**
   * Detect scheduling conflicts
   */
  private detectConflicts(schedule: ScheduledTask[]): void {
    // Clear all conflict flags first
    schedule.forEach(task => task.conflict = false)
    
    // Group tasks by instrument and nest
    const instrumentNestTasks: Record<string, ScheduledTask[]> = {}
    
    schedule.forEach(task => {
      const key = `${task.type}_${task.nest}`
      if (!instrumentNestTasks[key]) {
        instrumentNestTasks[key] = []
      }
      instrumentNestTasks[key].push(task)
    })
    
    // Check for overlaps within each instrument/nest combination
    Object.values(instrumentNestTasks).forEach(nestTasks => {
      nestTasks.forEach((task1, i) => {
        nestTasks.forEach((task2, j) => {
          if (i !== j) {
            // Check for time overlap
            if (task1.startTime < task2.endTime && task2.startTime < task1.endTime) {
              task1.conflict = true
              task2.conflict = true
            }
          }
        })
      })
    })
  }
  
  /**
   * Calculate optimization metrics
   */
  private calculateMetrics(schedule: ScheduledTask[]): Metrics {
    // Total time
    const totalTime = schedule.length > 0 
      ? Math.max(...schedule.map(t => t.endTime))
      : 0
    
    // Count conflicts (each conflict is counted twice, so divide by 2)
    const conflicts = schedule.filter(t => t.conflict).length / 2
    
    // Calculate utilization
    let utilization = 0
    if (totalTime > 0) {
      const totalTaskTime = schedule.reduce((sum, task) => sum + task.duration, 0)
      const totalAvailableTime = Object.entries(this.instrumentConfig).reduce(
        (sum, [_, config]) => sum + (config.nests * totalTime),
        0
      )
      utilization = Math.round((totalTaskTime / totalAvailableTime) * 100)
    }
    
    return {
      totalTime,
      conflicts,
      utilization
    }
  }
  
  /**
   * Validate a schedule for correctness
   */
  validateSchedule(schedule: ScheduledTask[]): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    // Check for dependency violations
    const taskMap = new Map(schedule.map(t => [t.id, t]))
    
    schedule.forEach(task => {
      task.dependencies.forEach(depId => {
        const dep = taskMap.get(depId)
        if (dep && dep.endTime > task.startTime) {
          errors.push(
            `Task "${task.task}" starts before dependency "${dep.task}" completes`
          )
        }
      })
    })
    
    // Check for resource conflicts
    const conflictCount = schedule.filter(t => t.conflict).length
    if (conflictCount > 0) {
      errors.push(`${conflictCount / 2} scheduling conflicts detected`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Get bottleneck analysis
   */
  getBottleneckAnalysis(schedule: ScheduledTask[]): {
    instrument: string
    utilization: number
    waitTime: number
  }[] {
    const instrumentStats: Record<string, {
      totalTime: number
      busyTime: number
      tasks: number
    }> = {}
    
    // Calculate stats for each instrument type
    schedule.forEach(task => {
      const instrumentType = task.type
      
      if (!instrumentStats[instrumentType]) {
        instrumentStats[instrumentType] = {
          totalTime: 0,
          busyTime: 0,
          tasks: 0
        }
      }
      
      instrumentStats[instrumentType].busyTime += task.duration
      instrumentStats[instrumentType].tasks += 1
      instrumentStats[instrumentType].totalTime = Math.max(
        instrumentStats[instrumentType].totalTime,
        task.endTime
      )
    })
    
    // Calculate utilization and wait times
    const analysis = Object.entries(instrumentStats).map(([instrument, stats]) => {
      const nests = this.instrumentConfig[instrument]?.nests || 1
      const totalCapacity = stats.totalTime * nests
      const utilization = totalCapacity > 0 
        ? Math.round((stats.busyTime / totalCapacity) * 100)
        : 0
      
      const avgTaskDuration = stats.busyTime / stats.tasks
      const waitTime = stats.totalTime - avgTaskDuration
      
      return {
        instrument,
        utilization,
        waitTime: Math.round(waitTime)
      }
    })
    
    // Sort by utilization (highest first - likely bottlenecks)
    return analysis.sort((a, b) => b.utilization - a.utilization)
  }
}

/**
 * Create optimization engine instance
 */
export function createOptimizationEngine(
  instrumentConfig: Record<string, InstrumentConfig>
): OptimizationEngine {
  return new OptimizationEngine(instrumentConfig)
}

/**
 * Convenience function to optimize schedule
 */
export function optimizeSchedule(
  workflows: Workflow[], 
  instrumentConfig: Record<string, InstrumentConfig>
): { schedule: ScheduledTask[], metrics: Metrics } {
  const engine = new OptimizationEngine(instrumentConfig)
  return engine.optimizeSchedule(workflows)
}