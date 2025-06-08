// Simplified drag and drop utility functions
// The actual state management is now handled at the top level in WorkflowOptimizer.vue

export function useDragDrop() {
  // Utility function to create a custom drag preview
  const createDragPreview = (element: HTMLElement): HTMLElement => {
    const preview = element.cloneNode(true) as HTMLElement
    preview.style.opacity = '0.8'
    preview.style.transform = 'rotate(2deg)'
    preview.style.pointerEvents = 'none'
    preview.style.position = 'absolute'
    preview.style.zIndex = '-1'
    return preview
  }

  // Set drag data on the event
  const setDragData = (event: DragEvent, data: any) => {
    if (!event.dataTransfer) return
    
    const jsonString = JSON.stringify(data)
    event.dataTransfer.setData('application/json', jsonString)
    event.dataTransfer.setData('text/plain', jsonString)
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

  return {
    createDragPreview,
    setDragData,
    getDragData
  }
}