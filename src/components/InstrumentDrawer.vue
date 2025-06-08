<template>
  <div class="instrument-drawer" :class="{ 'drawer-open': isOpen }">
    <div class="drawer-header" @click="toggleDrawer">
      <div class="drawer-title">
        <i :class="icon"></i>
        <span>{{ title }}</span>
        <span class="item-count">({{ items.length }})</span>
      </div>
      <i :class="isOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
    </div>
    
    <transition name="drawer-slide">
      <div v-show="isOpen" class="drawer-content">
        <div class="drawer-items">
          <slot :items="items">
            <!-- Default slot content -->
            <div v-for="(item, index) in items" :key="index" class="drawer-item">
              {{ item }}
            </div>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  icon: string
  items: any[]
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false
})

const emit = defineEmits<{
  toggle: [isOpen: boolean]
  'item-action': [item: any, action: string]
}>()

const isOpen = ref(props.defaultOpen)

const toggleDrawer = () => {
  isOpen.value = !isOpen.value
  emit('toggle', isOpen.value)
}

// Expose methods for parent component control
defineExpose({
  open: () => { isOpen.value = true },
  close: () => { isOpen.value = false },
  toggle: toggleDrawer
})
</script>

<style scoped>
.instrument-drawer {
  position: relative;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: visible; /* Changed from hidden */
  transition: all 0.3s ease;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--section-bg);
  cursor: pointer;
  transition: background-color 0.2s ease;
  user-select: none;
}

.drawer-header:hover {
  background-color: var(--card-bg);
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-weight: 500;
  min-width: 0; /* Enable text shrinking */
  overflow: hidden;
}

.drawer-title span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}



.drawer-title i {
  font-size: 1rem;
  color: var(--primary-color);
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.drawer-title span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.item-count {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: normal;
  flex-shrink: 0; /* Prevent count from shrinking */
}

.drawer-content {
  position: relative;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.drawer-items {
  padding: 1rem;
}

.drawer-item {
  padding: 0.5rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.drawer-item:hover {
  border-color: var(--primary-color);
  transform: translateX(4px);
}

/* Transition animations */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.3s ease;
}

.drawer-slide-enter-from {
  max-height: 0;
  opacity: 0;
}

.drawer-slide-enter-to {
  max-height: 400px;
  opacity: 1;
}

.drawer-slide-leave-from {
  max-height: 400px;
  opacity: 1;
}

.drawer-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Scrollbar styling */
.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
  background: var(--bg-color);
}

.drawer-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* Responsive */
@media (max-width: 768px) {
  .drawer-header {
    padding: 0.5rem 0.75rem;
  }
  
  .drawer-title {
    font-size: 0.9rem;
  }
  
  .drawer-content {
    max-height: 300px;
  }
  
  .drawer-items {
    padding: 0.75rem;
  }
}
</style>