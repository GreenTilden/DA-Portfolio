<template>
  <div style="position: relative; width: 100vw; height: 100vh; background: #111;">
    <ParticlesCanvas />
  </div>
</template>

<script>
import ParticlesCanvas from '@/components/ParticlesCanvas.vue'

export default {
  name: 'ParticleDebug',
  components: {
    ParticlesCanvas
  }
}
</script>
