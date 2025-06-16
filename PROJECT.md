# Darren Arney Portfolio Project

## Project Overview
Vue.js 3 portfolio website showcasing laboratory automation expertise with interactive workflow optimization demos. Features modern UI with dynamic theming, responsive design, and advanced drag-and-drop functionality.

## Technology Stack
- **Frontend**: Vue 3 (Composition API), TypeScript
- **UI**: Element Plus, custom CSS with CSS variables
- **Build**: Vite, Vue Router
- **Libraries**: Vue3 Particles, FontAwesome, vue3-observe-visibility
- **Analytics**: Google Analytics

## Key Features

### 1. Dynamic Theming System
- 5 custom themes: Ocean (default), Forest, Monochrome, Purdue, Pacers
- CSS variables for consistent styling
- Theme persistence and smooth transitions
- Responsive color schemes

### 2. Interactive Workflow Optimizer
- Drag & Drop: Instrument palette to workflow lanes
- Real-time Scheduling: Optimization engine with conflict detection
- Gantt Visualization: Interactive timeline with zoom controls
- Performance Metrics: Utilization, conflicts, throughput analysis
- Resource Management: Configurable instrument capacities

### 3. Professional Portfolio
- Animated hero section with particles background
- Experience timeline with downloadable resume
- Project showcase with filtering
- Contact form with validation
- Mobile-responsive design

## Implemented Demo Applications

### 1. Workflow Optimizer (Complete)
Main demo showcasing laboratory workflow optimization with drag-and-drop builder, Gantt chart visualization, and performance metrics.

### 2. Liquid Handler Control Demo (Complete)
Real-time control interface for liquid handling operations featuring:
- 8x12 deck layout visualization
- Real-time volume tracking
- Protocol execution timeline
- Error state handling

### 3. Instrument Control Simulator (Complete)
Laboratory instrument control simulation with:
- Multiple instrument types
- Real-time status monitoring
- Queue management
- Performance tracking

### 4. Cell Imaging Scheduler (Complete)
Automated microscopy scheduling demo featuring:
- Multi-well plate visualization
- Imaging protocol configuration
- Time-lapse scheduling
- Resource optimization

### 5. Method Validation Dashboard (Pending)
Track and visualize analytical method validation:
- Validation phases: Specificity, Linearity, Accuracy, Precision
- Statistical calculations with result visualization
- Pass/fail criteria with Element Plus tags
- Regulatory compliance checkpoints

## Current Development Status

### Completed Features
- ✅ Core workflow optimization engine
- ✅ All major demo applications (except Method Validation)
- ✅ Theme system with 5 themes
- ✅ Mobile responsive design
- ✅ Touch drag-and-drop support
- ✅ Professional portfolio pages

### In Progress
- 🔄 System-wide Element Plus migration (19 components need updates)
- 🔄 Header standardization (5 components need unified headers)
- 🔄 TypeScript cleanup and optimization
- 🔄 Method Validation Dashboard implementation

### Known Issues
Based on recent audit (2025-01-13):
1. **Element Plus Violations**: 19 components using raw HTML elements instead of Element Plus
2. **Header Inconsistencies**: Some demos not following unified header pattern
3. **TypeScript Issues**: Unused imports and missing type annotations
4. **Missing Demo**: Method Validation Dashboard documented but not implemented

## Project-Specific Components

### Workflow Components (`src/components/workflow/`)
- **WorkflowOptimizer.vue**: Main demo component (reference implementation)
- **WorkflowBuilder.vue**: Drag-drop workflow builder
- **GanttChart.vue**: Schedule visualization
- **OptimizationMetrics.vue**: Performance metrics display
- **InstrumentPalette.vue**: Instrument selection interface

### Demo Components (`src/components/demos/`)
- **LiquidHandlerVisualizer.vue**: Liquid handling simulation
- **InstrumentControlSimulator.vue**: Instrument control interface
- **CellImagingSchedulerDemo.vue**: Microscopy scheduling
- **EllaBirdCamDemo.vue**: Special demo component

### Supporting Components
- **WorkflowThumbnail.vue**: Compact workflow preview
- **LanePreview.vue**: Simplified lane display
- **TaskListEditor.vue**: Lane task management
- **ProjectCard.vue**: Project showcase cards
- **ParticlesCanvas.vue**: Animated background

## Content Management

### Experience Data
Located in `src/views/ExperiencePage.vue`
- Professional timeline
- Resume download functionality
- Skill highlights

### Project Data
Located in `src/views/ProjectsPage.vue`
- Portfolio project listings
- Technology tags
- Project filtering

### Instrument Definitions
Located in `src/constants/instruments.ts`
- Laboratory instrument specifications
- Capacity configurations
- Icon assignments

## Deployment Configuration
- Vite build optimization
- Manual chunk splitting for vendors
- History API fallback for SPA routing
- Google Analytics integration (GA4)

## Environment Considerations
- **Storage**: No localStorage in Claude.ai artifacts environment
- **Performance**: Complex calculations optimized for large workflows
- **Browser Support**: Modern browsers only (ES6+ features)

## Next Steps
1. Complete Element Plus migration across all components
2. Standardize headers in remaining demo components
3. Implement Method Validation Dashboard
4. Clean up TypeScript issues
5. Perform comprehensive testing across all themes
6. Update documentation to reflect completed changes

## Contact
For questions about this project, contact Darren Arney through the portfolio contact form.