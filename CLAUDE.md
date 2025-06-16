# Vue.js 3 + TypeScript Development Standards

This document serves as the universal template for Vue.js 3 projects with TypeScript, providing consistent standards and best practices across all implementations.

## Core Technology Stack
- **Framework**: Vue 3 with Composition API (`<script setup>` syntax)
- **Language**: TypeScript with strict mode
- **UI Library**: Element Plus (mandatory for all UI components)
- **Build Tool**: Vite
- **CSS**: Scoped styles with CSS custom properties
- **State Management**: Composables pattern

## Project Structure Template
```
src/
├── components/          # Reusable UI components
├── views/              # Page-level components
├── composables/        # Shared logic and state
├── types/              # TypeScript type definitions
├── utils/              # Business logic and helpers
├── constants/          # Configuration and constants
├── assets/            # Static assets
└── router/            # Routing configuration
```

## Development Standards

### 1. Component Architecture
- Use Vue 3 Composition API with `<script setup lang="ts">`
- Define TypeScript interfaces for all props
- Implement proper emit type definitions
- Use composables for reusable logic
- Follow single responsibility principle

### 2. Element Plus Integration
**MANDATORY**: Use Element Plus components for ALL UI elements
- `el-button` for all buttons (never `<button>`)
- `el-input` / `el-input-number` for all inputs
- `el-select` for all dropdowns
- `el-form` with validation for all forms
- `el-notification` for user feedback
- `el-dialog` for modals
- `el-loading` directive for async operations

### 3. TypeScript Best Practices
- Enable strict mode in tsconfig.json
- Define interfaces for all data structures
- Use proper type annotations (avoid `any`)
- Implement type guards for runtime safety
- Clean up unused imports regularly
- Use optional chaining (`?.`) appropriately

### 4. Component Layout Standards
```vue
<template>
  <div class="component-name">
    <header class="component-header">
      <div class="header-content">
        <h1 class="page-title">Title</h1>
        <p class="page-description">Description</p>
      </div>
    </header>
    <main class="component-content">
      <!-- Content -->
    </main>
  </div>
</template>

<style scoped>
.component-name {
  min-height: 100vh;
  background: var(--bg-color);
}

.component-header {
  background: linear-gradient(135deg, var(--section-bg) 0%, var(--background-alt) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
```

### 5. CSS Architecture
- Use CSS custom properties for all colors
- Implement scoped styles for components
- Follow consistent spacing (rem units)
- Include responsive breakpoints
- Support theme switching via CSS variables

### 6. Mobile Optimization
- Touch targets minimum 44px
- Responsive breakpoints: 768px (tablet), 1024px (desktop)
- Touch-friendly drag and drop
- Optimized scrolling behavior
- Progressive enhancement approach

## Code Quality Standards

### 1. Error Handling
- Wrap async operations in try-catch
- Use Element Plus notifications for user feedback
- Implement proper loading states
- Provide fallback UI for errors
- Log errors with context

### 2. Performance Guidelines
- Lazy load heavy components
- Use `v-show` vs `v-if` appropriately
- Implement proper cleanup in `onUnmounted`
- Debounce expensive operations
- Optimize bundle size with code splitting

### 3. Accessibility Requirements
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- High contrast theme support

## System-Wide Audit Workflow

### Quarterly Code Quality Audit
Perform comprehensive audits to maintain code quality:

#### 1. Structure Analysis
- [ ] Component adherence to layout standards
- [ ] Proper file organization
- [ ] Dependency management review
- [ ] Dead code elimination

#### 2. Standards Compliance
- [ ] Element Plus usage (no raw HTML elements)
- [ ] TypeScript strict mode compliance
- [ ] CSS variable implementation
- [ ] Theme consistency

#### 3. Performance & Accessibility
- [ ] Mobile responsiveness testing
- [ ] Touch target sizing (≥44px)
- [ ] Loading state implementation
- [ ] Error boundary coverage

#### 4. Documentation Sync
- [ ] Verify docs match implementation
- [ ] Update deprecated patterns
- [ ] Document new discoveries
- [ ] Archive outdated standards

### Automated Checks
Configure these tools for continuous quality:
```json
{
  "scripts": {
    "lint": "eslint . --ext .vue,.js,.ts",
    "typecheck": "vue-tsc --noEmit",
    "audit": "npm run lint && npm run typecheck"
  }
}
```

## Git Commit Standards
- Use conventional commits format
- Include ticket/issue references
- Keep commits atomic and focused
- Write clear commit messages

## Development Workflow
1. Create feature branch from main
2. Implement with standards compliance
3. Run audit checks before commit
4. Submit PR with checklist
5. Merge after review approval

## Common Patterns

### Composable Template
```typescript
export function useFeatureName() {
  const state = reactive({
    // state definition
  })

  const computedValue = computed(() => {
    // computed logic
  })

  function actionMethod() {
    // method implementation
  }

  return {
    state: readonly(state),
    computedValue,
    actionMethod
  }
}
```

### Type Definition Template
```typescript
export interface EntityName {
  id: string
  name: string
  properties: EntityProperties
}

export type EntityState = 'active' | 'inactive' | 'pending'
```

## Project-Specific Documentation
For project-specific details, implementation notes, and current development status, refer to `PROJECT.md` in the repository root.

## Version
Last Updated: 2025-01-13
Template Version: 2.0