import { reactive, ref } from 'vue'
import type { DragItem } from '@/types/workflow'

interface TouchState {
  isDragging: boolean
  draggedItem: DragItem | null
  dragClone: HTMLElement | null
  startPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  currentDropTarget: any | null
  lastDropElement: HTMLElement | null
  touchStartTime: number | null
  dragStarted: boolean
  touchMoveThreshold: number
  longPressTimer: NodeJS.Timeout | null
  isLongPress: boolean
  velocity: { x: number; y: number }
  lastMoveTime: number
}

interface DragHandlers {
  handleDragOver: (event: any, workflowId: string, laneId: string) => void
  handleDrop: (event: any, workflowId: string, laneId: string) => void
  handleDragEnd: () => void
}

interface TouchDragOptions {
  longPressDelay?: number
  moveThreshold?: number
  hapticFeedback?: boolean
  showDropPreview?: boolean
  elasticScroll?: boolean
}

export function useTouchDragDropEnhanced(
  dragHandlers?: DragHandlers,
  options: TouchDragOptions = {}
) {
  const {
    longPressDelay = 300,
    moveThreshold = 8,
    hapticFeedback = true,
    showDropPreview = true,
    elasticScroll = true
  } = options

  const touchState = reactive<TouchState>({
    isDragging: false,
    draggedItem: null,
    dragClone: null,
    startPosition: null,
    currentPosition: null,
    currentDropTarget: null,
    lastDropElement: null,
    touchStartTime: null,
    dragStarted: false,
    touchMoveThreshold: moveThreshold,
    longPressTimer: null,
    isLongPress: false,
    velocity: { x: 0, y: 0 },
    lastMoveTime: 0
  })

  // Visual feedback elements
  const dropPreview = ref<HTMLElement | null>(null)
  const longPressIndicator = ref<HTMLElement | null>(null)

  // Haptic feedback helper
  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Create enhanced drag clone with mobile optimizations
  const createDragClone = (element: HTMLElement, touch: Touch): HTMLElement => {
    const rect = element.getBoundingClientRect()
    
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.cssText = `
      position: fixed;
      width: ${rect.width}px;
      height: ${rect.height}px;
      left: ${touch.clientX - rect.width / 2}px;
      top: ${touch.clientY - rect.height / 2 - 30}px;
      z-index: 9999;
      opacity: 0.9;
      pointer-events: none;
      transform: scale(1.05) rotate(2deg);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
      border-radius: 8px;
      will-change: transform, left, top;
    `
    clone.classList.add('touch-drag-clone', 'mobile-optimized')
    
    // Add floating animation
    requestAnimationFrame(() => {
      clone.style.transform = 'scale(1.1) rotate(2deg) translateY(-5px)'
    })
    
    document.body.appendChild(clone)
    return clone
  }

  // Create long press indicator
  const createLongPressIndicator = (element: HTMLElement, touch: Touch): HTMLElement => {
    const indicator = document.createElement('div')
    indicator.className = 'long-press-indicator'
    indicator.style.cssText = `
      position: fixed;
      left: ${touch.clientX}px;
      top: ${touch.clientY}px;
      width: 60px;
      height: 60px;
      margin-left: -30px;
      margin-top: -30px;
      border: 3px solid var(--primary-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      animation: longPressRing ${longPressDelay}ms ease-out forwards;
    `
    
    // Add animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes longPressRing {
        0% {
          transform: scale(0.5);
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(indicator)
    
    return indicator
  }

  // Update clone position with smooth physics
  const updateClonePosition = (clone: HTMLElement, touch: Touch) => {
    const newX = touch.clientX - clone.offsetWidth / 2
    const newY = touch.clientY - clone.offsetHeight / 2 - 30
    
    // Calculate velocity for momentum
    const now = Date.now()
    if (touchState.currentPosition) {
      const deltaTime = now - touchState.lastMoveTime
      touchState.velocity.x = (newX - parseInt(clone.style.left)) / deltaTime
      touchState.velocity.y = (newY - parseInt(clone.style.top)) / deltaTime
    }
    
    clone.style.left = `${newX}px`
    clone.style.top = `${newY}px`
    
    touchState.currentPosition = { x: touch.clientX, y: touch.clientY }
    touchState.lastMoveTime = now
  }

  // Enhanced drop target finding with preview
  const findDropTarget = (touch: Touch, clone: HTMLElement) => {
    clone.style.display = 'none'
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    clone.style.display = ''

    const laneSteps = elementBelow?.closest('.lane-steps')
    if (laneSteps) {
      const lane = laneSteps.closest('.workflow-lane, .labware-lane')
      const workflow = lane?.closest('.workflow-container, .workflow-section')
      
      if (lane && workflow) {
        const laneId = lane.getAttribute('data-lane-id')
        const workflowId = workflow.getAttribute('data-workflow-id')
        
        // Calculate precise insertion point
        const steps = Array.from(laneSteps.querySelectorAll('.workflow-step'))
        let insertIndex = steps.length
        let insertPosition = null
        
        // For horizontal layout
        if (laneSteps.classList.contains('horizontal')) {
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i] as HTMLElement
            const rect = step.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            
            if (touch.clientX < centerX) {
              insertIndex = i
              insertPosition = rect.left - 4
              break
            }
          }
          
          if (insertIndex === steps.length && steps.length > 0) {
            const lastStep = steps[steps.length - 1] as HTMLElement
            const rect = lastStep.getBoundingClientRect()
            insertPosition = rect.right + 4
          }
        } else {
          // For vertical layout
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i] as HTMLElement
            const rect = step.getBoundingClientRect()
            const centerY = rect.top + rect.height / 2
            
            if (touch.clientY < centerY) {
              insertIndex = i
              insertPosition = rect.top - 4
              break
            }
          }
        }
        
        return {
          workflowId,
          laneId,
          insertIndex,
          insertPosition,
          laneSteps: laneSteps as HTMLElement,
          elementBelow,
          clientX: touch.clientX,
          clientY: touch.clientY,
          isHorizontal: laneSteps.classList.contains('horizontal')
        }
      }
    }
    
    return null
  }

  // Enhanced drop indicator with mobile styling
  const addEnhancedDropIndicator = (dropTarget: any) => {
    document.querySelectorAll('.enhanced-drop-indicator, .drop-indicator').forEach(el => el.remove())
    
    if (!dropTarget.laneSteps) return
    
    const indicator = document.createElement('div')
    indicator.className = 'enhanced-drop-indicator mobile-optimized'
    
    if (dropTarget.isHorizontal) {
      indicator.style.cssText = `
        position: absolute;
        width: 6px;
        height: 80%;
        top: 10%;
        left: ${dropTarget.insertPosition}px;
        background: linear-gradient(180deg, 
          transparent 0%, 
          var(--primary-color) 20%, 
          var(--primary-color) 80%, 
          transparent 100%);
        border-radius: 3px;
        box-shadow: 0 0 20px rgba(var(--primary-color-rgb), 0.8);
        animation: pulseGlow 1s ease-in-out infinite;
        z-index: 10001;
      `
    } else {
      indicator.style.cssText = `
        position: absolute;
        width: 80%;
        height: 6px;
        left: 10%;
        top: ${dropTarget.insertPosition}px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          var(--primary-color) 20%, 
          var(--primary-color) 80%, 
          transparent 100%);
        border-radius: 3px;
        box-shadow: 0 0 20px rgba(var(--primary-color-rgb), 0.8);
        animation: pulseGlow 1s ease-in-out infinite;
        z-index: 10001;
      `
    }
    
    dropTarget.laneSteps.style.position = 'relative'
    dropTarget.laneSteps.appendChild(indicator)
    
    // Add drop zone highlight
    dropTarget.laneSteps.classList.add('mobile-drop-active')
  }

  // Enhanced auto-scroll with elastic behavior
  const handleAutoScroll = (touch: Touch, laneSteps: HTMLElement) => {
    if (!touchState.startPosition || !elasticScroll) return
    
    const rect = laneSteps.getBoundingClientRect()
    const scrollMargin = 50
    const maxScrollSpeed = 15
    
    if (laneSteps.classList.contains('horizontal')) {
      // Horizontal scrolling
      if (touch.clientX < rect.left + scrollMargin) {
        const distance = (rect.left + scrollMargin - touch.clientX) / scrollMargin
        const scrollSpeed = Math.min(distance * maxScrollSpeed, maxScrollSpeed)
        laneSteps.scrollLeft -= scrollSpeed
      } else if (touch.clientX > rect.right - scrollMargin) {
        const distance = (touch.clientX - (rect.right - scrollMargin)) / scrollMargin
        const scrollSpeed = Math.min(distance * maxScrollSpeed, maxScrollSpeed)
        laneSteps.scrollLeft += scrollSpeed
      }
    } else {
      // Vertical scrolling
      if (touch.clientY < rect.top + scrollMargin) {
        const distance = (rect.top + scrollMargin - touch.clientY) / scrollMargin
        const scrollSpeed = Math.min(distance * maxScrollSpeed, maxScrollSpeed)
        laneSteps.scrollTop -= scrollSpeed
      } else if (touch.clientY > rect.bottom - scrollMargin) {
        const distance = (touch.clientY - (rect.bottom - scrollMargin)) / scrollMargin
        const scrollSpeed = Math.min(distance * maxScrollSpeed, maxScrollSpeed)
        laneSteps.scrollTop += scrollSpeed
      }
    }
  }

  // Touch start handler with long press support
  const handleTouchStart = (
    event: TouchEvent, 
    dragItem: DragItem,
    element?: HTMLElement
  ) => {
    const touch = event.touches[0]
    const targetElement = element || (event.currentTarget as HTMLElement)
    
    cleanup()
    
    touchState.touchStartTime = Date.now()
    touchState.draggedItem = dragItem
    touchState.startPosition = { x: touch.clientX, y: touch.clientY }
    touchState.isDragging = false
    touchState.dragStarted = false
    touchState.isLongPress = false
    
    // Add visual feedback for touch
    targetElement.classList.add('touch-active')
    
    // Start long press timer
    longPressIndicator.value = createLongPressIndicator(targetElement, touch)
    
    touchState.longPressTimer = setTimeout(() => {
      if (!touchState.dragStarted && touchState.startPosition) {
        touchState.isLongPress = true
        triggerHaptic([20, 20, 20])
        
        // Start drag on long press
        event.preventDefault()
        touchState.isDragging = true
        touchState.dragStarted = true
        touchState.dragClone = createDragClone(targetElement, touch)
        
        // Remove long press indicator
        if (longPressIndicator.value) {
          longPressIndicator.value.remove()
          longPressIndicator.value = null
        }
      }
    }, longPressDelay)
  }

  // Touch move handler with improved drag detection
  const handleTouchMove = (event: TouchEvent) => {
    if (!touchState.draggedItem || !touchState.startPosition) return
    
    const touch = event.touches[0]
    const deltaX = Math.abs(touch.clientX - touchState.startPosition.x)
    const deltaY = Math.abs(touch.clientY - touchState.startPosition.y)
    const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    // Cancel long press if moved too much
    if (!touchState.dragStarted && totalDelta > touchState.touchMoveThreshold) {
      if (touchState.longPressTimer) {
        clearTimeout(touchState.longPressTimer)
        touchState.longPressTimer = null
      }
      if (longPressIndicator.value) {
        longPressIndicator.value.remove()
        longPressIndicator.value = null
      }
      
      // Start immediate drag
      if (!touchState.isLongPress) {
        event.preventDefault()
        touchState.isDragging = true
        touchState.dragStarted = true
        
        const targetElement = event.currentTarget as HTMLElement
        touchState.dragClone = createDragClone(targetElement, touch)
        triggerHaptic(20)
      }
    }
    
    // Handle active dragging
    if (touchState.isDragging && touchState.dragClone) {
      event.preventDefault()
      
      updateClonePosition(touchState.dragClone, touch)
      
      const dropTarget = findDropTarget(touch, touchState.dragClone)
      
      if (dropTarget?.laneSteps) {
        handleAutoScroll(touch, dropTarget.laneSteps)
      }
      
      // Update drop indicators
      if (touchState.currentDropTarget && 
          (!dropTarget || dropTarget.laneSteps !== touchState.currentDropTarget.laneSteps)) {
        triggerDragLeave()
      }
      
      if (dropTarget && dropTarget.laneSteps !== touchState.lastDropElement) {
        touchState.currentDropTarget = dropTarget
        touchState.lastDropElement = dropTarget.laneSteps
        triggerDragOver(dropTarget)
      }
    }
  }

  // Enhanced drop animation with physics
  const animateDropSuccess = (clone: HTMLElement, dropTarget: any) => {
    if (!dropTarget.laneSteps) return
    
    const targetRect = dropTarget.laneSteps.getBoundingClientRect()
    let targetX, targetY
    
    if (dropTarget.isHorizontal) {
      targetY = targetRect.top + targetRect.height / 2 - clone.offsetHeight / 2
      targetX = dropTarget.insertPosition || targetRect.left
    } else {
      targetX = targetRect.left + targetRect.width / 2 - clone.offsetWidth / 2
      targetY = dropTarget.insertPosition || targetRect.top
    }
    
    // Apply momentum physics
    const momentumX = touchState.velocity.x * 50
    const momentumY = touchState.velocity.y * 50
    
    clone.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    clone.style.transform = `scale(0.8) rotate(0deg) translate(${momentumX}px, ${momentumY}px)`
    clone.style.left = `${targetX}px`
    clone.style.top = `${targetY}px`
    clone.style.opacity = '0'
    clone.style.filter = 'blur(2px)'
    
    // Success pulse effect
    const successPulse = document.createElement('div')
    successPulse.style.cssText = `
      position: fixed;
      left: ${targetX + clone.offsetWidth / 2}px;
      top: ${targetY + clone.offsetHeight / 2}px;
      width: 60px;
      height: 60px;
      margin-left: -30px;
      margin-top: -30px;
      background: var(--primary-color);
      border-radius: 50%;
      opacity: 0.6;
      transform: scale(0);
      pointer-events: none;
      z-index: 10000;
      animation: successPulse 0.6s ease-out forwards;
    `
    
    document.body.appendChild(successPulse)
    
    setTimeout(() => {
      clone.remove()
      successPulse.remove()
    }, 600)
  }

  // Touch end handler with improved feedback
  const handleTouchEnd = (event: TouchEvent) => {
    // Clear long press timer
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer)
      touchState.longPressTimer = null
    }
    
    // Remove long press indicator
    if (longPressIndicator.value) {
      longPressIndicator.value.remove()
      longPressIndicator.value = null
    }
    
    // Remove touch active class
    const targetElement = event.currentTarget as HTMLElement
    targetElement.classList.remove('touch-active')
    
    if (!touchState.draggedItem || !touchState.dragStarted || !touchState.isDragging) {
      cleanup()
      return null
    }
    
    event.preventDefault()
    
    const touch = event.changedTouches[0]
    const dropTarget = findDropTarget(touch, touchState.dragClone!)
    
    let result = null
    if (dropTarget && dragHandlers && dropTarget.workflowId && dropTarget.laneId) {
      // Animate successful drop
      animateDropSuccess(touchState.dragClone!, dropTarget)
      
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
      
      // Success haptic pattern
      triggerHaptic([20, 40, 20])
      
      // Clean up indicators after animation
      setTimeout(() => {
        document.querySelectorAll('.enhanced-drop-indicator, .drop-indicator').forEach(el => el.remove())
        document.querySelectorAll('.mobile-drop-active').forEach(el => el.classList.remove('mobile-drop-active'))
      }, 400)
    } else {
      // Failed drop animation
      if (touchState.dragClone) {
        touchState.dragClone.style.transition = 'all 0.3s ease-out'
        touchState.dragClone.style.transform = 'scale(0.5) rotate(10deg)'
        touchState.dragClone.style.opacity = '0'
        
        triggerHaptic([10, 10])
        
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
    
    // Reset state
    resetState()
    
    return result
  }

  // Helper functions
  const triggerDragOver = (dropTarget: any) => {
    if (!dragHandlers || !dropTarget.workflowId || !dropTarget.laneId) return
    
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
    addEnhancedDropIndicator(dropTarget)
    
    // Light haptic on hover
    triggerHaptic(5)
  }

  const triggerDragLeave = () => {
    if (touchState.lastDropElement) {
      touchState.lastDropElement.classList.remove('drag-over', 'mobile-drop-active')
      document.querySelectorAll('.drop-indicator, .enhanced-drop-indicator').forEach(el => el.remove())
    }
  }

  const cleanup = () => {
    // Remove all visual elements
    if (touchState.dragClone) {
      touchState.dragClone.remove()
    }
    
    if (longPressIndicator.value) {
      longPressIndicator.value.remove()
      longPressIndicator.value = null
    }
    
    document.querySelectorAll('.touch-drag-clone').forEach(el => el.remove())
    document.querySelectorAll('.touch-drop-indicator').forEach(el => el.remove())
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove())
    document.querySelectorAll('.enhanced-drop-indicator').forEach(el => el.remove())
    document.querySelectorAll('.long-press-indicator').forEach(el => el.remove())
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
    document.querySelectorAll('.mobile-drop-active').forEach(el => el.classList.remove('mobile-drop-active'))
    document.querySelectorAll('.touch-active').forEach(el => el.classList.remove('touch-active'))
    
    resetState()
  }

  const resetState = () => {
    touchState.isDragging = false
    touchState.draggedItem = null
    touchState.dragClone = null
    touchState.startPosition = null
    touchState.currentPosition = null
    touchState.currentDropTarget = null
    touchState.lastDropElement = null
    touchState.touchStartTime = null
    touchState.dragStarted = false
    touchState.isLongPress = false
    touchState.velocity = { x: 0, y: 0 }
    touchState.lastMoveTime = 0
    
    if (touchState.longPressTimer) {
      clearTimeout(touchState.longPressTimer)
      touchState.longPressTimer = null
    }
  }

  return {
    touchState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    cleanup,
    triggerHaptic
  }
}