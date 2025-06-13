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
        <el-button
          v-for="filter in filters" 
          :key="filter.value"
          :type="activeFilter === filter.value ? 'primary' : 'default'"
          :size="isMobile ? 'large' : 'default'"
          @click="setActiveFilter(filter.value)"
          class="filter-btn"
        >
          {{ filter.label }}
        </el-button>
      </div>

      <div class="projects-grid" v-loading="isLoading">
        <div 
          v-for="project in filteredProjects" 
          :key="project.title" 
          class="project-item"
        >
          <ProjectCard 
            :title="project.title"
            :subtitle="project.subtitle"
            :description="project.description"
            :image="project.image"
            :media="project.media"
            :technologies="project.technologies"
            :achievements="project.achievements"
            :github="project.github"
            :demo="project.demo"
            :external-link="project.externalLink"
            :demo-type="project.demoType"
            :featured="project.featured"
            :year="project.year"
          />
        </div>
        
        <!-- Empty state -->
        <div v-if="filteredProjects.length === 0 && !isLoading" class="empty-state">
          <el-empty description="No projects found for this category">
            <el-button type="primary" @click="setActiveFilter('all')">
              View All Projects
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import ProjectCard from '@/components/ProjectCard.vue'
import { PROJECT_DATA, PROJECT_FILTERS, type Project } from '@/constants/projects'

// State
const activeFilter = ref('all')
const showFilters = ref(true)
const isLoading = ref(false)
const isMobile = ref(false)
const projects = ref<Project[]>([...PROJECT_DATA])

// Router
const route = useRoute()

// Check mobile device
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Computed
const filters = computed(() => PROJECT_FILTERS)

const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') {
    return projects.value
  }
  return projects.value.filter(project => 
    project.categories.includes(activeFilter.value)
  )
})

// Methods
const setActiveFilter = async (filterValue: string) => {
  if (filterValue === activeFilter.value) return
  
  isLoading.value = true
  
  // Simulate loading for better UX
  await new Promise(resolve => setTimeout(resolve, 200))
  
  activeFilter.value = filterValue
  isLoading.value = false
  
  // Show notification for better feedback
  const filterLabel = PROJECT_FILTERS.find(f => f.value === filterValue)?.label || 'Projects'
  ElNotification({
    title: 'Filter Applied',
    message: `Showing ${filterLabel.toLowerCase()}`,
    type: 'info',
    duration: 2000
  })
}

// Initialize component
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Check if a category filter was specified in the URL
  const categoryParam = route.query.category as string
  if (categoryParam && PROJECT_FILTERS.some(f => f.value === categoryParam)) {
    activeFilter.value = categoryParam
  }
  
  // Check if ?view=ai-lead is set to modify content
  if (route.query.view === 'ai-lead') {
    // Prioritize AI projects
    projects.value.sort((a, b) => {
      if (a.categories.includes('ai') && !b.categories.includes('ai')) return -1
      if (!a.categories.includes('ai') && b.categories.includes('ai')) return 1
      return 0
    })
  }
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
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

.filter-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
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

/* Mobile responsiveness */
@media (max-width: 768px) {
  .projects-page {
    padding: 1rem 0 2rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .lead {
    font-size: 1rem;
    padding: 0 1rem;
  }
  
  .project-filters {
    gap: 0.5rem;
    margin: 0 1rem 2rem 1rem;
  }
  
  .filter-btn {
    min-height: 44px; /* Touch-friendly minimum */
  }
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

/* Theme compatibility */
.projects-page,
.projects-page * {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>