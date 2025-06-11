# Workflow Optimizer Reusable Components Analysis
Date: January 11, 2025

## Overview
This document captures the comprehensive analysis of reusable TypeScript components and Vue components from the workflow optimizer that can be leveraged for new laboratory automation demos.

## Key TypeScript Types/Interfaces

### Core Workflow Types (`src/types/workflow.ts`)
- **`Step`**: Basic task unit with id, type, task name, duration, optional customIcon and transferName
- **`Lane`**: Container for steps with editing capabilities (name, steps array)
- **`Workflow`**: Top-level container with lanes, priority, and editing state
- **`InstrumentTask`**: Template for instrument-specific tasks
- **`ScheduledTask`**: Extended task with scheduling info (start/end time, dependencies, conflicts)
- **`Metrics`**: Performance metrics (totalTime, conflicts, utilization)
- **`DragItem`**: Extended Step interface for drag-and-drop operations
- **`IconOption`**: Custom icon definitions

## Reusable Vue Components

### Core Workflow Components (`src/components/workflow/`)

1. **`WorkflowBuilder.vue`**
   - Purpose: Main drag-and-drop workflow construction interface
   - Features: Lane management, step arrangement, inline editing

2. **`GanttChart.vue`**
   - Purpose: Visual timeline representation of scheduled tasks
   - Features: Zoom controls, workflow grouping, conflict visualization

3. **`OptimizationMetrics.vue`**
   - Purpose: Display KPI cards with performance metrics
   - Features: Total time, conflicts, utilization metrics with trend indicators

4. **`InstrumentPalette.vue`**
   - Purpose: Draggable instrument/task selection panel
   - Features: Horizontal instrument row with vertical task drawers

5. **`WorkflowThumbnail.vue`**
   - Purpose: Compact workflow preview with liquid handler connections
   - Features: Priority badge, lane preview, metrics summary

6. **`LanePreview.vue`**
   - Purpose: Simplified lane display for selection modals
   - Features: Step count, duration, selection indicator

7. **`TaskListEditor.vue`**
   - Purpose: Enhanced lane editor with mobile support
   - Features: Grid/list views, drag-drop for desktop, arrow controls for mobile

### Modal Components
8. **`ModalWorkflowFlowController.vue`** & **`ModalWorkflowFlowControllerMobile.vue`**
   - Purpose: Multi-step modal flow for workflow editing
   - Features: Workflow/lane selection, task addition

9. **`WorkflowSelectModal.vue`**, **`LaneSelectModal.vue`**, **`LaneEditorModal.vue`**
   - Purpose: Individual modal steps for workflow editing flow

10. **`ConnectionModal.vue`**
    - Purpose: Manage liquid handler transfer connections

### Supporting Components
11. **`WorkflowStep.vue`**
    - Purpose: Individual step/task representation

12. **`MultiLaneEditor.vue`**
    - Purpose: Edit multiple lanes simultaneously

13. **`MobilePositionControls.vue`**
    - Purpose: Touch-friendly controls for mobile task positioning

## Key Composables

1. **`useWorkflowState.ts`**
   - Purpose: Global state management for workflows
   - Features: Persistence, default workflow creation, custom task management

2. **`useDragDrop.ts`**
   - Purpose: Drag-and-drop utilities
   - Features: Custom drag preview, drop indicators, animations

3. **`useConnections.ts`**
   - Purpose: SVG connection drawing for liquid handler transfers
   - Features: Curved path generation, dynamic updates

4. **`useModalWorkflowEditor.ts`**
   - Purpose: Modal workflow editor state management
   - Features: Step navigation, session memory, context tracking

5. **`useTouchDragDrop.ts`** & **`useTouchDragDropEnhanced.ts`**
   - Purpose: Touch device support for drag-and-drop

## Business Logic

**`optimizationEngine.ts`**
- Purpose: Core scheduling algorithm
- Features:
  - Task dependency resolution
  - Liquid handler synchronization
  - Conflict detection
  - Resource allocation
  - Metrics calculation

## Constants

**`instruments.ts`**
- Instrument definitions and available tasks
- Default durations
- Icon mappings
- Color schemes for different themes

**`icons.ts`**
- Custom icon options for tasks

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

## Implementation Priority
1. Liquid Handler Control Demo - Demonstrates real-time instrument control
2. Method Validation Dashboard - Shows regulatory compliance expertise

Both demos leverage existing architecture while showcasing specific domain expertise in laboratory automation and system validation.