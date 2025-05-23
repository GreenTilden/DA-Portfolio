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
            <p class="intro-paragraph">Leveraging 10+ years of experience in laboratory automation to design, implement, and optimize 
  high-throughput workflows that increase efficiency by up to 300% while ensuring data integrity 
  and regulatory compliance.</p>
            <p class="tagline">{{ currentTagline }}</p>
            <el-space wrap alignment="center" class="cta-buttons">
              <router-link to="/projects">
                <button class="theme-button primary-button">View Projects</button>
              </router-link>
              <router-link to="/contact">
                <button class="theme-button secondary-button">Contact Me</button>
              </router-link>
            </el-space>
          </div>
        </section>
      </transition>

      <div class="section-divider"></div>

      <!-- Areas of Expertise Section -->
      <section v-if="sections.specialties" class="specialties-section">
        <h2 class="section-heading expertise-heading">Areas of Expertise</h2>
        <div class="expertise-grid">
          <div
            v-for="(specialty, index) in specialties"
            :key="'specialty-'+index"
            class="expertise-card"
            v-observe-visibility="(isVisible) => onVisibilityChange(isVisible, index)"
            :class="{ visible: visibleCards[index] }"
          >
            <div class="card-icon expertise-icon">
              <i :class="specialty.icon"></i>
            </div>
            <div class="card-content">
              <h3>{{ specialty.title }}</h3>
              <p>{{ specialty.description }}</p>
            </div>
          </div>
        </div>
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
      themeRgbColors: {
        'purdue': {
          primary: '207, 181, 59',
          secondary: '139, 115, 85'
        },
        'pacers': {
          primary: '253, 187, 48',
          secondary: '74, 144, 226'
        },
        'forest': {
          primary: '78, 204, 163',
          secondary: '227, 178, 60'
        },
        'ocean': {
          primary: '74, 144, 226',
          secondary: '110, 136, 166'
        },
        'monochrome': {
          primary: '208, 208, 208',
          secondary: '160, 160, 160'
        }
      },
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
    hexToRgb(hex) {
      // Remove # if present
      hex = hex.replace('#', '');
      
      // Handle shorthand hex (#fff)
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return `${r}, ${g}, ${b}`;
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
        // Draw connections between particles to create a network effect
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

        // Draw the individual particles
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });

        // Update particle positions for continuous animation
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
    
    // Get current theme from data attribute
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'pacers';
    
    // Add RGB versions of theme colors for better opacity control
    if (this.themeRgbColors[currentTheme]) {
      document.documentElement.style.setProperty('--primary-color-rgb', this.themeRgbColors[currentTheme].primary);
      document.documentElement.style.setProperty('--secondary-color-rgb', this.themeRgbColors[currentTheme].secondary);
    } else {
      // Fallback to calculating RGB values
      document.documentElement.style.setProperty('--primary-color-rgb', this.hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()));
      document.documentElement.style.setProperty('--secondary-color-rgb', this.hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim()));
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
/* Page background - ensures consistent dark theme */
body {
  background-color: var(--bg-color);
}

/* Hero Section - creates the main banner area with particle background */
.hero-section {
  position: relative;
  overflow: hidden;
  background-color: var(--card-bg);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 5rem 2rem 4rem;
  text-align: center;
  z-index: 1;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Hero background effects - creates subtle grid pattern and texture */
.hero-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: linear-gradient(rgba(74, 144, 226, 0.07) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(74, 144, 226, 0.07) 1px, transparent 1px);
  background-size: 40px 40px;
  background-position: center center;
  opacity: 0.8;
  z-index: -2;
  animation: grid-scroll-x 40s infinite linear;
}

.hero-section::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.02;
  z-index: -1;
}

/* Hero content - styles the main heading and introductory text */
.intro-paragraph {
  font-size: 1.1rem;
  color: var(--text-light);
  max-width: 800px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
}

.section-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-color), transparent);
  margin: 4rem auto;
  width: 80%;
}

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
  background: linear-gradient(90deg, transparent 0%, var(--primary-color) 50%, transparent 100%);
  animation: slide-underline 3s infinite;
}

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

/* Standardized Theme-Aware Buttons */
.theme-button {
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.theme-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Primary button styling */
.primary-button {
  background-color: var(--primary-color);
  color: #fff;
}

.primary-button:hover {
  background-color: var(--primary-dark);
}

/* Secondary button styling */
.secondary-button {
  background-color: transparent;
  color: var(--text-light);
  border: 2px solid var(--primary-color);
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: var(--primary-dark);
}

/* Special handling for monochrome theme */
[data-theme="monochrome"] .primary-button {
  color: #000;
}

[data-theme="monochrome"] .secondary-button {
  border-color: var(--primary-color);
}

/* Specialties Section - contains the expertise cards in a clean layout */
.specialties-section {
  margin-top: 5rem;
  background-color: var(--section-bg);
  padding: 3rem 2rem;
  border-radius: 1rem;
  margin-bottom: 3rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

/* Specific theme overrides for cards */
[data-theme="purdue"] .expertise-card {
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(207, 181, 59, 0.7) 100%);
  border: 1px solid rgba(207, 181, 59, 0.4);
}

[data-theme="purdue"] .card-content h3 {
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

[data-theme="purdue"] .card-content p {
  color: rgba(255, 255, 255, 0.9);
}

[data-theme="purdue"] .card-icon {
  background: rgba(207, 181, 59, 0.2);
  border: 1px solid rgba(207, 181, 59, 0.6);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="purdue"] .expertise-icon i {
  color: var(--primary-color);
}

/* Purdue theme button overrides */
[data-theme="purdue"] .primary-button {
  background-color: var(--primary-color);
  color: #1a1612;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(207, 181, 59, 0.3);
}

[data-theme="purdue"] .secondary-button {
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  font-weight: 600;
}

[data-theme="purdue"] .primary-button:hover {
  background-color: #e0c649;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(207, 181, 59, 0.4);
}

[data-theme="purdue"] .secondary-button:hover {
  background-color: rgba(207, 181, 59, 0.15);
  border-color: #e0c649;
}

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

/* Expertise Grid - responsive grid system with consistent heights */
.expertise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  grid-auto-rows: 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

/* Expertise Cards - enhanced design with consistent heights */
.expertise-card {
  background: linear-gradient(135deg, var(--card-bg) 0%, var(--primary-color) 100%);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(20px);
  opacity: 0;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  min-height: 180px;
}

/* Special handling for monochrome theme cards */
[data-theme="monochrome"] .expertise-card {
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(70, 70, 70, 0.9) 100%);
  border: 1px solid var(--border-color);
}

.expertise-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.expertise-card.visible {
  transform: translateY(0);
  opacity: 1;
}

.expertise-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.12);
  border-color: rgba(74, 144, 226, 0.6);
}

.expertise-card:hover::before {
  opacity: 1;
}

/* Card Icon - enhanced with gradient background and better positioning */
.card-icon {
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: var(--secondary-color);
  background: linear-gradient(135deg, rgba(var(--secondary-color-rgb, 110, 136, 166), 0.2) 0%, rgba(var(--primary-color-rgb, 74, 144, 226), 0.1) 100%);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
}

/* Icon colors for themes */
[data-theme="ocean"] .expertise-icon i {
  color: var(--icon-color, #5fa4ff);
}

[data-theme="monochrome"] .expertise-card {
  border: 1px solid var(--border-color);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

[data-theme="monochrome"] .card-content h3 {
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

[data-theme="monochrome"] .card-content p {
  color: #e0e0e0;
}

[data-theme="monochrome"] .card-icon {
  background: linear-gradient(135deg, #505050 0%, #303030 100%);
  border: 1px solid #606060;
}

[data-theme="monochrome"] .expertise-icon i {
  color: #ffffff;
}

/* Card Content - enhanced typography and spacing */
.card-content {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-content h3 {
  font-family: 'Poppins', sans-serif;
  color: var(--text-light);
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.card-content p {
  color: var(--text-faded);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 400;
}

/* Animation Classes - handles the fade-in effects for page transitions */
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

/* Responsive Design - adapts layout for different screen sizes */

/* Large screens - 2 cards per row with enhanced spacing and sizing */
@media (min-width: 1200px) {
  .expertise-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
    grid-auto-rows: minmax(200px, 1fr);
  }
  
  .expertise-card {
    padding: 3rem;
    min-height: 200px;
  }
  
  .card-icon {
    width: 80px;
    height: 80px;
    font-size: 3rem;
  }
  
  .card-content h3 {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }
  
  .card-content p {
    font-size: 1.1rem;
  }
}

/* Medium screens - 2 cards per row with optimized sizing */
@media (min-width: 768px) and (max-width: 1199px) {
  .expertise-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
    grid-auto-rows: minmax(180px, 1fr);
  }
  
  .expertise-card {
    padding: 2.25rem;
    min-height: 180px;
  }
  
  .card-icon {
    width: 65px;
    height: 65px;
    font-size: 2.25rem;
  }
  
  .card-content h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  
  .card-content p {
    font-size: 0.95rem;
  }
}

/* Mobile screens - single column with vertical card layout */
@media (max-width: 767px) {
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

  .theme-button {
    width: 100%;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    min-width: 130px;
  }

  .specialties-section {
    padding: 2rem 1rem;
  }

  .section-divider {
    margin: 3rem auto;
  }

  .expertise-heading {
    font-size: 2rem;
  }

  .expertise-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    grid-auto-rows: auto;
  }

  .expertise-card {
    flex-direction: column;
    text-align: center;
    padding: 2.5rem 2rem;
    min-height: auto;
    gap: 1.5rem;
  }

  .card-icon {
    width: 80px;
    height: 80px;
    font-size: 3rem;
    margin: 0 auto;
  }

  .card-content {
    text-align: center;
  }

  .card-content h3 {
    font-size: 1.375rem;
    margin-bottom: 1.25rem;
  }

  .card-content p {
    font-size: 1rem;
    line-height: 1.6;
  }
}

/* Keyframe Animations - creates the moving background effects */
@keyframes grid-scroll-x {
  0% { background-position: 0 0; }
  100% { background-position: 80px 0; }
}

@keyframes slide-underline {
  0% { opacity: 0; transform: translateX(-100%); }
  50% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(100%); }
}
</style>