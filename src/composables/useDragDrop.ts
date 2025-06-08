import { ref } from 'vue'
import type { DragItem, Step } from '@/types/workflow'

export function useDragDrop() {
  const currentDragItem = ref<DragItem | null>(null)
  const dragOverElement = ref<HTMLElement | null>(null)

  // Start dragging
  const onDragStart = (event: DragEvent, item: DragItem | Step | any, isExistingStep = false) => {
    const dragData = { ...item, isExistingStep }
    currentDragItem.value = dragData as DragItem
    
    if (event.dataTransfer && event.target) {
      const preview = createDragPreview(event.target as HTMLElement)
      document.body.appendChild(preview)
      event.dataTransfer.setDragImage(preview, 0, 0)
      setTimeout(() => document.body.removeChild(preview), 0)
      
      event.dataTransfer.effectAllowed = isExistingStep ? 'move' : 'copy'
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData))
      event.dataTransfer.setData('application/json', JSON.stringify(dragData))
    }
  }

  // Handle drag over
  const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = currentDragItem.value?.isExistingStep ? 'move' : 'copy'
    }
  }

  // Handle drag enter
  const onDragEnter = (event: DragEvent) => {
    const target = event.currentTarget as HTMLElement
    if (target) {
      target.classList.add('drag-over')
      dragOverElement.value = target
    }
  }

  // Handle drag leave
  const onDragLeave = (event: DragEvent) => {
    const target = event.currentTarget as HTMLElement
    const relatedTarget = event.relatedTarget as HTMLElement
    
    // Only remove the class if we're leaving the container entirely
    if (target && (!relatedTarget || !target.contains(relatedTarget))) {
      target.classList.remove('drag-over')
      if (dragOverElement.value === target) {
        dragOverElement.value = null
      }
    }
  }

  // Handle drop
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    
    const target = event.currentTarget as HTMLElement
    if (target) {
      target.classList.remove('drag-over')
    }
    
    const draggedItem = currentDragItem.value
    currentDragItem.value = null
    dragOverElement.value = null
    
    return draggedItem
  }

  // Find closest element for drop indicator
  const findClosestElement = (event: DragEvent, selector: string): HTMLElement | null => {
    const container = event.currentTarget as HTMLElement
    if (!container) return null
    
    const elements = Array.from(container.querySelectorAll(selector))
    if (elements.length === 0) return null
    
    const mouseX = event.clientX
    
    return elements.reduce((closest, element) => {
      const box = element.getBoundingClientRect()
      const centerX = box.left + box.width / 2
      const distance = Math.abs(mouseX - centerX)
      
      if (!closest || distance < (closest as any).distance) {
        return { element, distance } as any
      }
      return closest
    }, null as any)?.element || null
  }

  // Add drag preview styling
  const createDragPreview = (element: HTMLElement): HTMLElement => {
    const preview = element.cloneNode(true) as HTMLElement
    preview.style.opacity = '0.8'
    preview.style.transform = 'rotate(2deg)'
    preview.style.pointerEvents = 'none'
    return preview
  }

  // Create drop indicator with different colors for move vs add
  const createDropIndicator = (isMoving = false): HTMLDivElement => {
    const indicator = document.createElement('div')
    indicator.className = isMoving ? 'drop-indicator drop-indicator-move' : 'drop-indicator drop-indicator-add'
    return indicator
  }

  // Remove all drop indicators
  const removeDropIndicators = () => {
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove())
  }

  // Handle drag over with drop indicators
  const onDragOverWithIndicator = (event: DragEvent, stepSelector = '.workflow-step') => {
    onDragOver(event)
    
    const container = event.currentTarget as HTMLElement
    if (!container) return
    
    // Check if we're moving an existing step
    const isMoving = currentDragItem.value?.isExistingStep || false
    
    const closestElement = findClosestElement(event, stepSelector)
    removeDropIndicators()
    
    if (closestElement) {
      const rect = closestElement.getBoundingClientRect()
      const midpoint = rect.left + rect.width / 2
      const indicator = createDropIndicator(isMoving)
      
      if (event.clientX < midpoint) {
        closestElement.before(indicator)
      } else {
        closestElement.after(indicator)
      }
    } else if (container.querySelectorAll(stepSelector).length === 0) {
      // If no steps exist, add indicator to the container
      const indicator = createDropIndicator(isMoving)
      container.appendChild(indicator)
    }
  }

  // Clean up on drag end
  const onDragEnd = () => {
    currentDragItem.value = null
    dragOverElement.value = null
    removeDropIndicators()
    
    // Remove any lingering drag-over classes
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over')
    })
  }

  // Helper to extract source information from drag data
  const extractSourceInfo = (dragData: any) => {
    if (!dragData || !dragData.isExistingStep) return null
    
    return {
      stepId: dragData.id,
      sourceWorkflowId: dragData.sourceWorkflowId,
      sourceLaneId: dragData.sourceLaneId,
      sourceIndex: dragData.sourceIndex
    }
  }

  // Helper to move step between or within lanes
  const moveStep = (
    workflows: any[], 
    sourceInfo: { 
      stepId: string, 
      sourceWorkflowId: string, 
      sourceLaneId: string, 
      sourceIndex: number 
    },
    targetWorkflowId: string,
    targetLaneId: string,
    targetIndex: number
  ) => {
    // Find source workflow and lane
    const sourceWorkflow = workflows.find(w => w.id === sourceInfo.sourceWorkflowId)
    if (!sourceWorkflow) return false
    
    const sourceLane = sourceWorkflow.lanes.find((l: any) => l.id === sourceInfo.sourceLaneId)
    if (!sourceLane) return false
    
    // Find target workflow and lane
    const targetWorkflow = workflows.find(w => w.id === targetWorkflowId)
    if (!targetWorkflow) return false
    
    const targetLane = targetWorkflow.lanes.find((l: any) => l.id === targetLaneId)
    if (!targetLane) return false
    
    // Remove step from source
    const [movedStep] = sourceLane.steps.splice(sourceInfo.sourceIndex, 1)
    if (!movedStep) return false
    
    // Adjust target index if moving within same lane and target is after source
    let adjustedTargetIndex = targetIndex
    if (sourceInfo.sourceLaneId === targetLaneId && targetIndex > sourceInfo.sourceIndex) {
      adjustedTargetIndex--
    }
    
    // Insert step at target position
    targetLane.steps.splice(adjustedTargetIndex, 0, movedStep)
    
    return true
  }

  return {
    currentDragItem,
    dragOverElement,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onDragEnd,
    onDragOverWithIndicator,
    removeDropIndicators,
    findClosestElement,
    createDropIndicator,
    extractSourceInfo,
    moveStep
  }
}