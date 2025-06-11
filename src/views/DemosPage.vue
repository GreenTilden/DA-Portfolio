<template>
  <div class="demos-page">
    <div class="container">
      <header class="page-header">
        <h1>Interactive Demos</h1>
        <p class="lead">
          Explore these interactive demonstrations of my work in laboratory automation, 
          instrument control, and AI applications.
        </p>
      </header>

      <div class="demo-selection">
        <button 
          v-for="(demo, index) in demos" 
          :key="index"
          :class="['demo-button', { active: activeDemo === index }]"
          @click="activeDemo = index"
        >
          {{ demo.title }}
        </button>
      </div>

      <div class="demo-container">
        <component :is="demos[activeDemo].component"></component>
      </div>
    </div>
  </div>
</template>

<script>
import InstrumentControlSimulator from '@/components/demos/InstrumentControlSimulator.vue'
import LiquidHandlerVisualizer from '@/components/demos/LiquidHandlerVisualizer.vue'
import WorkflowOptimizer from '@/components/demos/WorkflowOptimizer.vue'

export default {
  name: 'DemosView',
  components: {
    InstrumentControlSimulator,
    LiquidHandlerVisualizer,
    WorkflowOptimizer
  },
  data() {
    return {
      activeDemo: 0,
      demos: [
        {
          title: 'Liquid Handler Control',
          component: LiquidHandlerVisualizer,
          description: 'Interactive liquid handling simulation demonstrating real-time control and visualization of laboratory automation workflows.',
          technicalDetails: 'Built with Vue 3 and real-time animation, this simulator showcases drag-and-drop protocol building, animated liquid transfers, and comprehensive metrics tracking.',
          features: [
            'Real-time liquid transfer animation',
            'Drag-and-drop labware placement',
            'Protocol timeline visualization',
            'Volume tracking and metrics',
            'Preset protocol library'
          ],
          realWorldApplications: 'This interface pattern is used in production liquid handlers to visualize complex pipetting protocols, reducing setup errors and improving protocol development efficiency.'
        },
        {
          title: 'Laboratory Instrument Control',
          component: InstrumentControlSimulator,
          description: 'Multi-instrument control dashboard showcasing real-time monitoring and control of various laboratory instruments.',
          technicalDetails: 'The simulator demonstrates comprehensive instrument control patterns including real-time data visualization, method management, and event logging.',
          features: [
            'Multi-instrument monitoring dashboard',
            'Real-time parameter control',
            'Method and protocol management',
            'Event logging and notifications',
            'Simulated data collection'
          ],
          realWorldApplications: 'These control interfaces are used in production laboratories to manage multiple instruments simultaneously, improving workflow efficiency and data quality.'
        },
        {
          title: 'Workflow Optimization',
          component: WorkflowOptimizer,
          description: 'Advanced workflow scheduling and optimization engine for laboratory automation.',
          technicalDetails: 'Features drag-and-drop workflow building, conflict detection, and intelligent scheduling algorithms.',
          features: [
            'Visual workflow builder',
            'Real-time optimization engine',
            'Conflict detection and resolution',
            'Performance metrics analysis',
            'Multi-lane scheduling'
          ],
          realWorldApplications: 'Optimization engines like this help laboratories reduce total run time by 30-40% through intelligent resource allocation and parallel processing.'
        }
      ]
    }
  },
  mounted() {
    // Check if a specific demo was requested in the URL
    const demoParam = this.$route.query.demo;
    if (demoParam) {
      const demoIndex = this.demos.findIndex(demo => 
        demo.title.toLowerCase().replace(/\s+/g, '-') === demoParam
      );
      if (demoIndex !== -1) {
        this.activeDemo = demoIndex;
      }
    }
    
    // Check if view parameter is set (for content customization)
    if (this.$route.query.view === 'ai-lead') {
      // Ensure AI demo is first in the list
      const aiDemoIndex = this.demos.findIndex(demo => 
        demo.title === 'Predictive Maintenance AI'
      );
      if (aiDemoIndex !== 0) {
        const aiDemo = this.demos.splice(aiDemoIndex, 1)[0];
        this.demos.unshift(aiDemo);
        this.activeDemo = 0;
      }
    }
  }
}
</script>

<style scoped>
.demos-page {
  padding: 2rem 0 4rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.lead {
  font-size: 1.2rem;
  color: var(--text-light);
  max-width: 800px;
  margin: 0 auto;
}

.demo-selection {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.demo-button {
  background-color: var(--bg-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-button:hover {
  background-color: #f0f4f8;
  border-color: #cfd9e6;
}

.demo-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.demo-container {
  margin-bottom: 3rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: var(--bg-light);
  min-height: 650px;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.demo-explanation {
  max-width: 800px;
  margin: 0 auto;
}

.demo-explanation h2 {
  font-size: 1.75rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.demo-explanation h3 {
  font-size: 1.25rem;
  color: var(--secondary-color);
  margin: 1.5rem 0 0.75rem;
}

.demo-explanation p {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.demo-features ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.demo-features li {
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.real-world-applications {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-top: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.real-world-applications h3 {
  margin-top: 0;
}

.real-world-applications p {
  color: var(--text-light);
}
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .lead {
    font-size: 1.1rem;
  }
  
  .demo-button {
    width: 100%;
    text-align: center;
  }
}
</style>