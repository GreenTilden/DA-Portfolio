<template>
  <div class="projects-page">
    <div class="container">
      <header class="page-header">
        <h1>Projects</h1>
        <p class="lead">
          A showcase of work in automation, AI, and software development
        </p>
      </header>

      <div class="project-filters" v-if="showFilters">
        <button 
          v-for="(filter, index) in filters" 
          :key="index"
          :class="['filter-button', { active: activeFilter === filter.value }]"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="projects-grid">
        <div 
          v-for="(project, index) in filteredProjects" 
          :key="index" 
          class="project-item"
        >
          <ProjectCard 
            :title="project.title"
            :description="project.description"
            :image="project.image"
            :technologies="project.technologies"
            :github="project.github"
            :demo="project.demo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectCard from '@/components/ProjectCard.vue'

export default {
  name: 'ProjectsView',
  components: {
    ProjectCard
  },
  data() {
    return {
      activeFilter: 'all',
      showFilters: true,
      filters: [
        { label: 'All Projects', value: 'all' },
        { label: 'AI/ML', value: 'ai' },
        { label: 'Automation', value: 'automation' },
        { label: 'Software', value: 'software' }
      ],
      projects: [
        {
          title: 'Predictive Maintenance AI',
          description: 'LSTM-based time-series anomaly detection system for laboratory instruments. Identifies potential failures before they occur to prevent downtime.',
          image: null,
          technologies: ['Python', 'TensorFlow', 'Time Series Analysis'],
          github: 'https://github.com/GreenTilden/predictive-maintenance',
          demo: '/demos/predictive',
          categories: ['ai', 'automation']
        },
        {
          title: 'MLOps Pipeline',
          description: 'End-to-end MLOps pipeline for model training, testing, and deployment with CI/CD workflows and monitoring capabilities.',
          image: null,
          technologies: ['Python', 'Azure ML', 'Docker', 'Kubernetes'],
          github: 'https://github.com/GreenTilden/mlops-pipeline',
          demo: null,
          categories: ['ai', 'software']
        },
        {
          title: 'Automated HPLC Sample Preparation',
          description: 'Complete workflow for automated HPLC sample preparation using liquid handlers. Increased throughput by 300% while reducing human error.',
          image: null,
          technologies: ['Python', 'Tecan EVOware', 'Hamilton STAR'],
          github: null,
          demo: '/demos/liquid-handler',
          categories: ['automation']
        },
        {
          title: 'Laboratory Workflow Optimization',
          description: 'Analyzed and optimized laboratory workflows, resulting in a 40% reduction in turnaround time for high-priority samples.',
          image: null,
          technologies: ['Process Mapping', 'Discrete Event Simulation', 'Python'],
          github: null,
          demo: '/demos/workflow',
          categories: ['automation', 'software']
        }
      ]
    }
  },
  computed: {
    filteredProjects() {
      if (this.activeFilter === 'all') {
        return this.projects;
      }
      return this.projects.filter(project => 
        project.categories.includes(this.activeFilter)
      );
    }
  },
  mounted() {
    // Check if a category filter was specified in the URL
    const categoryParam = this.$route.query.category;
    if (categoryParam && this.filters.some(f => f.value === categoryParam)) {
      this.activeFilter = categoryParam;
    }
    
    // Check if ?view=ai-lead is set to modify content
    if (this.$route.query.view === 'ai-lead') {
      // Prioritize AI projects
      this.projects.sort((a, b) => {
        if (a.categories.includes('ai') && !b.categories.includes('ai')) return -1;
        if (!a.categories.includes('ai') && b.categories.includes('ai')) return 1;
        return 0;
      });
    }
  }
}
</script>

<style scoped>
.projects-page {
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

.project-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-button {
  background-color: var(--bg-light);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background-color: #f0f4f8;
  border-color: #cfd9e6;
}

.filter-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.projects-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
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

@media (min-width: 768px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .projects-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>