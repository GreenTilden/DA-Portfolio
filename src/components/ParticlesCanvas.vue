<template>
  <canvas ref="canvas" class="particles-canvas"></canvas>
</template>

<script>
export default {
  name: 'ParticlesCanvas',
  data() {
    return {
      ctx: null,
      canvas: null,
      particles: [],
      animationId: null,
      mouseX: -9999,
      mouseY: -9999,
      colors: ['#FFD700', '#4A90E2', '#10B981', '#9F7AEA'] // Yellow, Blue, Green, Purple
    };
  },
  mounted() {
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    const isMobile = window.innerWidth < 768;
    this.initParticles();
    this.animate();
    window.addEventListener('resize', this.setupCanvas);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.setupCanvas);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    cancelAnimationFrame(this.animationId);
  },
  methods: {
    handleResize() {
      this.setupCanvas();
  // Reinitialize particles with appropriate count when resizing
      const isMobile = window.innerWidth < 768;
      this.initParticles(isMobile);
    },
    setupCanvas() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    },
    initParticles(isMobile = false) {
      this.particles = [];
      const counts = isMobile ? [2, 3, 4, 2] : [4, 6, 8, 5];// yellow, blue, green, purple
      let index = 0;
      counts.forEach((count, colorIndex) => {
        for (let i = 0; i < count; i++, index++) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5,
            radius: 3 + Math.random() * 2,
            color: this.colors[colorIndex]
          });
        }
      });
    },
    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    },
  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.touches[0].clientX - rect.left;
      this.mouseY = e.touches[0].clientY - rect.top;
    }
  },
    animate() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.drawConnections();

      this.particles.forEach(p => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.restore();

        p.x += p.dx;
        p.y += p.dy;

        const dx = this.mouseX - p.x;
        const dy = this.mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x += dx * 0.003;
          p.y += dy * 0.003;
        }

        if (p.x <= 0 || p.x >= this.canvas.width) p.dx *= -1;
        if (p.y <= 0 || p.y >= this.canvas.height) p.dy *= -1;
      });

      this.animationId = requestAnimationFrame(this.animate);
    },
    drawConnections() {
      const ctx = this.ctx;
      const now = Date.now();
      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        const neighbors = this.particles
          .map((p2, j) => ({ p2, dist: i !== j ? this.distance(p1, p2) : Infinity }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 2);

        neighbors.forEach(({ p2 }) => {
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, p1.color);
          grad.addColorStop(1, p2.color);

          ctx.strokeStyle = grad;
          ctx.globalAlpha = 0.8;
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });
        ctx.globalAlpha = 1.0;
      }
    },
    distance(p1, p2) {
      return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }
  }
};
</script>

<style scoped>
.particles-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
