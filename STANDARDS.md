# Development Standards & Best Practices

This document provides detailed implementation standards for Vue.js 3 + TypeScript projects, ensuring consistency and quality across all development efforts.

## Element Plus Standards

### Component Usage Requirements
**MANDATORY**: Always use Element Plus components instead of custom HTML elements:

| HTML Element | Element Plus Component | Example |
|--------------|----------------------|---------|
| `<button>` | `<el-button>` | `<el-button type="primary">Click</el-button>` |
| `<input>` | `<el-input>` | `<el-input v-model="value" />` |
| `<select>` | `<el-select>` | `<el-select v-model="selected">` |
| `<form>` | `<el-form>` | `<el-form :model="form" :rules="rules">` |
| `<dialog>` | `<el-dialog>` | `<el-dialog v-model="visible">` |

### Button Standards
```vue
<!-- Primary actions -->
<el-button type="primary" size="large">Save Changes</el-button>

<!-- Destructive actions -->
<el-button type="danger">Delete</el-button>

<!-- Secondary actions -->
<el-button type="info">More Info</el-button>

<!-- Icon buttons -->
<el-button type="primary" circle>
  <i class="fas fa-plus"></i>
</el-button>
```

### Form Handling
```vue
<el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
  <el-form-item label="Name" prop="name">
    <el-input v-model="form.name" />
  </el-form-item>
  
  <el-form-item label="Count" prop="count">
    <el-input-number v-model="form.count" :min="0" :max="100" />
  </el-form-item>
  
  <el-form-item>
    <el-button type="primary" @click="submitForm">Submit</el-button>
    <el-button @click="resetForm">Reset</el-button>
  </el-form-item>
</el-form>
```

### User Feedback
```typescript
// Success notification
ElNotification({
  title: 'Success',
  message: 'Operation completed successfully',
  type: 'success',
  duration: 3000
})

// Error handling
ElNotification({
  title: 'Error',
  message: error.message,
  type: 'error',
  duration: 5000
})
```

## Theme System Architecture

### CSS Variable Structure
```css
/* Base theme variables */
:root {
  /* Primary colors */
  --primary-color: #409eff;
  --primary-light: #66b1ff;
  --primary-dark: #3a8ee6;
  
  /* Backgrounds */
  --bg-color: #ffffff;
  --section-bg: #f5f7fa;
  --background-alt: #fafafa;
  
  /* Text colors */
  --text-color: #303133;
  --text-light: #606266;
  --text-muted: #909399;
  
  /* Borders and shadows */
  --border-color: #dcdfe6;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.12);
  --shadow-md: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* Element Plus overrides */
:root {
  --el-color-primary: var(--primary-color);
  --el-color-success: var(--success-color);
  --el-color-warning: var(--warning-color);
  --el-color-danger: var(--danger-color);
  --el-text-color-primary: var(--text-color);
  --el-text-color-regular: var(--text-light);
  --el-text-color-secondary: var(--text-muted);
  --el-bg-color: var(--bg-color);
  --el-bg-color-page: var(--section-bg);
  --el-border-color: var(--border-color);
}
```

### Theme Implementation
```javascript
// useTheme.js structure
const themes = {
  ocean: {
    '--primary-color': '#409eff',
    '--bg-color': '#ffffff',
    // ... other variables
  },
  forest: {
    '--primary-color': '#67c23a',
    '--bg-color': '#f0f9ff',
    // ... other variables
  }
}

export function useTheme() {
  const currentTheme = ref('ocean')
  
  function setTheme(themeName) {
    const theme = themes[themeName]
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })
    currentTheme.value = themeName
  }
  
  return { currentTheme, setTheme, themes }
}
```

## Component Layout Patterns

### Demo Component Header Structure
All demo components must follow this unified header pattern:

```vue
<template>
  <div class="demo-name">
    <!-- Unified Header -->
    <header class="optimizer-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">Demo Title</h1>
          <p class="page-description">
            Brief description of what this demo showcases
          </p>
        </div>
        <div class="header-controls">
          <div class="header-actions">
            <el-button 
              class="control-btn help-btn" 
              type="info" 
              size="default" 
              circle
              @click="showHelp"
            >
              <i class="fas fa-question-circle"></i>
            </el-button>
            <el-button 
              class="control-btn config-btn" 
              type="info" 
              size="default" 
              circle
              @click="showConfig"
            >
              <i class="fas fa-cog"></i>
            </el-button>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Main Content -->
    <main class="demo-content">
      <!-- Demo implementation -->
    </main>
  </div>
</template>

<style scoped>
.demo-name {
  min-height: 100vh;
  background: var(--bg-color);
  display: flex;
  flex-direction: column;
}

.optimizer-header {
  background: linear-gradient(135deg, var(--section-bg) 0%, var(--background-alt) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 2rem;
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-light);
  line-height: 1.2;
}

.page-description {
  margin: 0;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.5;
  max-width: 500px;
}

.demo-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .optimizer-header {
    padding: 1.5rem 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .demo-content {
    padding: 1rem;
  }
}
</style>
```

### Modal & Overlay Best Practices
```vue
<el-dialog
  v-model="dialogVisible"
  title="Select Items"
  width="80%"
  :before-close="handleClose"
>
  <div class="modal-grid">
    <div 
      v-for="item in items" 
      :key="item.id"
      class="modal-item"
      @click="selectItem(item)"
    >
      <i :class="item.icon"></i>
      <span>{{ item.name }}</span>
    </div>
  </div>
</el-dialog>

<style scoped>
.modal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.modal-item {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}
</style>
```

## Animation Standards

### Standard Transitions
```css
/* Default transition for all interactive elements */
.interactive-element {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* Pulse animation for attention */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

### Vue Transitions
```vue
<transition name="fade" mode="out-in">
  <component :is="currentView" />
</transition>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Touch & Drag-Drop Implementation

### Unified Touch/Mouse Handling
```typescript
// useTouchDrag.ts
export function useTouchDrag(options: TouchDragOptions) {
  const { onDragStart, onDragMove, onDragEnd, threshold = 10 } = options
  
  let startX = 0
  let startY = 0
  let isDragging = false
  
  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
  }
  
  function handleTouchMove(e: TouchEvent) {
    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    
    if (!isDragging && (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold)) {
      isDragging = true
      onDragStart?.(e)
    }
    
    if (isDragging) {
      e.preventDefault()
      onDragMove?.(e)
    }
  }
  
  function handleTouchEnd(e: TouchEvent) {
    if (isDragging) {
      isDragging = false
      onDragEnd?.(e)
    }
  }
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}
```

### CSS Requirements for Touch
```css
/* Draggable elements */
.draggable {
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Scroll containers */
.horizontal-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
}

/* Touch feedback */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

.touch-target:active {
  transform: scale(0.98);
  opacity: 0.8;
}
```

## TypeScript Patterns

### Interface Definitions
```typescript
// Component props
interface ComponentProps {
  modelValue: string
  disabled?: boolean
  placeholder?: string
}

// Event emissions
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'blur': [event: FocusEvent]
}>()

// Composable return types
interface UseFeatureReturn {
  state: Readonly<FeatureState>
  actions: FeatureActions
  computed: ComputedFeatureValues
}
```

### Error Handling Patterns
```typescript
// Async operation with proper error handling
async function fetchData() {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.getData()
    data.value = response.data
    
    ElNotification({
      title: 'Success',
      message: 'Data loaded successfully',
      type: 'success'
    })
  } catch (err) {
    error.value = err as Error
    console.error('Failed to fetch data:', err)
    
    ElNotification({
      title: 'Error',
      message: err.message || 'Failed to load data',
      type: 'error',
      duration: 5000
    })
  } finally {
    loading.value = false
  }
}
```

## Mobile Optimization

### Responsive Design Patterns
```css
/* Mobile-first approach */
.container {
  padding: 1rem;
  width: 100%;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1400px;
  }
}

/* Touch-friendly spacing */
.mobile-list-item {
  min-height: 48px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
}

/* Horizontal scrolling for mobile */
.mobile-scroll-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  scroll-snap-type: x proximity;
}

.mobile-scroll-item {
  flex: 0 0 auto;
  min-width: 280px;
  scroll-snap-align: start;
}
```

## Performance Optimization

### Component Optimization
```vue
<script setup lang="ts">
// Lazy load heavy components
const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))

// Use shallowRef for large objects
const largeData = shallowRef<LargeDataType>({})

// Debounce expensive operations
const searchQuery = ref('')
const debouncedSearch = useDebounceFn(() => {
  performSearch(searchQuery.value)
}, 300)

// Proper cleanup
onUnmounted(() => {
  // Cancel any pending operations
  // Remove event listeners
  // Clear timers
})
</script>
```

### Virtual Scrolling
```vue
<!-- For large lists -->
<virtual-list
  :data-key="'id'"
  :data-sources="items"
  :estimate-size="50"
  :buffer="5"
>
  <template #default="{ item }">
    <list-item :item="item" />
  </template>
</virtual-list>
```

## Testing Integration Points

### Component Testing Checklist
- ✅ Element Plus directives properly registered
- ✅ Props validation and type checking
- ✅ Event emissions properly typed
- ✅ Drag-and-drop functionality across browsers
- ✅ Theme switching without visual glitches
- ✅ Responsive behavior at all breakpoints
- ✅ Touch interactions on mobile devices
- ✅ Accessibility features (keyboard nav, screen readers)

## Version Control & Documentation

### Documentation Standards
- Keep documentation in sync with code
- Document all public APIs
- Include examples for complex features
- Maintain changelog for breaking changes

### Code Review Checklist
- [ ] Element Plus components used (no raw HTML)
- [ ] TypeScript types properly defined
- [ ] CSS variables used for theming
- [ ] Mobile responsiveness verified
- [ ] Performance optimizations applied
- [ ] Error handling implemented
- [ ] Documentation updated

## Migration Guide

### Converting HTML to Element Plus
```vue
<!-- Before -->
<button class="btn btn-primary" @click="save">Save</button>
<input type="text" v-model="name" placeholder="Enter name">
<select v-model="selected">
  <option value="1">Option 1</option>
</select>

<!-- After -->
<el-button type="primary" @click="save">Save</el-button>
<el-input v-model="name" placeholder="Enter name" />
<el-select v-model="selected">
  <el-option label="Option 1" value="1" />
</el-select>
```

## Version
Last Updated: 2025-01-13
Standards Version: 2.0