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

## Integration Patterns
- Register Element Plus components in main.js
- Use composables for shared logic (useDragDrop, useWorkflowState)
- Handle drag-and-drop with proper cleanup
- Implement proper TypeScript types for all data

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
EOF