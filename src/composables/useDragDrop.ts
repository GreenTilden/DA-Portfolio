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
    type?: 'line' | 'zone'
    color?: string
    animated?: boolean
  } = {}): HTMLElement => {
    const { type = 'line', color = 'var(--primary-color)', animated = true } = options
    
    const indicator = document.createElement('div')
    indicator.className = `drop-indicator ${type} ${animated ? 'animated' : ''}`
    
    if (type === 'line') {
      indicator.style.cssText = `
        height: 3px;
        background: linear-gradient(90deg, transparent, ${color}, transparent);
        border-radius: 2px;
        margin: 4px 0;
        position: relative;
        overflow: hidden;
        ${animated ? 'animation: shimmer 1.5s ease-in-out infinite;' : ''}
      `
    } else {
      indicator.style.cssText = `
        min-height: 60px;
        border: 2px dashed ${color};
        border-radius: 8px;
        background: rgba(74, 144, 226, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${color};
        font-weight: 500;
        ${animated ? 'animation: pulseGlow 1.2s ease-in-out infinite;' : ''}
      `
      indicator.innerHTML = '<i class="fas fa-plus-circle"></i><span style="margin-left: 0.5rem;">Drop here</span>'
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
      // Create enhanced drag preview
      const dragImage = createDragPreview(element, {
        scale: 1.1,
        rotation: 3,
        opacity: 0.85,
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
        }
        50% {
          box-shadow: 0 0 25px rgba(74, 144, 226, 0.6);
          border-color: rgba(74, 144, 226, 0.8);
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
    `
    document.head.appendChild(style)
  }
  
  // Initialize styles
  addDropZoneStyles()

  return {
    createDragPreview,
    createDropIndicator,
    setDragData,
    getDragData,
    addDropZoneStyles
  }
}