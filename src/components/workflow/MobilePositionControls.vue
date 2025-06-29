<template>
  <div class="mobile-position-controls" :class="{ 'expanded': isExpanded }">
    <!-- Toggle Button -->
    <el-button
      class="controls-toggle"
      type="info"
      @click="toggleExpanded"
      :class="{ 'active': isExpanded }"
    >
      <i class="fas fa-arrows-alt"></i>
      <span>Position</span>
    </el-button>

    <!-- Expanded Controls -->
    <transition name="controls-slide">
      <div v-if="isExpanded" class="controls-panel">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <el-button
            class="quick-btn"
            type="primary"
            @click="handleMoveToStart"
            :disabled="!canMoveToStart"
            title="Move to start"
          >
            <i class="fas fa-angle-double-left"></i>
            <span>Start</span>
          </el-button>
          
          <el-button
            class="quick-btn"
            type="primary"
            @click="handleMoveToEnd"
            :disabled="!canMoveToEnd"
            title="Move to end"
          >
            <i class="fas fa-angle-double-right"></i>
            <span>End</span>
          </el-button>
        </div>

        <!-- Step-by-step Controls -->
        <div class="step-controls">
          <el-button
            class="step-btn prev"
            type="info"
            circle
            @click="handleMovePrevious"
            :disabled="!canMovePrevious"
            @touchstart="startRepeating('prev')"
            @touchend="stopRepeating"
            @touchcancel="stopRepeating"
          >
            <i class="fas fa-chevron-left"></i>
          </el-button>
          
          <div class="position-display">
            <span class="current-position">{{ currentPosition }}</span>
            <span class="position-divider">/</span>
            <span class="total-positions">{{ totalPositions }}</span>
          </div>
          
          <el-button
            class="step-btn next"
            type="info"
            circle
            @click="handleMoveNext"
            :disabled="!canMoveNext"
            @touchstart="startRepeating('next')"
            @touchend="stopRepeating"
            @touchcancel="stopRepeating"
          >
            <i class="fas fa-chevron-right"></i>
          </el-button>
        </div>

        <!-- Direct Position Input -->
        <div class="direct-input">
          <label for="position-input">Go to position:</label>
          <div class="input-group">
            <el-input-number 
              id="position-input"
              v-model="targetPosition"
              :min="1"
              :max="totalPositions"
              class="position-input"
              size="small"
              @keyup.enter="handleGoToPosition"
            />
            <el-button
              class="go-btn"
              type="primary"
              @click="handleGoToPosition"
              :disabled="!isValidTargetPosition"
            >
              Go
            </el-button>
          </div>
        </div>

        <!-- Visual Position Slider -->
        <div class="position-slider">
          <el-slider 
            :min="1"
            :max="totalPositions"
            :model-value="currentPosition"
            @input="handleSliderMove"
            @change="handleSliderRelease"
            class="slider"
            :show-tooltip="false"
          />
          <div class="slider-track">
            <div 
              v-for="n in totalPositions" 
              :key="n"
              class="slider-tick"
              :class="{ 'active': n === currentPosition }"
            ></div>
          </div>
        </div>

        <!-- Gesture Hints -->
        <div class="gesture-hints">
          <div class="hint-item">
            <i class="fas fa-hand-paper"></i>
            <span>Hold buttons to repeat</span>
          </div>
          <div class="hint-item">
            <i class="fas fa-arrows-alt-h"></i>
            <span>Swipe item to reorder</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- Haptic Feedback Indicator -->
    <div v-if="hapticActive" class="haptic-indicator">
      <div class="haptic-wave"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

interface Props {
  currentIndex: number
  totalItems: number
  isMoving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isMoving: false
})

const emit = defineEmits<{
  moveToPosition: [newIndex: number]
  moveNext: []
  movePrevious: []
  moveToStart: []
  moveToEnd: []
}>()

// Reactive state
const isExpanded = ref(false)
const targetPosition = ref(1)
const hapticActive = ref(false)
const repeatTimer = ref<NodeJS.Timeout | null>(null)
const repeatInterval = ref<NodeJS.Timeout | null>(null)

// Computed properties
const currentPosition = computed(() => props.currentIndex + 1)
const totalPositions = computed(() => Math.max(props.totalItems, 1))

const canMovePrevious = computed(() => props.currentIndex > 0)
const canMoveNext = computed(() => props.currentIndex < props.totalItems - 1)
const canMoveToStart = computed(() => props.currentIndex > 0)
const canMoveToEnd = computed(() => props.currentIndex < props.totalItems - 1)

const isValidTargetPosition = computed(() => {
  return targetPosition.value >= 1 && 
         targetPosition.value <= totalPositions.value &&
         targetPosition.value !== currentPosition.value
})

// Removed sliderStyle - Element Plus slider handles styling internally

// Watch for position changes to update target input
watch(currentPosition, (newPos) => {
  targetPosition.value = newPos
})

// Lifecycle cleanup
onUnmounted(() => {
  clearRepeating()
})

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  triggerHaptic()
}

const triggerHaptic = (pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
    hapticActive.value = true
    setTimeout(() => {
      hapticActive.value = false
    }, 200)
  }
}

const handleMovePrevious = () => {
  if (canMovePrevious.value) {
    emit('movePrevious')
    triggerHaptic()
  }
}

const handleMoveNext = () => {
  if (canMoveNext.value) {
    emit('moveNext')
    triggerHaptic()
  }
}

const handleMoveToStart = () => {
  if (canMoveToStart.value) {
    emit('moveToStart')
    triggerHaptic([20, 10, 20])
  }
}

const handleMoveToEnd = () => {
  if (canMoveToEnd.value) {
    emit('moveToEnd')
    triggerHaptic([20, 10, 20])
  }
}

const handleGoToPosition = () => {
  if (isValidTargetPosition.value) {
    emit('moveToPosition', targetPosition.value - 1)
    triggerHaptic([15, 15, 15])
  }
}

const handleSliderMove = (newPosition: number) => {
  if (newPosition !== currentPosition.value) {
    emit('moveToPosition', newPosition - 1)
    triggerHaptic(5) // Light haptic for slider
  }
}

const handleSliderRelease = () => {
  triggerHaptic([10, 10]) // Confirm haptic
}

// Repeat functionality for long press
const startRepeating = (direction: 'prev' | 'next') => {
  clearRepeating()
  
  // Initial delay before repeating starts
  repeatTimer.value = setTimeout(() => {
    // Start repeating
    repeatInterval.value = setInterval(() => {
      if (direction === 'prev' && canMovePrevious.value) {
        emit('movePrevious')
        triggerHaptic(5)
      } else if (direction === 'next' && canMoveNext.value) {
        emit('moveNext')
        triggerHaptic(5)
      } else {
        stopRepeating()
      }
    }, 150) // Repeat every 150ms
  }, 500) // Start repeating after 500ms
}

const stopRepeating = () => {
  clearRepeating()
}

const clearRepeating = () => {
  if (repeatTimer.value) {
    clearTimeout(repeatTimer.value)
    repeatTimer.value = null
  }
  if (repeatInterval.value) {
    clearInterval(repeatInterval.value)
    repeatInterval.value = null
  }
}
</script>

<style scoped>
.mobile-position-controls {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 1000;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.mobile-position-controls.expanded {
  transform: translateY(-10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.controls-toggle {
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
}

.controls-toggle i {
  margin-right: 0.375rem;
}

.controls-toggle:active {
  transform: scale(0.98);
  background: var(--hover-bg);
}

.controls-toggle.active {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.controls-toggle i {
  font-size: 1.125rem;
  transition: transform 0.3s ease;
}

.controls-toggle.active i {
  transform: rotate(45deg);
}

.controls-panel {
  padding: 0 1rem 1rem;
  border-top: 1px solid var(--border-light);
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quick-btn {
  flex: 1;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.quick-btn i {
  font-size: 1rem;
  margin: 0;
}

.quick-btn span {
  display: block;
}

.quick-btn:active:not(:disabled) {
  transform: scale(0.95);
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.quick-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.quick-btn i {
  font-size: 1rem;
}

.step-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}

.step-btn {
  min-width: 48px !important;
  width: 48px !important;
  height: 48px !important;
  font-size: 1.125rem;
}

.step-btn:active:not(:disabled) {
  transform: scale(0.9);
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.step-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.position-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-light);
}

.current-position {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.position-divider {
  color: var(--text-muted);
  margin: 0 0.25rem;
}

.total-positions {
  color: var(--text-muted);
}

.direct-input {
  margin-bottom: 1rem;
}

.direct-input label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

/* Element Plus input styling */
:deep(.position-input) {
  flex: 1;
}

:deep(.position-input .el-input__inner) {
  background: var(--background-alt);
  border-color: var(--border-light);
  border-radius: 8px;
  color: var(--text-light);
  font-size: 1rem;
  text-align: center;
  padding: 0.75rem;
}

:deep(.position-input .el-input__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.go-btn {
  font-size: 0.875rem;
  font-weight: 500;
}

.go-btn:active:not(:disabled) {
  transform: scale(0.95);
  background: var(--primary-dark);
}

.go-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.position-slider {
  position: relative;
  margin-bottom: 1rem;
}

/* Element Plus slider styling */
:deep(.slider .el-slider__runway) {
  background: var(--border-color);
  height: 8px;
  border-radius: 4px;
}

:deep(.slider .el-slider__bar) {
  background: var(--primary-color);
  border-radius: 4px;
}

:deep(.slider .el-slider__button) {
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

:deep(.slider .el-slider__button:hover) {
  transform: scale(1.2);
}

.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 8px;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.slider-tick {
  width: 2px;
  height: 100%;
  background: var(--border-color);
  border-radius: 1px;
  transition: background-color 0.2s ease;
}

.slider-tick.active {
  background: var(--primary-color);
  width: 4px;
}

.gesture-hints {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.hint-item i {
  width: 16px;
  text-align: center;
  color: var(--primary-color);
}

.haptic-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.haptic-wave {
  width: 40px;
  height: 40px;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  animation: hapticWave 0.6s ease-out;
}

@keyframes hapticWave {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Transitions */
.controls-slide-enter-active,
.controls-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.controls-slide-enter-from,
.controls-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.controls-slide-enter-to,
.controls-slide-leave-from {
  max-height: 400px;
  opacity: 1;
  transform: translateY(0);
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .mobile-position-controls {
    left: 0.5rem;
    right: 0.5rem;
  }
  
  .controls-panel {
    padding: 0 0.75rem 0.75rem;
  }
  
  .step-btn {
    width: 44px;
    height: 44px;
  }
  
  .position-display {
    font-size: 1.125rem;
  }
  
  .current-position {
    font-size: 1.375rem;
  }
}

/* Landscape mode */
@media (max-width: 768px) and (orientation: landscape) {
  .mobile-position-controls {
    bottom: 0.5rem;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: 90%;
    max-width: 600px;
  }
  
  .mobile-position-controls.expanded {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .mobile-position-controls {
    border-width: 2px;
  }
  
  .quick-btn,
  .step-btn,
  .position-input,
  .go-btn {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .mobile-position-controls,
  .controls-toggle i,
  .step-btn,
  .quick-btn,
  .go-btn {
    transition: none;
  }
  
  .haptic-wave {
    animation: none;
  }
}
</style>