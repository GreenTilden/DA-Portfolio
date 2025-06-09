import { reactive } from 'vue'
import type { DragItem } from '@/types/workflow'

interface TouchState {
  isDragging: boolean
  draggedItem: DragItem | null
  dragClone: HTMLElement | null
  startPosition: { x: number; y: number } | null
  currentDropTarget: any | null
  lastDropElement: HTMLElement | null
  touchStartTime: number | null
  dragStarted: boolean
  touchMoveThreshold: number
}

interface DragHandlers {
  handleDragOver: (event: any, workflowId: string, laneId: string) => void
  handleDrop: (event: any, workflowId: string, laneId: string) => void
  handleDragEnd: () => void
}

export function useTouchDragDrop(dragHandlers?: DragHandlers) {
  const touchState = reactive<TouchState>({
    isDragging: false,
    draggedItem: null,
    dragClone: null,
    startPosition: null,
    currentDropTarget: null,
    lastDropElement: null,
    touchStartTime: null,
    dragStarted: false,
    touchMoveThreshold: 10 // pixels to move before starting drag
  })

  const createDragClone = (element: HTMLElement, touch: Touch): HTMLElement => {
    const rect = element.getBoundingClientRect()
    
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.position = 'fixed'
    clone.style.width = rect.width + 'px'
    clone.style.height = rect.height + 'px'
    clone.style.left = (touch.clientX - rect.width / 2) + 'px'
    clone.style.top = (touch.clientY - rect.height / 2 - 20) + 'px' // Lift up by 20px
    clone.style.zIndex = '9999'
    clone.style.opacity = '0.8'
    clone.style.pointerEvents = 'none'
    clone.style.transform = 'scale(1.1) rotate(2deg)'
    clone.style.transition = 'transform 0.2s'
    clone.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)'
    clone.classList.add('touch-drag-clone')
    
    document.body.appendChild(clone)
    return clone
  }

  const updateClonePosition = (clone: HTMLElement, touch: Touch) => {
    clone.style.left = (touch.clientX - clone.offsetWidth / 2) + 'px'
    clone.style.top = (touch.clientY - clone.offsetHeight / 2 - 20) + 'px' // Lift up by 20px
  }

  const findDropTarget = (touch: Touch, clone: HTMLElement) => {
    // Temporarily hide clone to get element underneath
    clone.style.display = 'none'
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    clone.style.display = ''

    // Enhanced target detection - check multiple selectors
    const laneSteps = elementBelow?.closest('.lane-steps, .steps-list, .vertical-sortable')
    if (laneSteps) {
      // Multiple ways to find parent containers for better compatibility
      const lane = laneSteps.closest('.workflow-lane, .labware-lane, .lane-editor-modal')
      const workflow = lane?.closest('.workflow-container, .workflow-section, .lane-editor-modal') || 
                      laneSteps.closest('[data-workflow-id]')
      
      if (lane || workflow) {
        // Extract IDs from data attributes with fallbacks
        let laneId = laneSteps.getAttribute('data-lane-id') || 
                     lane?.getAttribute('data-lane-id')
        let workflowId = laneSteps.getAttribute('data-workflow-id') || 
                        workflow?.getAttribute('data-workflow-id')
        
        // Fallback to looking for IDs in parent modal if not found
        if (!laneId || !workflowId) {
          const modal = elementBelow?.closest('.lane-editor-modal')
          if (modal) {
            // These would come from the modal's props
            const editorContainer = modal.querySelector('[data-workflow-id][data-lane-id]')
            if (editorContainer) {
              workflowId = workflowId || editorContainer.getAttribute('data-workflow-id')
              laneId = laneId || editorContainer.getAttribute('data-lane-id')
            }
          }
        }
        
        // Enhanced insertion index calculation for both horizontal and vertical layouts
        const steps = Array.from(laneSteps.querySelectorAll('.workflow-step, .step-item'))
        let insertIndex = steps.length // Default to end
        
        if (steps.length > 0) {
          // Detect layout direction
          const firstStep = steps[0] as HTMLElement
          const secondStep = steps[1] as HTMLElement
          const isVertical = secondStep ? 
            (secondStep.getBoundingClientRect().top > firstStep.getBoundingClientRect().bottom - 10) :
            laneSteps.classList.contains('vertical-sortable')
          
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i] as HTMLElement
            const rect = step.getBoundingClientRect()
            
            if (isVertical) {
              // Vertical layout - check Y position
              const centerY = rect.top + rect.height / 2
              if (touch.clientY < centerY) {
                insertIndex = i
                break
              }
            } else {
              // Horizontal layout - check X position
              const centerX = rect.left + rect.width / 2
              if (touch.clientX < centerX) {
                insertIndex = i
                break
              }
            }
          }
        }
        
        return {
          workflowId,
          laneId,
          insertIndex,
          laneSteps: laneSteps as HTMLElement,
          elementBelow,
          clientX: touch.clientX,
          clientY: touch.clientY,
          isVertical: laneSteps.classList.contains('vertical-sortable')
        }
      }
    }
    
    // No valid drop target found
    return null
  }

  const triggerDragOver = (dropTarget: any) => {
    if (!dragHandlers || !dropTarget.workflowId || !dropTarget.laneId) return
    
    // Create mock drag event for compatibility with existing system
    const mockEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      currentTarget: dropTarget.laneSteps,
      clientX: dropTarget.clientX || 0,
      clientY: dropTarget.clientY || 0,
      dataTransfer: {
        effectAllowed: touchState.draggedItem?.isExistingStep ? 'move' : 'copy',
        getData: () => JSON.stringify(touchState.draggedItem)
      }
    } as any
    
    dragHandlers.handleDragOver(mockEvent, dropTarget.workflowId, dropTarget.laneId)
    
    // Add enhanced visual drop indicator
    addEnhancedDropIndicator(dropTarget)
  }

  const addEnhancedDropIndicator = (dropTarget: any) => {
    // Remove existing indicators
    document.querySelectorAll('.enhanced-drop-indicator, .drop-indicator').forEach(el => el.remove())
    
    if (!dropTarget.laneSteps) return
    
    const isVertical = dropTarget.isVertical || dropTarget.laneSteps.classList.contains('vertical-sortable')
    
    const indicator = document.createElement('div')
    indicator.className = 'enhanced-drop-indicator'
    
    if (isVertical) {
      // Vertical layout indicator
      indicator.style.cssText = `
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, transparent, #4a90e2, transparent);
        border-radius: 2px;
        margin: 8px 0;
        animation: shimmerVertical 1.5s ease-in-out infinite;
        position: relative;
        z-index: 10001;
        box-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
      `
      
      // Add side dots for vertical
      const leftDot = document.createElement('div')
      leftDot.style.cssText = `
        position: absolute;
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 12px;
        height: 12px;
        background: #4a90e2;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(74, 144, 226, 0.8);
      `
      
      const rightDot = document.createElement('div')
      rightDot.style.cssText = `
        position: absolute;
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 12px;
        height: 12px;
        background: #4a90e2;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(74, 144, 226, 0.8);
      `
      
      indicator.appendChild(leftDot)
      indicator.appendChild(rightDot)
    } else {
      // Horizontal layout indicator
      indicator.style.cssText = `
        width: 6px;
        height: 60px;
        background: linear-gradient(45deg, #4a90e2, #5aa3f0);
        border-radius: 3px;
        margin: 0 12px;
        animation: pulseGlow 1.2s ease-in-out infinite;
        position: relative;
        z-index: 10001;
        box-shadow: 0 0 15px rgba(74, 144, 226, 0.6), 0 0 30px rgba(74, 144, 226, 0.4);
      `
      
      // Add glowing dots at top and bottom for horizontal
      const topDot = document.createElement('div')
      topDot.style.cssText = `
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 16px;
        background: #4a90e2;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(74, 144, 226, 0.8);
      `
      
      const bottomDot = document.createElement('div')
      bottomDot.style.cssText = `
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 16px;
        background: #4a90e2;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(74, 144, 226, 0.8);
      `
      
      indicator.appendChild(topDot)
      indicator.appendChild(bottomDot)
    }
    
    const steps = dropTarget.laneSteps.querySelectorAll('.workflow-step, .step-item')
    if (dropTarget.insertIndex < steps.length) {
      steps[dropTarget.insertIndex].before(indicator)
    } else if (steps.length > 0) {
      steps[steps.length - 1].after(indicator)
    } else {
      dropTarget.laneSteps.appendChild(indicator)
    }
  }

  const triggerDragLeave = () => {
    if (touchState.lastDropElement) {
      touchState.lastDropElement.classList.remove('drag-over')
      document.querySelectorAll('.drop-indicator, .enhanced-drop-indicator').forEach(el => el.remove())
    }
  }

  const handleTouchStart = (
    event: TouchEvent, 
    dragItem: DragItem,
    element?: HTMLElement
  ) => {
    const touch = event.touches[0]
    const targetElement = element || (event.currentTarget as HTMLElement)
    
    // Clean up any existing state
    cleanup()
    
    // Prevent default immediately for workflow steps to enable drag
    if (targetElement.classList.contains('workflow-step')) {
      event.preventDefault()
    }
    
    // Initialize touch tracking
    touchState.touchStartTime = Date.now()
    touchState.draggedItem = dragItem
    touchState.startPosition = { x: touch.clientX, y: touch.clientY }
    touchState.isDragging = false
    touchState.dragStarted = false
  }

  const handleAutoScroll = (touch: Touch, laneSteps: HTMLElement) => {
    if (!touchState.startPosition) return
    
    const horizontalDistance = Math.abs(touch.clientX - touchState.startPosition.x)
    const direction = touch.clientX > touchState.startPosition.x ? 1 : -1
    
    // Only scroll if moved significantly horizontally (more than 50px from start)
    if (horizontalDistance < 50) return
    
    // Calculate scroll speed based on distance from original position
    // Speed increases as you move further from start (up to max of 20px per frame)
    const maxSpeed = 20
    const distanceThreshold = 100 // Maximum distance to consider for speed calculation
    const normalizedDistance = Math.min(horizontalDistance - 50, distanceThreshold) / distanceThreshold
    const scrollSpeed = Math.floor(5 + (normalizedDistance * (maxSpeed - 5)))
    
    if (direction > 0) {
      // Scrolling right
      const maxScroll = laneSteps.scrollWidth - laneSteps.clientWidth
      const scrollAmount = Math.min(scrollSpeed, maxScroll - laneSteps.scrollLeft)
      if (scrollAmount > 0) {
        laneSteps.scrollLeft += scrollAmount
      }
    } else {
      // Scrolling left
      const scrollAmount = Math.min(scrollSpeed, laneSteps.scrollLeft)
      if (scrollAmount > 0) {
        laneSteps.scrollLeft -= scrollAmount
      }
    }
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (!touchState.draggedItem || !touchState.startPosition) return
    
    const touch = event.touches[0]
    const deltaX = Math.abs(touch.clientX - touchState.startPosition.x)
    const deltaY = Math.abs(touch.clientY - touchState.startPosition.y)
    const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // Check if we should start dragging - improved sensitivity
    if (!touchState.dragStarted && totalDelta > 6) { // Even more sensitive
      event.preventDefault()
      
      // Start the actual drag immediately with enhanced feedback
      touchState.isDragging = true
      touchState.dragStarted = true
      
      const targetElement = event.currentTarget as HTMLElement
      touchState.dragClone = createDragClone(targetElement, touch)
      
      // Enhanced visual feedback for source element
      targetElement.classList.add('dragging-source')
      targetElement.style.opacity = '0.5'
      targetElement.style.transform = 'scale(0.95)'
      
      // Add haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
    
    // If dragging has started, handle the drag
    if (touchState.isDragging && touchState.dragClone) {
      event.preventDefault()
      
      updateClonePosition(touchState.dragClone, touch)
      
      const dropTarget = findDropTarget(touch, touchState.dragClone)
      
      // Handle auto-scrolling if over a lane
      if (dropTarget?.laneSteps) {
        handleAutoScroll(touch, dropTarget.laneSteps)
      }
      
      // Handle drag leave for previous target
      if (touchState.currentDropTarget && 
          (!dropTarget || dropTarget.laneSteps !== touchState.currentDropTarget.laneSteps)) {
        triggerDragLeave()
      }
      
      // Handle drag over for new target
      if (dropTarget && dropTarget.laneSteps !== touchState.lastDropElement) {
        touchState.currentDropTarget = dropTarget
        touchState.lastDropElement = dropTarget.laneSteps
        triggerDragOver(dropTarget)
      }
    }
  }

  const animateDropSuccess = (clone: HTMLElement, dropTarget: any) => {
    if (!dropTarget.laneSteps) return
    
    // Find the target position for horizontal layout
    const steps = dropTarget.laneSteps.querySelectorAll('.workflow-step')
    const laneRect = dropTarget.laneSteps.getBoundingClientRect()
    
    let targetX, targetY
    
    if (dropTarget.insertIndex < steps.length) {
      // Insert before an existing step
      const targetStep = steps[dropTarget.insertIndex]
      const stepRect = targetStep.getBoundingClientRect()
      targetX = stepRect.left - 10 // Position just before the step
      targetY = stepRect.top
    } else if (steps.length > 0) {
      // Insert at the end
      const lastStep = steps[steps.length - 1]
      const stepRect = lastStep.getBoundingClientRect()
      targetX = stepRect.right + 10 // Position just after the last step
      targetY = stepRect.top
    } else {
      // Empty lane - position at the start
      targetX = laneRect.left + 20
      targetY = laneRect.top + 10
    }
    
    // Animate clone to target position with enhanced effects
    clone.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    clone.style.transform = 'scale(0.85) rotate(0deg)'
    clone.style.left = targetX + 'px'
    clone.style.top = targetY + 'px'
    clone.style.opacity = '0.3'
    clone.style.filter = 'blur(1px)'
    
    // Add a success pulse effect
    clone.style.boxShadow = '0 0 20px rgba(74, 144, 226, 0.8)'
    
    // Remove after animation
    setTimeout(() => {
      if (clone.parentNode) {
        clone.remove()
      }
    }, 400)
  }

  const handleTouchEnd = (event: TouchEvent) => {
    if (!touchState.draggedItem) {
      cleanup()
      return null
    }
    
    // Only handle as drag if we actually started dragging
    if (!touchState.dragStarted || !touchState.isDragging || !touchState.dragClone) {
      cleanup()
      return null
    }
    
    event.preventDefault()
    
    const touch = event.changedTouches[0]
    const dropTarget = findDropTarget(touch, touchState.dragClone)
    
    let result = null
    if (dropTarget && dragHandlers && dropTarget.workflowId && dropTarget.laneId) {
      // Animate the successful drop
      animateDropSuccess(touchState.dragClone, dropTarget)
      
      // Create mock drop event
      const mockEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        currentTarget: dropTarget.laneSteps,
        dataTransfer: {
          getData: () => JSON.stringify(touchState.draggedItem),
          effectAllowed: touchState.draggedItem?.isExistingStep ? 'move' : 'copy'
        }
      } as any
      
      dragHandlers.handleDrop(mockEvent, dropTarget.workflowId, dropTarget.laneId)
      result = dropTarget
      
      // Success haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 30, 30])
      }
      
      // Don't cleanup the clone immediately - let animation finish
      setTimeout(() => {
        document.querySelectorAll('.enhanced-drop-indicator, .drop-indicator').forEach(el => el.remove())
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
      }, 350)
    } else {
      // Failed drop - animate clone back to original position or fade out
      if (touchState.dragClone) {
        touchState.dragClone.style.transition = 'all 0.3s ease-out'
        touchState.dragClone.style.transform = 'scale(0.5) rotate(10deg)'
        touchState.dragClone.style.opacity = '0'
        
        setTimeout(() => {
          if (touchState.dragClone?.parentNode) {
            touchState.dragClone.remove()
          }
        }, 300)
      }
      cleanup()
    }
    
    // Call drag end handler
    if (dragHandlers) {
      dragHandlers.handleDragEnd()
    }
    
    // Reset touch state (but don't remove clone if animating)
    touchState.isDragging = false
    touchState.draggedItem = null
    touchState.dragClone = null
    touchState.startPosition = null
    touchState.currentDropTarget = null
    touchState.lastDropElement = null
    touchState.touchStartTime = null
    touchState.dragStarted = false
    
    return result
  }

  const cleanup = () => {
    // Remove drag clone with animation
    if (touchState.dragClone) {
      touchState.dragClone.style.transition = 'all 0.2s ease-out'
      touchState.dragClone.style.opacity = '0'
      touchState.dragClone.style.transform = 'scale(0.8)'
      setTimeout(() => {
        if (touchState.dragClone?.parentNode) {
          touchState.dragClone.remove()
        }
      }, 200)
    }
    
    // Remove enhanced visual feedback from source elements
    document.querySelectorAll('.dragging-source').forEach(el => {
      el.classList.remove('dragging-source')
      const element = el as HTMLElement
      element.style.opacity = ''
      element.style.transform = ''
    })
    
    // Remove all touch-related artifacts with animations
    document.querySelectorAll('.touch-drag-clone').forEach(el => el.remove())
    document.querySelectorAll('.touch-drop-indicator').forEach(el => el.remove())
    document.querySelectorAll('.drop-indicator').forEach(el => {
      const element = el as HTMLElement
      element.style.transition = 'all 0.2s ease-out'
      element.style.opacity = '0'
      element.style.transform = 'scale(0.9)'
      setTimeout(() => {
        if (element.parentNode) {
          element.remove()
        }
      }, 200)
    })
    document.querySelectorAll('.enhanced-drop-indicator').forEach(el => {
      const element = el as HTMLElement
      element.style.transition = 'all 0.2s ease-out'
      element.style.opacity = '0'
      element.style.transform = 'scale(0.9)'
      setTimeout(() => {
        if (element.parentNode) {
          element.remove()
        }
      }, 200)
    })
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
    
    // Reset state
    touchState.isDragging = false
    touchState.draggedItem = null
    touchState.dragClone = null
    touchState.startPosition = null
    touchState.currentDropTarget = null
    touchState.lastDropElement = null
    touchState.touchStartTime = null
    touchState.dragStarted = false
  }
  
  // Add enhanced styles for animations
  const addTouchDragStyles = () => {
    if (document.getElementById('touch-drag-styles')) return
    
    const style = document.createElement('style')
    style.id = 'touch-drag-styles'
    style.textContent = `
      @keyframes shimmerVertical {
        0% { background-position: 0 -200%; }
        100% { background-position: 0 200%; }
      }
      
      .dragging-source {
        transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
      }
      
      .enhanced-drop-indicator {
        transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .touch-drag-clone {
        backdrop-filter: blur(1px);
        border: 2px solid rgba(74, 144, 226, 0.3);
      }
    `
    document.head.appendChild(style)
  }
  
  // Initialize enhanced styles
  addTouchDragStyles()

  return {
    touchState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    cleanup,
    addTouchDragStyles
  }
}