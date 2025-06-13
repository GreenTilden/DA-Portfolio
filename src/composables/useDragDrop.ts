// Enhanced drag and drop utility functions with improved animations
// The actual state management is now handled at the top level in WorkflowOptimizer.vue

export function useDragDrop() {
  // Enhanced utility function to create a custom drag preview with animations
  const createDragPreview = (element: HTMLElement, options: {
    scale?: number
    rotation?: number
    opacity?: number
    shadow?: boolean
  } = {}): HTMLElement => {
    const { scale = 1.05, rotation = 2, opacity = 0.9, shadow = true } = options
    
    const preview = element.cloneNode(true) as HTMLElement
    preview.style.opacity = opacity.toString()
    preview.style.transform = `scale(${scale}) rotate(${rotation}deg)`
    preview.style.pointerEvents = 'none'
    preview.style.position = 'absolute'
    preview.style.zIndex = '10000'
    preview.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    
    if (shadow) {
      preview.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)'
      preview.style.filter = 'brightness(1.1)'
    }
    
    return preview
  }

  // Enhanced drop zone visual feedback
  const createDropIndicator = (options: {
    type?: 'line' | 'zone' | 'insertion'
    color?: string
    animated?: boolean
    position?: 'above' | 'below' | 'center'
  } = {}): HTMLElement => {
    const { type = 'line', color = 'var(--primary-color)', animated = true, position = 'center' } = options
    
    const indicator = document.createElement('div')
    indicator.className = `drop-indicator ${type} ${animated ? 'animated' : ''} position-${position}`
    
    if (type === 'line') {
      indicator.style.cssText = `
        height: 4px;
        background: linear-gradient(90deg, transparent 10%, ${color} 30%, ${color} 70%, transparent 90%);
        border-radius: 2px;
        margin: 6px 0;
        position: relative;
        overflow: hidden;
        box-shadow: 0 0 8px rgba(74, 144, 226, 0.4);
        ${animated ? 'animation: shimmer 1.5s ease-in-out infinite;' : ''}
      `
    } else if (type === 'insertion') {
      indicator.style.cssText = `
        height: 2px;
        background: ${color};
        border-radius: 1px;
        margin: 8px 0;
        position: relative;
        box-shadow: 0 0 6px rgba(74, 144, 226, 0.6);
        ${animated ? 'animation: pulseWidth 1s ease-in-out infinite;' : ''}
      `
      
      // Add insertion arrows
      const leftArrow = document.createElement('div')
      leftArrow.style.cssText = `
        position: absolute;
        left: -8px;
        top: -4px;
        width: 0;
        height: 0;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-right: 8px solid ${color};
        filter: drop-shadow(0 0 4px rgba(74, 144, 226, 0.6));
      `
      
      const rightArrow = document.createElement('div')
      rightArrow.style.cssText = `
        position: absolute;
        right: -8px;
        top: -4px;
        width: 0;
        height: 0;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-left: 8px solid ${color};
        filter: drop-shadow(0 0 4px rgba(74, 144, 226, 0.6));
      `
      
      indicator.appendChild(leftArrow)
      indicator.appendChild(rightArrow)
    } else {
      indicator.style.cssText = `
        min-height: 80px;
        border: 3px dashed ${color};
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(74, 144, 226, 0.08) 0%, rgba(74, 144, 226, 0.04) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${color};
        font-weight: 600;
        gap: 0.75rem;
        backdrop-filter: blur(1px);
        ${animated ? 'animation: pulseGlow 1.2s ease-in-out infinite;' : ''}
      `
      indicator.innerHTML = `
        <i class="fas fa-plus-circle" style="font-size: 1.25rem;"></i>
        <span style="font-size: 0.95rem;">Drop item here</span>
      `
    }
    
    return indicator
  }

  // Enhanced drag data setting with visual effects
  const setDragData = (event: DragEvent, data: any, element?: HTMLElement) => {
    if (!event.dataTransfer) return
    
    const jsonString = JSON.stringify(data)
    event.dataTransfer.setData('application/json', jsonString)
    event.dataTransfer.setData('text/plain', jsonString)
    
    // Set drag effect and custom drag image if element provided
    event.dataTransfer.effectAllowed = data.isExistingStep ? 'move' : 'copy'
    
    if (element) {
      // Add dragging class to original element
      element.classList.add('dragging-source')
      
      // Create enhanced drag preview
      const dragImage = createDragPreview(element, {
        scale: 1.05,
        rotation: 2,
        opacity: 0.9,
        shadow: true
      })
      
      // Temporarily add to DOM for drag image
      document.body.appendChild(dragImage)
      event.dataTransfer.setDragImage(dragImage, element.offsetWidth / 2, element.offsetHeight / 2)
      
      // Clean up after drag starts
      requestAnimationFrame(() => {
        if (dragImage.parentNode) {
          dragImage.remove()
        }
      })
      
      // Remove dragging class after a delay
      setTimeout(() => {
        element.classList.remove('dragging-source')
      }, 200)
    }
  }

  // Get drag data from the event
  const getDragData = (event: DragEvent): any | null => {
    if (!event.dataTransfer) return null
    
    const data = event.dataTransfer.getData('application/json') || 
                 event.dataTransfer.getData('text/plain')
    
    if (!data) return null
    
    try {
      return JSON.parse(data)
    } catch (e) {
      return null
    }
  }

  // Enhanced drop zone management
  const addDropZoneStyles = () => {
    if (document.getElementById('drag-drop-styles')) return
    
    const style = document.createElement('style')
    style.id = 'drag-drop-styles'
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes pulseGlow {
        0%, 100% {
          box-shadow: 0 0 15px rgba(74, 144, 226, 0.4);
          border-color: rgba(74, 144, 226, 0.6);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 25px rgba(74, 144, 226, 0.6);
          border-color: rgba(74, 144, 226, 0.8);
          transform: scale(1.02);
        }
      }
      
      @keyframes pulseWidth {
        0%, 100% {
          transform: scaleX(1);
          opacity: 1;
        }
        50% {
          transform: scaleX(1.05);
          opacity: 0.8;
        }
      }
      
      .drop-indicator.line.animated {
        background: linear-gradient(
          90deg,
          transparent 0%,
          var(--primary-color) 25%,
          rgba(74, 144, 226, 0.8) 50%,
          var(--primary-color) 75%,
          transparent 100%
        );
        background-size: 200% 100%;
      }
      
      .drag-over-enhanced {
        background: rgba(74, 144, 226, 0.08) !important;
        border-color: var(--primary-color) !important;
        transform: scale(1.02);
        transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .dragging-item {
        opacity: 0.6;
        transform: scale(0.98) rotate(1deg);
        transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 1000;
      }
      
      .dragging-source {
        opacity: 0.4;
        transform: scale(0.95);
        transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        filter: grayscale(0.3);
      }
      
      .drop-zone-highlighted {
        background: rgba(74, 144, 226, 0.1) !important;
        border: 2px solid var(--primary-color) !important;
        border-radius: 8px !important;
        transform: scale(1.02);
        transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .insertion-point {
        position: relative;
      }
      
      .insertion-point::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        right: 0;
        height: 4px;
        background: var(--primary-color);
        border-radius: 2px;
        box-shadow: 0 0 8px rgba(74, 144, 226, 0.6);
        animation: pulseWidth 1s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)
  }
  
  // Initialize styles
  addDropZoneStyles()

  // Helper function to show insertion point
  const showInsertionPoint = (targetElement: HTMLElement, position: 'above' | 'below' = 'below') => {
    hideAllInsertionPoints()
    
    const indicator = createDropIndicator({ 
      type: 'insertion', 
      animated: true, 
      position 
    })
    
    if (position === 'above') {
      targetElement.parentNode?.insertBefore(indicator, targetElement)
    } else {
      targetElement.parentNode?.insertBefore(indicator, targetElement.nextSibling)
    }
    
    return indicator
  }
  
  // Helper function to hide all insertion points
  const hideAllInsertionPoints = () => {
    document.querySelectorAll('.drop-indicator.insertion').forEach(el => el.remove())
    document.querySelectorAll('.insertion-point').forEach(el => {
      el.classList.remove('insertion-point')
    })
  }
  
  // Helper function to highlight drop zones
  const highlightDropZone = (element: HTMLElement, highlight: boolean = true) => {
    if (highlight) {
      element.classList.add('drop-zone-highlighted')
    } else {
      element.classList.remove('drop-zone-highlighted')
    }
  }
  
  // Clean up function
  const cleanupDragEffects = () => {
    hideAllInsertionPoints()
    document.querySelectorAll('.drop-zone-highlighted').forEach(el => {
      el.classList.remove('drop-zone-highlighted')
    })
    document.querySelectorAll('.dragging-source').forEach(el => {
      el.classList.remove('dragging-source')
    })
    document.querySelectorAll('.drag-over-enhanced').forEach(el => {
      el.classList.remove('drag-over-enhanced')
    })
  }

  return {
    createDragPreview,
    createDropIndicator,
    setDragData,
    getDragData,
    addDropZoneStyles,
    showInsertionPoint,
    hideAllInsertionPoints,
    highlightDropZone,
    cleanupDragEffects
  }
}