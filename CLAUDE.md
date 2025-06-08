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
