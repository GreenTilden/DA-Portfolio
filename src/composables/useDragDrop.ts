import { ref, Ref } from 'vue'
import type { DragItem, Step } from '@/types/workflow'

export function useDragDrop() {
  const currentDragItem = ref<DragItem | null>(null)
  const dragOverElement = ref<HTMLElement | null>(null)

  // Start dragging
  const onDragStart = (event: DragEvent, item: DragItem | Step, isExistingStep = false) => {
    currentDragItem.value = { ...item, isExistingStep } as DragItem
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = isExistingStep ? 'move' : 'copy'
      event.dataTransfer.setData('text/plain', JSON.stringify(item))
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

  // Create drop indicator
  const createDropIndicator = (): HTMLDivElement => {
    const indicator = document.createElement('div')
    indicator.className = 'drop-indicator'
    return indicator
  }

  // Remove all drop indicators
  const removeDropIndicators = () => {
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove())
  }

  // Handle drag over with drop indicators
  const onDragOverWithIndicator = (event: DragEvent, stepSelector = '.device-step') => {
    onDragOver(event)
    
    const closestElement = findClosestElement(event, stepSelector)
    removeDropIndicators()
    
    if (closestElement) {
      const rect = closestElement.getBoundingClientRect()
      const midpoint = rect.left + rect.width / 2
      const indicator = createDropIndicator()
      
      if (event.clientX < midpoint) {
        closestElement.before(indicator)
      } else {
        closestElement.after(indicator)
      }
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
    createDropIndicator
  }
}