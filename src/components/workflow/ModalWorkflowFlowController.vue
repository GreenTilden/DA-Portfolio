<template>
  <el-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    width="600px"
    class="workflow-flow-modal"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- Modal content with smooth transitions -->
    <div class="modal-content">
      <transition name="step-slide" mode="out-in">
        <!-- Step 1: Workflow Selection -->
        <div v-if="currentStep === 'workflow-selection'" key="workflow-selection" class="step-content">
          <div class="step-header">
            <div class="step-icon">
              <i class="fas fa-project-diagram"></i>
            </div>
            <div class="step-info">
              <h3>Select Workflow</h3>
              <p>Choose an existing workflow or create a new one</p>
            </div>
          </div>
          <div class="step-body">
            <slot name="workflow-selection" :on-select="handleWorkflowSelect">
              <div class="placeholder-content">
                <i class="fas fa-project-diagram"></i>
                <p>Workflow selection content goes here</p>
              </div>
            </slot>
          </div>
        </div>

        <!-- Step 2: Lane Selection -->
        <div v-else-if="currentStep === 'lane-selection'" key="lane-selection" class="step-content">
          <div class="step-header">
            <div class="step-icon">
              <i class="fas fa-road"></i>
            </div>
            <div class="step-info">
              <h3>Select Lane</h3>
              <p>Choose which lane to edit or add tasks to</p>
            </div>
          </div>
          <div class="step-body">
            <slot name="lane-selection" :on-select="handleLaneSelect" :workflow-id="selectedWorkflowId">
              <div class="placeholder-content">
                <i class="fas fa-road"></i>
                <p>Lane selection content goes here</p>
                <p class="subtitle">Workflow: {{ selectedWorkflowId }}</p>
              </div>
            </slot>
          </div>
        </div>

        <!-- Step 3: Lane Editor -->
        <div v-else-if="currentStep === 'lane-editor'" key="lane-editor" class="step-content">
          <div class="step-header">
            <div class="step-icon">
              <i class="fas fa-edit"></i>
            </div>
            <div class="step-info">
              <h3>Edit Lane</h3>
              <p>Arrange and configure your workflow steps</p>
            </div>
          </div>
          <div class="step-body">
            <slot 
              name="lane-editor" 
              :workflow-id="selectedWorkflowId"
              :lane-id="selectedLaneId"
              :pending-task="pendingTask"
              :opened-from-fab="openedFromFAB"
              :on-complete="handleComplete"
            >
              <div class="placeholder-content">
                <i class="fas fa-edit"></i>
                <p>Lane editor content goes here</p>
                <p class="subtitle">Workflow: {{ selectedWorkflowId }}</p>
                <p class="subtitle">Lane: {{ selectedLaneId }}</p>
                <div v-if="pendingTask" class="pending-task-info">
                  <strong>Adding task:</strong> {{ pendingTask.task }}
                </div>
              </div>
            </slot>
          </div>
        </div>
      </transition>
    </div>

    <!-- Modal footer with navigation -->
    <template #footer>
      <div class="modal-footer">
        <!-- Back button -->
        <el-button 
          v-if="canGoBack" 
          @click="handleBack"
          :icon="ArrowLeft"
        >
          Back
        </el-button>

        <!-- Step indicator -->
        <div class="step-indicator">
          <div 
            v-for="(step, index) in steps" 
            :key="step"
            class="step-dot"
            :class="{ 
              active: index <= currentStepIndex,
              current: index === currentStepIndex 
            }"
          >
            <span>{{ index + 1 }}</span>
          </div>
        </div>

        <!-- Close button -->
        <el-button @click="handleClose">
          {{ currentStep === 'lane-editor' ? 'Done' : 'Cancel' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useModalWorkflowEditor } from '@/composables/useModalWorkflowEditor'

// Use the modal workflow editor composable
const {
  isModalOpen,
  currentStep,
  selectedWorkflowId,
  selectedLaneId,
  pendingTask,
  openedFromFAB,
  modalTitle,
  canGoBack,
  goToLaneSelection,
  goToLaneEditor,
  goBack,
  closeModal,
  completeWorkflow
} = useModalWorkflowEditor()

// Computed properties for UI
const dialogVisible = computed({
  get: () => isModalOpen.value,
  set: (value) => {
    if (!value) {
      closeModal()
    }
  }
})

const steps = ['workflow-selection', 'lane-selection', 'lane-editor'] as const

const currentStepIndex = computed(() => {
  return steps.indexOf(currentStep.value)
})

// Event handlers
const handleWorkflowSelect = (workflowId: string) => {
  goToLaneSelection(workflowId)
}

const handleLaneSelect = (laneId: string) => {
  goToLaneEditor(laneId)
}

const handleBack = () => {
  goBack()
}

const handleClose = () => {
  closeModal()
}

const handleComplete = () => {
  completeWorkflow()
}
</script>

<style scoped>
.workflow-flow-modal {
  --step-color: var(--primary-color);
  --step-bg: var(--card-bg);
}

.modal-content {
  min-height: 400px;
  padding: 0;
  overflow: hidden;
}

.step-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 0 1.5rem;
  background: linear-gradient(135deg, var(--background-alt) 0%, var(--section-bg) 100%);
  border-bottom: 1px solid var(--border-light);
}

.step-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.step-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-light);
}

.step-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.step-body {
  flex: 1;
  padding: 0 1.5rem 1.5rem 1.5rem;
  overflow-y: auto;
}

/* Step transition animations */
.step-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.98);
}

.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px) scale(0.98);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  background-color: var(--background-alt);
  border-radius: 8px;
  border: 2px dashed var(--border-color);
}

.placeholder-content i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  opacity: 0.5;
}

.placeholder-content p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.placeholder-content .subtitle {
  font-size: 0.875rem;
  color: var(--text-light);
}

.pending-task-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s ease;
  position: relative;
}

.step-dot.active {
  background-color: var(--step-color);
  color: white;
}

.step-dot.current {
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
}

.step-dot:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  width: 0.5rem;
  height: 2px;
  background-color: var(--border-color);
}

.step-dot.active:not(:last-child)::after {
  background-color: var(--step-color);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .workflow-flow-modal {
    width: 95vw !important;
    max-width: none !important;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .step-indicator {
    order: -1;
  }
}
</style>