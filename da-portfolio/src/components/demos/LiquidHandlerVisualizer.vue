<template>
    <div class="demos-page">
      <div class="container">
        <header class="page-header">
          <h1>Interactive Demonstrations</h1>
          <p class="lead">
            Explore these interactive simulations to see my approach to laboratory automation 
            and instrument control using Python and C#.
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
  import InstrumentControlSimulator from '@/components/demos/InstrumentControlSimulator.vue'
  import LiquidHandlerVisualizer from '@/components/demos/LiquidHandlerVisualizer.vue'
  import WorkflowOptimizer from '@/components/demos/WorkflowOptimizer.vue'
  
  export default {
    name: 'DemosPage',
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
            title: 'Laboratory Instrument Control',
            component: InstrumentControlSimulator,
            description: 'This simulator demonstrates how I develop automation scripts for controlling laboratory instruments. It showcases real-time instrument communication, error handling, and recovery procedures used in production environments.',
            technicalDetails: 'The simulator is built using Vue.js for the frontend interface, with the underlying logic simulating actual Python and C# code patterns used for instrument control. It demonstrates the object-oriented approach I use when developing laboratory automation scripts, including proper error handling, logging, and recovery procedures.',
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
            title: 'Liquid Handler Programming',
            component: LiquidHandlerVisualizer,
            description: 'This demonstration visualizes how liquid handling robots are programmed for laboratory automation. It allows you to design a simple protocol and see how it would be executed on a liquid handling platform.',
            technicalDetails: 'This visualization uses SVG and Vue.js to create an interactive representation of liquid handler deck layouts and pipetting operations. The underlying code generation demonstrates how high-level protocol descriptions are translated into machine instructions for platforms like Tecan and Hamilton.',
            features: [
              'Interactive deck layout configuration',
              'Dynamic protocol creation and visualization',
              'Automated error checking and validation',
              'Multiple liquid handling techniques',
              'Volume optimization calculations'
            ],
            realWorldApplications: 'Liquid handlers are the workhorses of laboratory automation, used for sample preparation, dilution series, plate reformatting, and reagent dispensing. Well-designed liquid handling protocols can save hours of manual work while improving precision and reducing cross-contamination risks.'
          },
          {
            title: 'Laboratory Workflow Optimization',
            component: WorkflowOptimizer,
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
    background-color: #f0f4f8;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-top: 2rem;
  }
  
  .real-world-applications h3 {
    margin-top: 0;
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