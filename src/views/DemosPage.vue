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
        <div class="demo-placeholder">
          <!-- This would be replaced with actual interactive demos -->
          <div class="placeholder-content">
            <h3>{{ demos[activeDemo].title }}</h3>
            <p>{{ demos[activeDemo].placeholder }}</p>
            <div class="placeholder-image"></div>
          </div>
        </div>
      </div>

      <div class="demo-explanation">
        <h2>{{ demos[activeDemo].title }}</h2>
        <p>{{ demos[activeDemo].description }}</p>

        <h3>Technical Implementation</h3>
        <p>{{ demos[activeDemo].technicalDetails }}</p>

        <div class="demo-features">
          <h3>Key Features</h3>
          <ul>
            <li v-for="(feature, index) in demos[activeDemo].features" :key="index">
              {{ feature }}
            </li>
          </ul>
        </div>

        <div class="real-world-applications">
          <h3>Real-World Applications</h3>
          <p>{{ demos[activeDemo].realWorldApplications }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DemosView',
  data() {
    return {
      activeDemo: 0,
      demos: [
        {
          title: 'Predictive Maintenance AI',
          placeholder: 'Interactive visualization of LSTM-based anomaly detection for laboratory instruments.',
          description: 'This demonstration showcases an AI system that can predict equipment failures before they occur by analyzing historical sensor data and identifying anomalous patterns.',
          technicalDetails: 'Built using TensorFlow and Python, this LSTM (Long Short-Term Memory) neural network model analyzes time-series data from laboratory instruments to detect subtle anomalies that precede equipment failures. The model is trained on historical sensor data with labeled failure events.',
          features: [
            'Real-time anomaly detection visualization',
            'Multiple sensor data stream analysis',
            'Configurable sensitivity thresholds',
            'Historical trend comparison',
            'Maintenance recommendation system'
          ],
          realWorldApplications: 'This technology is being used in production laboratories to reduce unplanned downtime by up to 35%. By predicting potential failures days or weeks in advance, maintenance can be scheduled during off-hours, preventing disruptions to critical workflows.'
        },
        {
          title: 'Laboratory Instrument Control',
          placeholder: 'Interactive simulation of laboratory instrument control interfaces and automation scripts.',
          description: 'This simulator demonstrates how I develop automation scripts for controlling laboratory instruments, showcasing real-time communication, error handling, and recovery procedures.',
          technicalDetails: 'The simulator demonstrates the object-oriented approach I use when developing laboratory automation scripts, including proper error handling, logging, and recovery procedures. In real applications, these scripts are written in Python and C# to interface with instrument SDKs.',
          features: [
            'Real-time instrument communication simulation',
            'Comprehensive error handling and recovery',
            'Dynamic code generation for different instruments',
            'Language switching between Python and C#',
            'Visualization of instrument operation states'
          ],
          realWorldApplications: 'In production environments, these control scripts are used to automate liquid handlers, HPLC systems, mass spectrometers, and other laboratory instruments. By creating robust automation software, labs can increase throughput, reduce human error, and improve reproducibility of experiments.'
        },
        {
          title: 'Workflow Optimization',
          placeholder: 'Interactive workflow modeling and optimization tool for laboratory processes.',
          description: 'This tool demonstrates how I approach laboratory workflow optimization by modeling, simulating, and visualizing complex multi-instrument processes to identify bottlenecks and improve efficiency.',
          technicalDetails: 'The workflow optimizer uses discrete event simulation techniques to model laboratory operations. It calculates resource utilization, identifies bottlenecks, and simulates the effects of different optimization strategies on overall throughput and turnaround time.',
          features: [
            'Drag-and-drop workflow design',
            'Bottleneck identification and analysis',
            'Resource utilization visualization',
            'What-if scenario modeling',
            'Output metrics calculation'
          ],
          realWorldApplications: 'Workflow optimization is critical for high-throughput laboratories to maximize efficiency. By identifying bottlenecks and optimizing instrument scheduling, labs can significantly increase throughput, reduce turnaround times, and improve resource utilization without purchasing additional equipment.'
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
}

.demo-placeholder {
  padding: 2rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
}

.placeholder-content h3 {
  margin-bottom: 1rem;
  color: var(--secondary-color);
}

.placeholder-content p {
  margin-bottom: 2rem;
  color: var(--text-light);
  max-width: 600px;
}

.placeholder-image {
  width: 100%;
  height: 250px;
  background-color: #e0e6ed;
  border-radius: 0.5rem;
  margin: 0 auto;
  max-width: 700px;
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