import { reactive, ref, computed } from 'vue'
import type { Workflow, Lane, Step } from '@/types/workflow'

export type ModalStep = 'workflow-selection' | 'lane-selection' | 'lane-editor'

interface ModalWorkflowEditorState {
  // Current modal state
  isModalOpen: boolean
  currentStep: ModalStep
  
  // Session selections
  selectedWorkflowId: string | null
  selectedLaneId: string | null
  pendingTask: Step | null
  
  // Memory for subsequent uses
  lastSelectedWorkflowId: string | null
  lastSelectedLaneId: string | null
  
  // Context for how modal was opened
  openedFromFAB: boolean
  openedFromPreview: boolean
}

// Create a singleton state that persists across component instances
const state = reactive<ModalWorkflowEditorState>({
  isModalOpen: false,
  currentStep: 'workflow-selection',
  selectedWorkflowId: null,
  selectedLaneId: null,
  pendingTask: null,
  lastSelectedWorkflowId: null,
  lastSelectedLaneId: null,
  openedFromFAB: false,
  openedFromPreview: false
})

export function useModalWorkflowEditor() {
  // Open modal from FAB (with pending task)
  const openFromFAB = (task: Step) => {
    state.pendingTask = task
    state.openedFromFAB = true
    state.openedFromPreview = false
    
    // If we have memory of last selections, start from lane selection
    if (state.lastSelectedWorkflowId && state.lastSelectedLaneId) {
      state.selectedWorkflowId = state.lastSelectedWorkflowId
      state.selectedLaneId = state.lastSelectedLaneId
      state.currentStep = 'lane-editor'
    } else if (state.lastSelectedWorkflowId) {
      state.selectedWorkflowId = state.lastSelectedWorkflowId
      state.currentStep = 'lane-selection'
    } else {
      state.currentStep = 'workflow-selection'
    }
    
    state.isModalOpen = true
  }

  // Open modal from workflow preview click (no pending task)
  const openFromPreview = (workflowId?: string, laneId?: string) => {
    state.pendingTask = null
    state.openedFromFAB = false
    state.openedFromPreview = true
    
    if (workflowId && laneId) {
      state.selectedWorkflowId = workflowId
      state.selectedLaneId = laneId
      state.currentStep = 'lane-editor'
    } else if (workflowId) {
      state.selectedWorkflowId = workflowId
      state.currentStep = 'lane-selection'
    } else {
      state.currentStep = 'workflow-selection'
    }
    
    state.isModalOpen = true
  }

  // Close modal and reset state
  const closeModal = () => {
    state.isModalOpen = false
    // Don't reset selections - keep them for memory
    state.pendingTask = null
    state.openedFromFAB = false
    state.openedFromPreview = false
  }

  // Step navigation
  const goToWorkflowSelection = () => {
    state.currentStep = 'workflow-selection'
    state.selectedWorkflowId = null
    state.selectedLaneId = null
  }

  const goToLaneSelection = (workflowId: string) => {
    state.selectedWorkflowId = workflowId
    state.selectedLaneId = null
    state.currentStep = 'lane-selection'
  }

  const goToLaneEditor = (laneId: string) => {
    state.selectedLaneId = laneId
    state.currentStep = 'lane-editor'
    
    // Update memory
    state.lastSelectedWorkflowId = state.selectedWorkflowId
    state.lastSelectedLaneId = laneId
  }

  // Go back to previous step
  const goBack = () => {
    switch (state.currentStep) {
      case 'lane-editor':
        state.currentStep = 'lane-selection'
        state.selectedLaneId = null
        break
      case 'lane-selection':
        state.currentStep = 'workflow-selection'
        state.selectedWorkflowId = null
        break
      default:
        closeModal()
    }
  }

  // Complete the workflow (add pending task if present)
  const completeWorkflow = () => {
    // This will be called by the lane editor when task is added
    closeModal()
  }

  // Clear memory (useful for testing or reset functionality)
  const clearMemory = () => {
    state.lastSelectedWorkflowId = null
    state.lastSelectedLaneId = null
  }

  // Computed properties
  const canGoBack = computed(() => {
    return state.currentStep === 'lane-selection' || state.currentStep === 'lane-editor'
  })

  const modalTitle = computed(() => {
    switch (state.currentStep) {
      case 'workflow-selection':
        return 'Select Workflow'
      case 'lane-selection':
        return 'Select Lane'
      case 'lane-editor':
        return 'Edit Lane'
      default:
        return 'Workflow Editor'
    }
  })

  const hasMemory = computed(() => {
    return state.lastSelectedWorkflowId !== null || state.lastSelectedLaneId !== null
  })

  return {
    // State (read-only)
    isModalOpen: computed(() => state.isModalOpen),
    currentStep: computed(() => state.currentStep),
    selectedWorkflowId: computed(() => state.selectedWorkflowId),
    selectedLaneId: computed(() => state.selectedLaneId),
    pendingTask: computed(() => state.pendingTask),
    openedFromFAB: computed(() => state.openedFromFAB),
    openedFromPreview: computed(() => state.openedFromPreview),
    
    // Computed properties
    canGoBack,
    modalTitle,
    hasMemory,
    
    // Methods
    openFromFAB,
    openFromPreview,
    closeModal,
    goToWorkflowSelection,
    goToLaneSelection,
    goToLaneEditor,
    goBack,
    completeWorkflow,
    clearMemory
  }
}