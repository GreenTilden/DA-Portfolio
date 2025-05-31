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
      // Then by step index within workflow
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
    
    tasks.forEach(task => {
      // Find earliest start time considering dependencies
      let earliestStart = 0
      
      task.dependencies.forEach(depId => {
        if (taskCompletionTimes[depId]) {
          earliestStart = Math.max(earliestStart, taskCompletionTimes[depId])
        }
      })
      
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
      
      // Find the nest that can start earliest
      nests.forEach((nestAvailable, nestIndex) => {
        const possibleStart = Math.max(earliestStart, nestAvailable)
        if (possibleStart < startTime) {
          startTime = possibleStart
          selectedNest = nestIndex
        }
      })
      
      // Update availability
      instrumentAvailability[instrument][selectedNest] = startTime + task.duration
      taskCompletionTimes[task.id] = startTime + task.duration
      
      // Add to schedule
      schedule.push({
        ...task,
        startTime,
        endTime: startTime + task.duration,
        nest: selectedNest,
        instrument: `${instrument} ${selectedNest + 1}`,
        conflict: false
      })
    })
    
    return schedule
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
    // Find all liquid handler tasks in the same workflow
    const workflowLHTasks = allTasks.filter(
      t => t.workflowId === task.workflowId && 
           t.type === 'Liquid Handler'
    )
    
    if (workflowLHTasks.length <= 1) {
      return earliestStart
    }
    
    // Find the latest start time among already scheduled LH tasks
    const scheduledLHStarts = workflowLHTasks
      .filter(t => t.id !== task.id && taskCompletionTimes[t.id])
      .map(t => taskCompletionTimes[t.id] - t.duration)
    
    if (scheduledLHStarts.length > 0) {
      return Math.max(earliestStart, ...scheduledLHStarts)
    }
    
    return earliestStart
  }
  
  /**
   * Detect scheduling conflicts
   */
  private detectConflicts(schedule: ScheduledTask[]): void {
    schedule.forEach((task1, i) => {
      schedule.forEach((task2, j) => {
        if (i !== j && task1.instrument === task2.instrument) {
          // Check for time overlap
          if (task1.startTime < task2.endTime && task2.startTime < task1.endTime) {
            task1.conflict = true
            task2.conflict = true
          }
        }
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