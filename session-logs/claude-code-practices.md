# Claude Code Practices for Vue.js Workflow Optimizer

## File Structure & Organization
- Place reusable components in `src/components/`
- Keep workflow-specific components in `src/components/workflow/`
- Use TypeScript interfaces in `src/types/`
- Put business logic in `src/utils/` and `src/composables/`

## Code Edit Format
Always use this format for changes:
For [filename], make these changes:
Line X: Change [old code] to [new code]
Line Y: Add [new code] after [context]
Line Z: Remove [code to remove]

## Vue Component Best Practices
- Use `<script setup lang="ts">` syntax
- Define props interface before `defineProps<Props>()`
- Use computed properties for derived state
- Emit events for parent communication
- Use `nextTick()` for DOM-dependent operations

## CSS/Styling Guidelines
- Use CSS custom properties (--variable-name)
- Follow BEM-like naming for complex components
- Include responsive breakpoints for mobile
- Use `scoped` styles to prevent conflicts
- Implement consistent spacing with rem units

## Demo Component Layout Standards

### Header Structure Requirements
All demo components MUST follow the unified header pattern:
- Use `<header class="optimizer-header">` with gradient background
- Structure: `header-content > header-main + header-controls`
- Title hierarchy: h1.page-title + p.page-description
- Controls: Circle buttons for help and configuration actions

### Layout Architecture
- **Container**: `min-height: 100vh` with `background: var(--bg-color)`
- **Content**: `max-width: 1400px` centered containers
- **Padding**: `2rem` for desktop, `1rem` for mobile
- **No el-card wrappers**: Use native header + content structure

### Animation Consistency
- **Standard transitions**: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- **Pulse animations**: `2s` duration for breathing effects
- **Hover effects**: Consistent transform and shadow patterns

### Element Plus Integration
- **Mandatory usage**: Always use Element Plus components instead of HTML elements
- **Button standards**: Specify `type` and `size` attributes
- **Color variables**: Map to theme variables (--el-color-primary: var(--primary-color))
- **Touch targets**: Minimum 44px for mobile interfaces

### Tab Content Guidelines
- **Navigation padding**: `padding: 0 2rem` for tab containers
- **Content spacing**: Proper margins to prevent border contact
- **Element Plus tabs**: Use native tab styling over custom implementations

### Modal & Overlay Best Practices
- Use CSS Grid for modal item layouts with responsive columns
- Apply `aspect-ratio: 1` for square modal items (instruments/tasks)
- Center content within items using `justify-content: center`
- Use `auto-fill` with `minmax()` for optimal responsive behavior
- Example: `grid-template-columns: repeat(auto-fill, minmax(100px, 1fr))`
- Maintain consistent padding and sizing across modal items
- Use smaller icons/text in constrained modal spaces (1.25rem vs 1.5rem)

## Integration Patterns
- Register Element Plus components in main.js
- Use composables for shared logic (useDragDrop, useWorkflowState)
- Handle drag-and-drop with proper cleanup
- Implement proper TypeScript types for all data

### Touch & Drag-Drop Best Practices
- **Unified System**: Create a single composable that integrates touch with existing mouse drag handlers
- **Handler Integration**: Pass existing `handleDragOver`, `handleDrop`, `handleDragEnd` functions to the touch composable
- **Mock Events**: Create mock DragEvent objects with proper `dataTransfer` to maintain compatibility
- **Element Targeting**: Use data attributes (`data-workflow-id`, `data-lane-id`) for precise drop detection
- **CSS Requirements**: Include `touch-action: none` on draggable elements
- **Visual Feedback**: Trigger existing drop indicators and drag-over states through mock events
- **Clone Management**: Use global CSS classes (`.touch-drag-clone`) for consistent styling and cleanup
- **Comprehensive Cleanup**: Remove all artifacts on component unmount, visibility change, and page unload
- **Haptic Feedback**: Implement `navigator.vibrate()` for mobile user experience
- **Dependency Injection**: Provide touch handlers to child components via Vue's `provide/inject`

### Horizontal Scrolling for Drag-Drop Containers
- **Single-Row Layout**: Use `flex-wrap: nowrap` to prevent multi-row confusion in drag-drop zones
- **Horizontal Scroll**: Enable `overflow-x: auto` with `scroll-behavior: smooth` for natural scrolling
- **Auto-Scroll**: Implement auto-scrolling when dragging near container edges (50px threshold)
- **Scroll Indicators**: Add visual cues with gradient overlays to show scrollable content
- **Custom Scrollbars**: Style webkit scrollbars for better appearance and reduced height
- **Responsive Sizing**: Adjust item sizes and gaps for mobile devices
- **Flex Constraints**: Use `flex-shrink: 0` and `min-width` to maintain item dimensions
- **Enhanced Animations**: Position drop animations based on horizontal insertion points

### Mobile Touch & Scroll Optimization
- **Touch Action Strategy**: Use `touch-action: manipulation` on draggable items and `touch-action: pan-x` on scroll containers
- **Gesture Detection**: Implement touch threshold and time delays to distinguish scroll from drag gestures
- **Scroll Momentum**: Add `-webkit-overflow-scrolling: touch` and `overscroll-behavior-x: contain` for iOS
- **Scroll Snapping**: Use `scroll-snap-type: x proximity` and `scroll-snap-align: start` for better mobile UX
- **Progressive Enhancement**: Start with native scroll behavior, only prevent default when drag is confirmed
- **Touch Feedback**: Add visual feedback (scale, color changes) for touch interactions
- **Gesture Thresholds**: Use 10px movement threshold and 150ms time delay before initiating drag
- **Directional Detection**: Prioritize horizontal scrolling over vertical drag gestures

## Error Handling
- Add try-catch blocks for async operations
- Validate data before processing
- Log errors with context for debugging
- Provide user feedback for failures

## Performance Considerations
- Use `v-show` vs `v-if` appropriately
- Implement proper cleanup in `onUnmounted`
- Debounce expensive operations
- Use `shallowRef` for large objects when possible

## Testing Integration Points
- Verify Element Plus directive registration
- Test drag-and-drop across components
- Validate workflow state persistence
- Check responsive layout behavior
EOF < /dev/null
