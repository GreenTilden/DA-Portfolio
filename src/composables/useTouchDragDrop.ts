import { ref, reactive } from 'vue'
import type { DragItem, Step } from '@/types/workflow'

interface TouchState {
  isDragging: boolean
  draggedItem: DragItem | null
  dragClone: HTMLElement | null
  startPosition: { x: number; y: number } | null
}

export function useTouchDragDrop() {
  const touchState = reactive<TouchState>({
    isDragging: false,
    draggedItem: null,
    dragClone: null,
    startPosition: null
  })

  const createDragClone = (element: HTMLElement, touch: Touch): HTMLElement => {
    const rect = element.getBoundingClientRect()
    
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.position = 'fixed'
    clone.style.width = rect.width + 'px'
    clone.style.height = rect.height + 'px'
    clone.style.left = (touch.clientX - rect.width / 2) + 'px'
    clone.style.top = (touch.clientY - rect.height / 2) + 'px'
    clone.style.zIndex = '9999'
    clone.style.opacity = '0.8'
    clone.style.pointerEvents = 'none'
    clone.style.transform = 'scale(1.1) rotate(2deg)'
    clone.style.transition = 'transform 0.2s'
    clone.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)'
    
    document.body.appendChild(clone)
    return clone
  }

  const updateClonePosition = (clone: HTMLElement, touch: Touch) => {
    const rect = clone.getBoundingClientRect()
    clone.style.left = (touch.clientX - rect.width / 2) + 'px'
    clone.style.top = (touch.clientY - rect.height / 2) + 'px'
  }

  const findDropTarget = (touch: Touch, clone: HTMLElement) => {
    // Temporarily hide clone to get element underneath
    clone.style.display = 'none'
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    clone.style.display = ''

    // Find workflow lane container
    const laneSteps = elementBelow?.closest('.lane-steps')
    if (laneSteps) {
      const lane = laneSteps.closest('.workflow-lane')
      const workflow = lane?.closest('.workflow-container')
      
      if (lane && workflow) {
        // Extract IDs from data attributes
        const laneId = lane.getAttribute('data-lane-id')
        const workflowId = workflow.getAttribute('data-workflow-id')
        
        // Calculate insertion index based on position
        const steps = Array.from(laneSteps.querySelectorAll('.workflow-step'))
        let insertIndex = steps.length // Default to end
        
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i] as HTMLElement
          const rect = step.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          
          if (touch.clientX < centerX) {
            insertIndex = i
            break
          }
        }
        
        return {
          workflowId,
          laneId,
          insertIndex,
          laneSteps: laneSteps as HTMLElement
        }
      }
    }
    
    return null
  }

  const handleTouchStart = (
    event: TouchEvent, 
    dragItem: DragItem,
    element?: HTMLElement
  ) => {
    event.preventDefault()
    
    const touch = event.touches[0]
    const targetElement = element || (event.target as HTMLElement)
    
    touchState.isDragging = true
    touchState.draggedItem = dragItem
    touchState.startPosition = { x: touch.clientX, y: touch.clientY }
    touchState.dragClone = createDragClone(targetElement, touch)
    
    // Add haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const handleTouchMove = (event: TouchEvent) => {
    event.preventDefault()
    
    if (!touchState.isDragging || !touchState.dragClone) return
    
    const touch = event.touches[0]
    updateClonePosition(touchState.dragClone, touch)
    
    // Add visual feedback for valid drop zones
    const dropTarget = findDropTarget(touch, touchState.dragClone)
    
    // Remove previous drop indicators
    document.querySelectorAll('.touch-drop-indicator').forEach(el => el.remove())
    
    if (dropTarget?.laneSteps) {
      const indicator = document.createElement('div')
      indicator.className = 'touch-drop-indicator'
      indicator.style.cssText = `
        position: absolute;
        width: 4px;
        height: 50px;
        background: #4a90e2;
        border-radius: 2px;
        margin: 0 8px;
        animation: pulse 1s infinite;
        z-index: 10000;
      `
      
      const steps = dropTarget.laneSteps.querySelectorAll('.workflow-step')
      if (dropTarget.insertIndex < steps.length) {
        steps[dropTarget.insertIndex].before(indicator)
      } else if (steps.length > 0) {
        steps[steps.length - 1].after(indicator)
      } else {
        dropTarget.laneSteps.appendChild(indicator)
      }
    }
  }

  const handleTouchEnd = (
    event: TouchEvent,
    onDrop?: (dropTarget: any, dragItem: DragItem) => void
  ) => {
    event.preventDefault()
    
    if (!touchState.isDragging || !touchState.dragClone || !touchState.draggedItem) {
      cleanup()
      return null
    }
    
    const touch = event.changedTouches[0]
    const dropTarget = findDropTarget(touch, touchState.dragClone)
    
    let result = null
    if (dropTarget && onDrop) {
      onDrop(dropTarget, touchState.draggedItem)
      result = dropTarget
      
      // Success haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 30, 30])
      }
    }
    
    cleanup()
    return result
  }

  const cleanup = () => {
    if (touchState.dragClone) {
      touchState.dragClone.remove()
    }
    
    // Remove touch drop indicators
    document.querySelectorAll('.touch-drop-indicator').forEach(el => el.remove())
    
    touchState.isDragging = false
    touchState.draggedItem = null
    touchState.dragClone = null
    touchState.startPosition = null
  }

  return {
    touchState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    cleanup
  }
}