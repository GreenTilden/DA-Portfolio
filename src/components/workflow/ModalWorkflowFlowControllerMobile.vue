<template>
  <el-dialog
    v-model="dialogVisible"
    :title="modalTitle"
    :width="dialogWidth"
    :fullscreen="isMobile"
    class="workflow-flow-modal"
    :class="{ 
      'mobile-modal': isMobile,
      'touch-enabled': isTouchDevice 
    }"
    :close-on-click-modal="false"
    :show-close="!isMobile"
    destroy-on-close
    @open="handleModalOpen"
    @close="handleModalClose"
  >
    <!-- Mobile Header (Custom for fullscreen) -->
    <template v-if="isMobile" #header>
      <div class="mobile-modal-header">
        <button class="mobile-back-btn" @click="handleMobileBack">
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="mobile-title">
          <h3>{{ modalTitle }}</h3>
          <div class="mobile-breadcrumb">
            <span v-if="selectedWorkflowName">{{ selectedWorkflowName }}</span>
            <i v-if="selectedWorkflowName && selectedLaneName" class="fas fa-chevron-right"></i>
            <span v-if="selectedLaneName">{{ selectedLaneName }}</span>
          </div>
        </div>
        
        <button class="mobile-close-btn" @click="handleClose">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Mobile Step Progress -->
      <div class="mobile-step-progress">
        <div class="progress-track">
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        <div class="progress-dots">
          <div 
            v-for="(step, index) in steps" 
            :key="step"
            class="progress-dot"
            :class="{ 
              'active': index <= currentStepIndex,
              'current': index === currentStepIndex 
            }"
          ></div>
        </div>
      </div>
    </template>

    <!-- Modal content with touch optimization -->
    <div 
      class="modal-content"
      :class="{ 'mobile-content': isMobile }"
      @touchstart="handleContentTouchStart"
      @touchmove="handleContentTouchMove"
      @touchend="handleContentTouchEnd"
    >
      <!-- Swipe indicator for mobile -->
      <div v-if="isMobile && canGoBack" class="swipe-indicator">
        <i class="fas fa-chevron-left"></i>
        <span>Swipe right to go back</span>
      </div>

      <!-- Step 1: Workflow Selection -->
      <transition :name="transitionName" mode="out-in">
        <div v-if="currentStep === 'workflow-selection'" key="workflow-selection" class="step-content">
          <slot name="workflow-selection" :on-select="handleWorkflowSelect">
            <WorkflowSelectModal
              :on-select="handleWorkflowSelect"
              :is-mobile="isMobile"
            />
          </slot>
        </div>

        <!-- Step 2: Lane Selection -->
        <div v-else-if="currentStep === 'lane-selection'" key="lane-selection" class="step-content">
          <slot name="lane-selection" :on-select="handleLaneSelect" :workflow-id="selectedWorkflowId">
            <LaneSelectModal
              :on-select="handleLaneSelect"
              :workflow-id="selectedWorkflowId"
              :pending-task="pendingTask"
              :is-mobile="isMobile"
            />
          </slot>
        </div>

        <!-- Step 3: Lane Editor -->
        <div v-else-if="currentStep === 'lane-editor'" key="lane-editor" class="step-content">
          <slot 
            name="lane-editor" 
            :workflow-id="selectedWorkflowId"
            :lane-id="selectedLaneId"
            :pending-task="pendingTask"
            :opened-from-fab="openedFromFAB"
            :on-complete="handleComplete"
          >
            <LaneEditorModal
              :workflow-id="selectedWorkflowId"
              :lane-id="selectedLaneId"
              :pending-task="pendingTask"
              :opened-from-fab="openedFromFAB"
              :on-complete="handleComplete"
              :is-mobile="isMobile"
            />
          </slot>
        </div>
      </transition>
    </div>

    <!-- Desktop Footer -->
    <template v-if="!isMobile" #footer>
      <div class="modal-footer desktop">
        <el-button 
          v-if="canGoBack" 
          @click="handleBack"
          :icon="ArrowLeft"
        >
          Back
        </el-button>

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

        <el-button @click="handleClose">
          {{ currentStep === 'lane-editor' ? 'Done' : 'Cancel' }}
        </el-button>
      </div>
    </template>

    <!-- Mobile Footer Actions -->
    <div v-if="isMobile" class="mobile-footer-actions">
      <button 
        v-if="currentStep === 'workflow-selection'"
        class="mobile-action-btn primary"
        @click="showCreateWorkflow"
      >
        <i class="fas fa-plus"></i>
        Create New Workflow
      </button>
      
      <button 
        v-else-if="currentStep === 'lane-selection'"
        class="mobile-action-btn primary"
        @click="showCreateLane"
      >
        <i class="fas fa-plus"></i>
        Add New Lane
      </button>
      
      <button 
        v-else-if="currentStep === 'lane-editor' && pendingTask"
        class="mobile-action-btn success"
        @click="handleQuickAdd"
      >
        <i class="fas fa-check"></i>
        Add Task & Close
      </button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useModalWorkflowEditor } from '@/composables/useModalWorkflowEditor'
import { useWorkflowState } from '@/composables/useWorkflowState'

// Import modal components
import WorkflowSelectModal from './WorkflowSelectModal.vue'
import LaneSelectModal from './LaneSelectModal.vue'
import LaneEditorModal from './LaneEditorModal.vue'

// Use composables
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

const { workflows } = useWorkflowState()

// Mobile detection and state
const isMobile = ref(false)
const isTouchDevice = ref(false)
const dialogWidth = ref('600px')
const transitionName = ref('fade')
const swipeStartX = ref(0)
const swipeThreshold = 100

// Computed properties
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

const progressPercentage = computed(() => {
  return ((currentStepIndex.value + 1) / steps.length) * 100
})

const selectedWorkflowName = computed(() => {
  if (!selectedWorkflowId.value) return ''
  const workflow = workflows.value.find(w => w.id === selectedWorkflowId.value)
  return workflow?.name || ''
})

const selectedLaneName = computed(() => {
  if (!selectedWorkflowId.value || !selectedLaneId.value) return ''
  const workflow = workflows.value.find(w => w.id === selectedWorkflowId.value)
  const lane = workflow?.lanes.find(l => l.id === selectedLaneId.value)
  return lane?.name || ''
})

// Mobile detection
const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Set dialog width based on screen size
  if (isMobile.value) {
    dialogWidth.value = '100vw'
  } else if (window.innerWidth <= 1024) {
    dialogWidth.value = '80vw'
  } else {
    dialogWidth.value = '600px'
  }
}

// Lifecycle
onMounted(() => {
  detectMobile()
  window.addEventListener('resize', detectMobile)
  
  // Add touch-specific styles
  if (isTouchDevice.value) {
    document.body.classList.add('touch-device')
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', detectMobile)
  document.body.classList.remove('touch-device')
})

// Watch for step changes to set transition
watch(currentStep, (newStep, oldStep) => {
  const newIndex = steps.indexOf(newStep)
  const oldIndex = steps.indexOf(oldStep)
  
  if (newIndex > oldIndex) {
    transitionName.value = isMobile.value ? 'slide-left' : 'fade'
  } else {
    transitionName.value = isMobile.value ? 'slide-right' : 'fade'
  }
})

// Event handlers
const handleWorkflowSelect = (workflowId: string) => {
  // Haptic feedback on mobile
  if (isTouchDevice.value && 'vibrate' in navigator) {
    navigator.vibrate(10)
  }
  goToLaneSelection(workflowId)
}

const handleLaneSelect = (laneId: string) => {
  if (isTouchDevice.value && 'vibrate' in navigator) {
    navigator.vibrate(10)
  }
  goToLaneEditor(laneId)
}

const handleBack = () => {
  if (isTouchDevice.value && 'vibrate' in navigator) {
    navigator.vibrate(10)
  }
  goBack()
}

const handleMobileBack = () => {
  if (canGoBack.value) {
    handleBack()
  } else {
    handleClose()
  }
}

const handleClose = () => {
  if (isTouchDevice.value && 'vibrate' in navigator) {
    navigator.vibrate([10, 10])
  }
  closeModal()
}

const handleComplete = () => {
  if (isTouchDevice.value && 'vibrate' in navigator) {
    navigator.vibrate([10, 20, 10])
  }
  completeWorkflow()
}

// Touch gestures for swipe navigation
const handleContentTouchStart = (event: TouchEvent) => {
  if (!isMobile.value || !canGoBack.value) return
  swipeStartX.value = event.touches[0].clientX
}

const handleContentTouchMove = (event: TouchEvent) => {
  if (!isMobile.value || !canGoBack.value || swipeStartX.value === 0) return
  
  const currentX = event.touches[0].clientX
  const deltaX = currentX - swipeStartX.value
  
  // Add visual feedback for swipe
  if (deltaX > 20) {
    const content = event.currentTarget as HTMLElement
    content.style.transform = `translateX(${Math.min(deltaX * 0.3, 50)}px)`
    content.style.opacity = `${1 - Math.min(deltaX / 300, 0.3)}`
  }
}

const handleContentTouchEnd = (event: TouchEvent) => {
  if (!isMobile.value || !canGoBack.value || swipeStartX.value === 0) return
  
  const endX = event.changedTouches[0].clientX
  const deltaX = endX - swipeStartX.value
  
  const content = event.currentTarget as HTMLElement
  content.style.transform = ''
  content.style.opacity = ''
  
  // Check if swipe was significant enough
  if (deltaX > swipeThreshold) {
    handleBack()
  }
  
  swipeStartX.value = 0
}

// Modal lifecycle
const handleModalOpen = () => {
  if (isMobile.value) {
    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden'
  }
}

const handleModalClose = () => {
  if (isMobile.value) {
    // Restore body scroll
    document.body.style.overflow = ''
  }
}

// Mobile-specific actions
const showCreateWorkflow = () => {
  // Emit event to parent or handle workflow creation
  console.log('Create workflow on mobile')
}

const showCreateLane = () => {
  // Emit event to parent or handle lane creation
  console.log('Create lane on mobile')
}

const handleQuickAdd = () => {
  // Quick add pending task and close
  handleComplete()
}
</script>

<style scoped>
/* Base modal styles */
.workflow-flow-modal {
  --step-color: var(--primary-color);
  --step-bg: var(--card-bg);
}

/* Mobile fullscreen modal */
:global(.workflow-flow-modal.mobile-modal) {
  .el-dialog {
    margin: 0 !important;
    height: 100vh !important;
    max-height: 100vh !important;
    display: flex;
    flex-direction: column;
  }
  
  .el-dialog__header {
    padding: 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .el-dialog__body {
    flex: 1;
    padding: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .el-dialog__footer {
    display: none;
  }
}

/* Mobile header */
.mobile-modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--card-bg);
  min-height: 56px;
}

.mobile-back-btn,
.mobile-close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.125rem;
}

.mobile-back-btn:active,
.mobile-close-btn:active {
  background: var(--hover-bg);
  transform: scale(0.95);
}

.mobile-title {
  flex: 1;
  text-align: center;
}

.mobile-title h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-light);
}

.mobile-breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.mobile-breadcrumb i {
  font-size: 0.625rem;
}

/* Mobile step progress */
.mobile-step-progress {
  padding: 0.75rem 1rem;
  background: var(--background-alt);
}

.progress-track {
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.progress-dots {
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color);
  transition: all 0.2s ease;
}

.progress-dot.active {
  background: var(--primary-color);
  transform: scale(1.25);
}

.progress-dot.current {
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.2);
}

/* Modal content */
.modal-content {
  min-height: 300px;
  padding: 1rem 0;
  transition: all 0.3s ease;
}

.modal-content.mobile-content {
  min-height: calc(100vh - 180px);
  padding: 0;
}

.step-content {
  width: 100%;
  height: 100%;
}

/* Swipe indicator */
.swipe-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
  font-size: 0.875rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Mobile footer actions */
.mobile-footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.mobile-action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-action-btn.primary {
  background: var(--primary-color);
  color: white;
}

.mobile-action-btn.success {
  background: var(--success-color);
  color: white;
}

.mobile-action-btn:active {
  transform: scale(0.98);
}

/* Desktop footer */
.modal-footer.desktop {
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

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Touch-specific enhancements */
.touch-device .mobile-action-btn,
.touch-device .mobile-back-btn,
.touch-device .mobile-close-btn {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.touch-device .step-content {
  /* Prevent accidental selections */
  -webkit-user-select: none;
  user-select: none;
}

/* Responsive breakpoints */
@media (max-width: 768px) {
  .modal-content {
    padding: 0;
  }
  
  .modal-footer.desktop {
    flex-direction: column;
    gap: 1rem;
  }
  
  .step-indicator {
    order: -1;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .workflow-flow-modal :deep(.el-dialog) {
    width: 80vw !important;
  }
}
</style>