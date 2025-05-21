<template>
  <div class="home">
    <div class="container">
      <!-- Hero Section -->
      <transition name="fade" appear>
        <section class="hero-section">
          <ParticlesCanvas />
          <div class="hero-content">
            <h1 class="hero-title">Automation Excellence</h1>
            <h2 class="hero-role">{{ currentRole }}</h2>
            <p class="intro-paragraph">Specializing in the design and implementation of laboratory automation systems that optimize workflows, increase efficiency, and enhance data quality.</p>
            <p class="tagline">{{ currentTagline }}</p>
            <el-space wrap alignment="center" class="cta-buttons">
              <router-link to="/projects">
                <el-button type="primary" size="large">View Projects</el-button>
              </router-link>
              <router-link to="/contact">
                <el-button plain size="large">Contact Me</el-button>
              </router-link>
            </el-space>
          </div>
        </section>
      </transition>

      <div class="section-divider"></div>

      <!-- Areas of Expertise Section -->
      <section v-if="sections.specialties" class="specialties-section">
        <h2 class="section-heading expertise-heading">Areas of Expertise</h2>
        <el-row :gutter="20">
          <el-col
            v-for="(specialty, index) in specialties"
            :key="'specialty-'+index"
            :xs="24"
            :sm="12"
            :md="12"
            :lg="6"
          >
            <el-card
              shadow="hover"
              class="specialty-card fade-in-up"
              v-observe-visibility="(isVisible) => onVisibilityChange(isVisible, index)"
              :class="{ visible: visibleCards[index] }"
            >
              <div class="icon-container">
                <i :class="specialty.icon"></i>
              </div>
              <h3>{{ specialty.title }}</h3>
              <p>{{ specialty.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </section>
    </div>
  </div>
</template>

<script>
import { ObserveVisibility } from 'vue3-observe-visibility';
import ParticlesCanvas from '@/components/ParticlesCanvas.vue';

export default {
  name: 'HomeView',
  directives: {
    'observe-visibility': ObserveVisibility
  },
  components: {
    ParticlesCanvas
  },  
  data() {
    return {
      viewType: this.$route.query.view || 'general',
      visibleCards: [],
      animationFrameId: null,
      roleConfigs: {
        general: {
          role: 'Laboratory Automation Specialist',
          tagline: 'Designing and implementing advanced automated systems for high-throughput workflows',
          sections: { specialties: true },
          specialties: [
            {
              title: 'Automation System Design',
              description: 'Designing and implementing customized automation solutions tailored to specific laboratory requirements.',
              icon: 'fas fa-robot'
            },
            {
              title: 'Workflow Optimization',
              description: 'Analyzing existing workflows to identify bottlenecks and implementing automation strategies.',
              icon: 'fas fa-chart-line'
            },
            {
              title: 'Technical Leadership',
              description: 'Leading teams in designing and delivering automation solutions with strategic guidance.',
              icon: 'fas fa-users-cog'
            },
            {
              title: 'Cross-functional Collaboration',
              description: 'Mentoring, onboarding, and supporting teams across marketing, sales, and engineering.',
              icon: 'fas fa-handshake'
            }
          ]
        },
        'ai-lead': {
          role: 'AI Strategy & Laboratory Automation Leadership',
          tagline: 'Bridging advanced automation expertise with emerging AI technologies',
          sections: { specialties: true },
          specialties: [
            {
              title: 'AI Strategy Development',
              description: 'Creating roadmaps for AI integration into laboratory systems with implementation pathways.',
              icon: 'fas fa-brain'
            },
            {
              title: 'Predictive Maintenance Systems',
              description: 'Using analytics to anticipate equipment failures and optimize maintenance schedules.',
              icon: 'fas fa-chart-bar'
            },
            {
              title: 'Workflow Intelligence',
              description: 'Applying ML to optimize workflows and intelligently schedule operations.',
              icon: 'fas fa-network-wired'
            },
            {
              title: 'Team Leadership & Transformation',
              description: 'Driving digital transformation through AI technology adoption and team collaboration.',
              icon: 'fas fa-users'
            }
          ]
        }
      }
    };
  },
  computed: {
    currentConfig() {
      return this.roleConfigs[this.viewType] || this.roleConfigs.general;
    },
    currentRole() {
      return this.currentConfig.role;
    },
    currentTagline() {
      return this.currentConfig.tagline;
    },
    sections() {
      return this.currentConfig.sections;
    },
    specialties() {
      return this.currentConfig.specialties;
    }
  },
  methods: {
    onVisibilityChange(isVisible, index) {
      if (isVisible) this.visibleCards[index] = true;
    },
    initParticleCanvas() {
      const canvas = this.$refs.particleCanvas;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const resize = () => {
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
      };
      resize();
      window.addEventListener('resize', resize);

      const colors = ['#FFD700', '#4A90E2']; // yellow, blue
      const particles = Array.from({ length: 10 }).map((_, i) => {
        const isYellow = i < 4;
        return {
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          radius: 3 + Math.random() * 2,
          color: isYellow ? colors[0] : colors[1]
        };
      });

      const draw = () => {
        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        // Draw connections
        particles.forEach((p1, i) => {
          const nearest = particles
            .filter((_, j) => j !== i)
            .sort((a, b) => {
              const d1 = Math.hypot(p1.x - a.x, p1.y - a.y);
              const d2 = Math.hypot(p1.x - b.x, p1.y - b.y);
              return d1 - d2;
            })
            .slice(0, 2);

          nearest.forEach(p2 => {
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, p1.color);
            grad.addColorStop(1, p2.color);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          });
        });

        // Draw particles
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });

        // Update positions
        particles.forEach(p => {
          p.x += p.dx;
          p.y += p.dy;
          if (p.x < 0 || p.x > canvas.offsetWidth) p.dx *= -1;
          if (p.y < 0 || p.y > canvas.offsetHeight) p.dy *= -1;
        });

        this.animationFrameId = requestAnimationFrame(draw);
      };

      draw();
    }
  },
  watch: {
    '$route.query.view'(newView) {
      this.viewType = newView || 'general';
    }
  },
  mounted() {
    this.viewType = this.$route.query.view || 'general';
    if (this.specialties && Array.isArray(this.specialties)) {
      this.visibleCards = new Array(this.specialties.length).fill(false);
    }
    this.$nextTick(() => {
      this.initParticleCanvas();
    });
  },
  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
};
</script>


<style>
body {
  background-color: var(--bg-color);
}

/* Hero Section with Scientific Data Visualization Theme */
.hero-section {
  position: relative;
  overflow: hidden;
  background-color: rgba(42, 54, 72, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 5rem 2rem 4rem;
  text-align: center;
  z-index: 1;
  margin-bottom: 2rem;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Scientific grid pattern - more subtle */
.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(74, 144, 226, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 144, 226, 0.07) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
  opacity: 0.8;
  z-index: -2;
  animation: grid-scroll-x 40s infinite linear;
}

/* Subtle noise texture */
.hero-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.02;
  z-index: -1;
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.particle {
  position: absolute;
  background-color: var(--primary-color);
  border-radius: 50%;
  opacity: 0.8;
  box-shadow: 0 0 12px 4px rgba(74, 144, 226, 0.7);
  transform: translate(-50%, -50%);
  z-index: 2;
  filter: blur(0.5px);
}

/* Particle tail */
.particle-connection {
  pointer-events: none;
  position: absolute;
  opacity: 0.5;
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.3);
}
.particles-css {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Primary scientific wave gradient - smooth horizontal movement */
.particles-css::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    var(--section-bg-transparent) 0%,
    var(--section-bg-transparent) 15%,
    var(--primary-10) 25%,
    var(--primary-20) 35%,
    var(--primary-10) 45%,
    var(--section-bg-transparent) 55%,
    var(--section-bg-transparent) 65%,
    var(--primary-10) 75%,
    var(--primary-20) 85%,
    var(--primary-10) 95%,
    var(--section-bg-transparent) 100%
  );
  background-size: 200% 100%;
  animation: wave-scroll 20s infinite linear;
  z-index: -1;
}

/* Secondary wave gradient - subtle complementary movement */
.particles-css::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(110, 136, 166, 0.05) 30%,
    rgba(110, 136, 166, 0.1) 45%,
    rgba(110, 136, 166, 0.05) 60%,
    transparent 90%
  );
  opacity: 0.6;
  background-size: 300% 100%;
  animation: gradient-scroll-reverse 25s infinite linear;
  z-index: -1;
}


/* Position data nodes at key points */
.particle:nth-child(1) { 
  top: calc(20% + (10% * var(--random-1, 0.5))); 
  left: calc(15% + (10% * var(--random-2, 0.3))); 
  width: 3px; height: 3px; 
  animation: data-pulse 6s infinite, wave-motion1 15s infinite ease-in-out; 
}

.particle:nth-child(2) { 
  top: calc(30% + (15% * var(--random-3, 0.7))); 
  left: calc(65% + (12% * var(--random-4, 0.2))); 
  width: 4px; height: 4px; 
  animation: data-pulse 7s infinite 1s, wave-motion2 18s infinite ease-in-out; 
}

.particle:nth-child(3) { 
  top: calc(55% + (10% * var(--random-5, 0.4))); 
  left: calc(25% + (15% * var(--random-6, 0.6))); 
  width: 3px; height: 3px; 
  animation: data-pulse 8s infinite 2s, wave-motion3 20s infinite ease-in-out; 
}

.particle:nth-child(4) { 
  top: calc(70% + (12% * var(--random-7, 0.3))); 
  left: calc(75% + (8% * var(--random-8, 0.5))); 
  width: 4px; height: 4px; 
  animation: data-pulse 6.5s infinite 1.5s, wave-motion1 17s infinite ease-in-out reverse; 
}

.particle:nth-child(5) { 
  top: calc(15% + (8% * var(--random-9, 0.8))); 
  left: calc(50% + (15% * var(--random-10, 0.4))); 
  width: 3px; height: 3px; 
  animation: data-pulse 7.5s infinite 3s, wave-motion2 16s infinite ease-in-out reverse; 
}

.particle:nth-child(6) { 
  top: calc(80% + (10% * var(--random-11, 0.2))); 
  left: calc(35% + (10% * var(--random-12, 0.7))); 
  width: 4px; height: 4px; 
  animation: data-pulse 7s infinite 2.5s, wave-motion3 19s infinite ease-in-out reverse; 
}

/* Hide any remaining particles */
.particle:nth-child(n+13) { 
  display: none; 
}
/* Create a data point with trailing indicator */
.particle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  height: 1px;
  width: 12px;
  background: linear-gradient(to right, var(--primary-color), transparent);
  transform: translateY(-50%);
  opacity: 0.7;
}

.connections-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle-connection {
  position: absolute;
  height: 1px !important;
  background-color: rgba(74, 144, 226, 0.4);
  box-shadow: 0 0 4px rgba(74, 144, 226, 0.3);
  pointer-events: none;
}


/* Animation definitions */
@keyframes grid-scroll-x {
  0% { background-position: 0 0; }
  100% { background-position: 80px 0; }
}

@keyframes wave-scroll {
  0% { background-position: 0% 0; }
  100% { background-position: -200% 0; }
}

@keyframes gradient-scroll-reverse {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}

@keyframes pulse-fade {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(2); opacity: 0.1; }
}

/* Pulse animation for data points */
@keyframes data-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
  10% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.2; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.7; }
  90% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.2; }
}

/* Wave motion animation with custom variables */
@keyframes particle-wave {
  0%, 100% { transform: translate(calc(-50% + 0px), calc(-50% + 0px)); }
  50% { transform: translate(calc(-50% + var(--move-x)), calc(-50% + var(--move-y))); }
}

@keyframes connection-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}
/* Added intro paragraph */
.intro-paragraph {
  font-size: 1.1rem;
  color: var(--text-light);
  max-width: 800px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

/* Added section divider */
.section-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-color), transparent);
  margin: 4rem auto;
  width: 80%;
}

/* Title with gradient and animated underline */
.hero-title {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
  font-family: 'Poppins', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--text-light);
  z-index: 1;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text-light) 0%, var(--primary-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
}

.hero-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -10px;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--primary-color) 50%,
    transparent 100%
  );
  animation: slide-underline 3s infinite;
}

@keyframes tail-grow {
  0% { width: 0; opacity: 0; }
  20% { opacity: 0.4; }
  100% { width: 30px; opacity: 0.8; }
}

@keyframes slide-underline {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* Hero content styles */
.hero-role {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
}

.tagline {
  font-size: 1.125rem;
  color: var(--text-faded);
  max-width: 700px;
  margin: 0 auto 2rem auto;
  text-align: center;
  line-height: 1.6;
  font-weight: 300;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

.cta-buttons {
  margin-top: 1.5rem;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* Specialties Section with added spacing */
.specialties-section {
  margin-top: 5rem;
  background-color: var(--section-bg);
  padding: 3.5rem 2rem;
  border-radius: 1rem;
  margin-bottom: 3rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

/* Enhanced expertise heading */
.expertise-heading {
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.section-heading {
  font-family: 'Poppins', sans-serif;
  font-size: 2.25rem;
  margin-bottom: 2.5rem;
  color: var(--text-light);
  font-weight: 600;
  position: relative;
  display: inline-block;
}

.section-heading::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

/* Icon container for specialty cards */
.icon-container {
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  color: var(--primary-color);
}

.specialty-card {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  transition: transform 0.4s ease, opacity 0.4s ease, box-shadow 0.4s ease;
  transform: translateY(20px);
  opacity: 0;
  padding: 2rem 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
}

.specialty-card.visible {
  transform: translateY(0);
  opacity: 1;
}

/* Enhanced hover effect */
.specialty-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(74, 144, 226, 0.4);
}

.specialty-card h3 {
  font-family: 'Poppins', sans-serif;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 1.25rem;
}

.specialty-card p {
  color: var(--text-faded);
  font-size: 0.95rem;
  line-height: 1.7;
  flex-grow: 1;
}

/* Animations */
.fade-enter-active,
.fade-appear-active {
  transition: opacity 0.5s ease-in, transform 0.5s ease-out;
  transform: translateY(0);
}

.fade-enter-from,
.fade-appear-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-to,
.fade-appear-to {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive improvements */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.25rem;
  }
  
  .hero-role {
    font-size: 1.25rem;
  }

  .intro-paragraph {
    font-size: 1rem;
    padding: 0 0.5rem;
  }

  .tagline {
    font-size: 1rem;
  }

 
  .hero-section {
    padding: 3rem 1rem 2.5rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .cta-buttons .el-button {
    width: 100%;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
  .specialty-card {
    margin-bottom: 1.5rem;
  }
  
  .section-divider {
    margin: 3rem auto;
  }
  
  .icon-container {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .specialty-card {
    margin-bottom: 1.5rem;
    min-height: 0;
    padding: 1.5rem;
  }

  .icon-container {
    margin-bottom: 1rem;
  }

  .specialty-card h3 {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }

</style>