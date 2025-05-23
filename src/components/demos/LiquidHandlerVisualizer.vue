<template>
  <div class="liquid-handler-visualizer">
    <h3>Liquid Handler Visualizer</h3>
    <p>This simulation demonstrates liquid handler programming.</p>
    <div class="coming-soon">
      Interactive simulation coming soon!
    </div>
  </div>
</template>

<script>
export default {
  name: 'LiquidHandlerVisualizer'
}
</script>

<style scoped>
.liquid-handler-visualizer {
  padding: 2rem;
  text-align: center;
}

.coming-soon {
  margin-top: 2rem;
  padding: 3rem;
  background-color: var(--card-bg);
  color: var(--text-light);
  border-radius: 0.5rem;
  font-weight: 500;
}
</style>