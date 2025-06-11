Darren Arney Portfolio Project
Project Overview
Vue.js 3 portfolio website showcasing laboratory automation expertise with an interactive workflow optimization demo. Features modern UI with dynamic theming, responsive design, and advanced drag-and-drop functionality.
Tech Stack

Frontend: Vue 3 (Composition API), TypeScript
UI: Element Plus, custom CSS with CSS variables
Build: Vite, Vue Router
Libraries: Vue3 Particles, FontAwesome, vue3-observe-visibility
Analytics: Google Analytics

Project Structure
src/
├── components/
│   ├── workflow/              # Workflow optimizer components
│   │   ├── WorkflowOptimizer.vue    # Main demo component
│   │   ├── WorkflowBuilder.vue      # Drag-drop workflow builder
│   │   ├── GanttChart.vue          # Schedule visualization
│   │   ├── OptimizationMetrics.vue  # Performance metrics
│   │   └── InstrumentPalette.vue   # Instrument selection
│   ├── demos/                 # Demo placeholders
│   ├── ProjectCard.vue        # Project showcase cards
│   ├── ParticlesCanvas.vue    # Animated background
│   └── TaskCard.vue          # Individual task components
├── views/                     # Page components
│   ├── HomePage.vue          # Landing page with hero
│   ├── ProjectsPage.vue      # Portfolio showcase
│   ├── ExperiencePage.vue    # Professional timeline
│   ├── ContactPage.vue       # Contact form
│   └── DemosPage.vue         # Interactive demonstrations
├── composables/              # Vue 3 composables
│   ├── useTheme.js          # Theme management (5 themes)
│   ├── useWorkflowState.ts  # Workflow state management
│   ├── useConnections.ts    # Visual connections for workflows
│   └── useDragDrop.ts       # Drag and drop utilities
├── constants/               # Configuration data
│   ├── instruments.ts       # Laboratory instrument definitions
│   └── icons.ts            # Icon options for customization
├── types/                   # TypeScript type definitions
│   └── workflow.ts         # Workflow, task, and scheduling types
├── utils/                   # Business logic
│   └── optimizationEngine.ts # Schedule optimization algorithms
└── router/                  # Vue Router configuration
Key Features
1. Dynamic Theming System

5 custom themes: Ocean (default), Forest, Monochrome, Purdue, Pacers
CSS variables for consistent styling
Theme persistence and smooth transitions
Responsive color schemes

2. Interactive Workflow Optimizer

Drag & Drop: Instrument palette to workflow lanes
Real-time Scheduling: Optimization engine with conflict detection
Gantt Visualization: Interactive timeline with zoom controls
Performance Metrics: Utilization, conflicts, throughput analysis
Resource Management: Configurable instrument capacities

3. Professional Portfolio

Animated hero section with particles background
Experience timeline with downloadable resume
Project showcase with filtering
Contact form with validation
Mobile-responsive design

Common Tasks
Theme Development

Modify themes in src/composables/useTheme.js
Add CSS variables for new color schemes
Update component-specific theme handling

Workflow Engine Enhancement

Core logic in src/utils/optimizationEngine.ts
Task scheduling algorithms with dependency resolution
Conflict detection and resource allocation
Metrics calculation (utilization, bottlenecks)

UI Component Updates

Main demo: src/components/workflow/WorkflowOptimizer.vue
Drag/drop state management in reactive objects
Modal system for instrument/task selection
Tab navigation between builder and results

Content Management

Experience data in src/views/ExperiencePage.vue
Project data in src/views/ProjectsPage.vue
Instrument definitions in src/constants/instruments.ts

Responsive Design

Mobile-first approach with progressive enhancement
Breakpoints: 768px (tablet), 1024px (desktop)
Touch-friendly interfaces for mobile devices

Development Guidelines
State Management

Composables for reusable logic (useTheme, useWorkflowState)
Reactive objects for complex state (drag/drop)
provide/inject for component communication

Performance Optimization

Lazy loading for heavy components
Virtual scrolling considerations for large datasets
Efficient drag/drop with proper cleanup

Accessibility

Semantic HTML structure
Keyboard navigation support
Screen reader compatibility
High contrast ratios in all themes

Code Style

Vue 3 Composition API with <script setup>
TypeScript for type safety
Modular CSS with scoped styles
Consistent naming conventions

Deployment Configuration

Vite build optimization
Manual chunk splitting for vendors
History API fallback for SPA routing
Google Analytics integration

Known Issues & Limitations

Storage: No localStorage in Claude.ai artifacts environment
Performance: Complex calculations may need optimization for very large workflows
Browser Support: Modern browsers only (ES6+ features)

## New Demo Applications

### 1. Liquid Handler Control Demo
Real-time control interface for liquid handling operations showcasing instrument control expertise.

**Architecture:**
- **Reusable Components:**
  - `WorkflowStep.vue` → Individual liquid transfer steps
  - `GanttChart.vue` → Real-time protocol execution timeline
  - `useConnections.ts` → Animated liquid transfer paths
  - `useDragDrop.ts` → Drag labware onto deck positions
  - `OptimizationMetrics.vue` → Transfer metrics (volume accuracy, precision, throughput)
  - `InstrumentPalette.vue` → Labware selection (plates, tips, reagents)
  - `Step` & `ScheduledTask` types → Transfer operations

- **New Features:**
  - Deck layout visualization (8x12 grid)
  - Real-time volume tracking
  - Error state handling with Element Plus notifications
  - Protocol pause/resume controls

### 2. Method Validation Dashboard
Track and visualize analytical method validation demonstrating regulatory and quality expertise.

**Architecture:**
- **Reusable Components:**
  - `Lane` structure → Validation phases (Specificity, Linearity, Accuracy, Precision)
  - `TaskListEditor.vue` → Protocol step management
  - `WorkflowThumbnail.vue` → Validation protocol previews
  - `OptimizationMetrics.vue` → Validation results (R², %RSD, %Recovery)
  - `MultiLaneEditor.vue` → Batch validation management
  - `Workflow` type → Validation studies

- **New Features:**
  - Statistical calculations with result visualization
  - Pass/fail criteria with Element Plus tags
  - Regulatory compliance checkpoints
  - Export validation reports

## Element Plus Best Practices

### Component Usage
- Use Element Plus components for consistency:
  - `el-button` for all actions with appropriate type and size
  - `el-card` for content containers with proper shadow levels
  - `el-notification` for user feedback
  - `el-tooltip` for helpful hints
  - `el-progress` for long-running operations
  - `el-tag` for status indicators

### Theme Integration
- Override Element Plus CSS variables in each theme:
  ```css
  --el-color-primary: var(--primary);
  --el-color-success: var(--success);
  --el-color-warning: var(--warning);
  --el-color-danger: var(--danger);
  ```
- Use Element Plus breakpoint mixins for responsive design
- Maintain consistent spacing with Element Plus grid system

### Form Handling
- Use Element Plus form validation for all inputs
- Implement loading states with `v-loading` directive
- Use `el-form-item` with proper label alignment
- Apply consistent error messaging patterns

### Mobile Optimization
- Use `el-drawer` for mobile navigation
- Implement `el-collapse` for mobile-friendly content
- Adjust Element Plus component sizes for touch targets
- Use `el-popover` instead of tooltips on mobile

## Styling & Theming Guidelines

### CSS Architecture
- Component-specific styles in `<style scoped>`
- Global theme variables in `useTheme.js`
- Mobile-specific overrides in separate CSS files
- Smooth transitions between theme changes

### Theme Consistency
- All demos must support all 5 themes
- Use CSS variables exclusively for colors
- Test demos in each theme before deployment
- Maintain contrast ratios for accessibility

### Animation Standards
- Use CSS transitions for simple animations
- Implement Vue transition components for complex animations
- Respect user's `prefers-reduced-motion` preference
- Keep animations under 300ms for responsiveness

## **Batch 3: Supporting Components** 
*Files: `WorkflowThumbnail.vue`, `LanePreview.vue`, `TaskListEditor.vue`*

Create reusable display components:

1. **WorkflowThumbnail.vue**: Compact workflow preview with LH transfer connections
2. **LanePreview.vue**: Simplified lane display for selection
3. **TaskListEditor.vue**: Enhanced version of current lane editor with:
   - Drag/drop for desktop
   - Arrow controls for mobile
   - Horizontal scrolling support