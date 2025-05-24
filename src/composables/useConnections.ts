import { Ref, nextTick } from 'vue'
import type { Workflow } from '@/types/workflow'

export function useConnections(
  connectionsSvg: Ref<SVGSVGElement | null>,
  workflows: Ref<Workflow[]>
) {
  // Update SVG size
  const updateSvgSize = () => {
    if (!connectionsSvg.value) return
    
    const container = document.querySelector('.workflow-optimizer')
    if (container) {
      const rect = container.getBoundingClientRect()
      connectionsSvg.value.style.width = `${rect.width}px`
      connectionsSvg.value.style.height = `${rect.height}px`
    }
  }

  // Draw a single connection
  const drawConnection = (svg: SVGSVGElement, step1: any, step2: any) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    
    // Create curved path
    const midX = (step1.x + step2.x) / 2
    const midY = (step1.y + step2.y) / 2
    const controlOffset = Math.abs(step1.y - step2.y) * 0.3
    
    const d = `M ${step1.x} ${step1.y} Q ${midX} ${midY - controlOffset}, ${step2.x} ${step2.y}`
    
    path.setAttribute('d', d)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', 'var(--primary-color)')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('stroke-dasharray', '5,5')
    path.setAttribute('opacity', '0.5')
    
    svg.appendChild(path)
  }

  // Draw all connections
  const drawConnections = async () => {
    await nextTick()
    
    if (!connectionsSvg.value) return
    
    const svg = connectionsSvg.value
    svg.innerHTML = '' // Clear existing connections
    
    // Find all liquid handler steps
    const liquidHandlerSteps: any[] = []
    const stepElements = document.querySelectorAll('.device-step.liquid-handler')
    
    stepElements.forEach(el => {
      const rect = el.getBoundingClientRect()
      const svgRect = svg.getBoundingClientRect()
      
      liquidHandlerSteps.push({
        element: el,
        x: rect.left + rect.width / 2 - svgRect.left,
        y: rect.top + rect.height / 2 - svgRect.top,
        stepId: (el as HTMLElement).dataset.stepId
      })
    })
    
    // Group by workflow
    const workflowGroups: Record<string, any[]> = {}
    
    workflows.value.forEach(workflow => {
      workflowGroups[workflow.id] = []
      workflow.lanes.forEach(lane => {
        lane.steps.forEach(step => {
          if (step.type === 'Liquid Handler') {
            const stepEl = liquidHandlerSteps.find(s => s.stepId === step.id)
            if (stepEl) {
              workflowGroups[workflow.id].push({
                ...stepEl,
                laneId: lane.id,
                laneName: lane.name
              })
            }
          }
        })
      })
    })
    
    // Draw connections within each workflow
    Object.values(workflowGroups).forEach(group => {
      if (group.length > 1) {
        // Connect all liquid handler steps in the workflow
        for (let i = 0; i < group.length - 1; i++) {
          for (let j = i + 1; j < group.length; j++) {
            drawConnection(svg, group[i], group[j])
          }
        }
      }
    })
  }

  return {
    updateSvgSize,
    drawConnections
  }
}