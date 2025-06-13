<template>
  <el-card class="project-card" shadow="hover" :body-style="{ padding: '0' }" :class="{ 'featured': featured }">
    <!-- Project Header with Featured Badge -->
    <div class="project-header" v-if="featured || year">
      <el-tag v-if="featured" type="success" size="small" class="featured-badge">
        <i class="fas fa-star"></i>
        Featured
      </el-tag>
      <el-tag v-if="year" type="info" size="small" effect="plain" class="year-badge">
        {{ year }}
      </el-tag>
    </div>

    <!-- Project Image/Video Thumbnail -->
    <div class="project-image" v-if="image || (media && media.length > 0)">
      <div v-if="demoType === 'video' && media[0]" class="video-thumbnail">
        <el-image 
          :src="media[0].thumbnail || '/images/video-placeholder.jpg'" 
          :alt="title" 
          fit="cover" 
          class="card-image"
        />
        <div class="play-overlay">
          <i class="fas fa-play-circle"></i>
        </div>
        <div class="video-duration">Demo Video</div>
      </div>
      <el-image v-else :src="image" :alt="title" fit="cover" class="card-image" />
    </div>

    <div class="project-content">
      <!-- Title and Subtitle -->
      <div class="project-header-content">
        <h3 class="project-title">{{ title }}</h3>
        <p v-if="subtitle" class="project-subtitle">{{ subtitle }}</p>
      </div>
      
      <!-- Description -->
      <p class="project-description">{{ description }}</p>
      
      <!-- Key Achievements -->
      <div class="project-achievements" v-if="achievements && achievements.length">
        <h4 class="achievements-title">Key Results:</h4>
        <ul class="achievements-list">
          <li v-for="achievement in achievements.slice(0, 2)" :key="achievement" class="achievement-item">
            <i class="fas fa-check-circle"></i>
            {{ achievement }}
          </li>
        </ul>
      </div>
      
      <!-- Technologies -->
      <div class="project-technologies" v-if="technologies && technologies.length">
        <el-tag 
          v-for="tech in technologies.slice(0, 4)" 
          :key="tech"
          size="small"
          type="info"
          effect="plain"
          class="tech-tag"
        >
          {{ tech }}
        </el-tag>
        <el-tag v-if="technologies.length > 4" size="small" type="info" effect="plain" class="tech-more">
          +{{ technologies.length - 4 }} more
        </el-tag>
      </div>
      
      <!-- Action Links -->
      <div class="project-links">
        <el-button 
          v-if="demo" 
          @click="$router.push(demo)"
          :type="demoType === 'video' ? 'success' : 'primary'"
          size="default"
          class="demo-btn"
        >
          <i :class="getDemoIcon"></i>
          {{ getDemoButtonText }}
        </el-button>
        <el-button 
          v-if="github" 
          @click="openLink(github)"
          size="default"
          type="default"
          class="github-btn"
        >
          <i :class="githubIcon"></i>
          GitHub
        </el-button>
        <el-button 
          v-if="externalLink" 
          @click="openLink(externalLink)"
          size="default"
          type="info"
          class="external-btn"
        >
          <i class="fas fa-external-link-alt"></i>
          External Link
        </el-button>
      </div>
    </div>
  </el-card>
</template>
  
<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectMedia } from '@/constants/projects'

interface Props {
  title: string
  subtitle?: string
  description: string
  image?: string | null
  media?: ProjectMedia[]
  technologies?: string[]
  achievements?: string[]
  github?: string | null
  demo?: string | null
  externalLink?: string
  demoType?: 'interactive' | 'video' | 'gallery' | 'workflow'
  featured?: boolean
  year?: number
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  image: null,
  media: () => [],
  technologies: () => [],
  achievements: () => [],
  github: null,
  demo: null,
  externalLink: '',
  demoType: 'interactive',
  featured: false,
  year: undefined
})

// Icons using FontAwesome classes
const githubIcon = computed(() => 'fab fa-github')

const getDemoIcon = computed(() => {
  switch (props.demoType) {
    case 'video':
      return 'fas fa-play'
    case 'gallery':
      return 'fas fa-images'
    case 'workflow':
      return 'fas fa-project-diagram'
    default:
      return 'fas fa-external-link-alt'
  }
})

const getDemoButtonText = computed(() => {
  switch (props.demoType) {
    case 'video':
      return 'Watch Video'
    case 'gallery':
      return 'View Gallery'
    case 'workflow':
      return 'View Workflow'
    default:
      return 'View Demo'
  }
})

// Method for opening external links
const openLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
  
<style scoped>
.project-card {
  height: 100%;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--card-bg);
  border-color: var(--border-color);
  position: relative;
  overflow: hidden;
}

.project-card:hover {
  transform: translateY(-4px);
}

.project-card.featured {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 74, 144, 226), 0.15);
}

/* Project Header with Badges */
.project-header {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  align-items: flex-end;
}

.featured-badge {
  background: linear-gradient(135deg, var(--success-color) 0%, #16a085 100%);
  border-color: var(--success-color);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.year-badge {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
}

/* Video Thumbnail Styling */
.project-image {
  position: relative;
  overflow: hidden;
}

.video-thumbnail {
  position: relative;
  cursor: pointer;
}

.card-image {
  width: 100%;
  height: 200px;
  border-bottom: 1px solid var(--border-color);
  transition: transform 0.3s ease;
}

.video-thumbnail:hover .card-image {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
  transition: all 0.3s ease;
}

.video-thumbnail:hover .play-overlay {
  transform: translate(-50%, -50%) scale(1.1);
  color: var(--primary-color);
}

.video-duration {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Content Styling */
.project-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-header-content {
  margin-bottom: 1rem;
}

.project-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.project-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.project-description {
  color: var(--text-muted);
  margin-bottom: 1rem;
  line-height: 1.6;
  font-size: 0.9rem;
}

/* Achievements Section */
.project-achievements {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--section-bg);
  border-radius: 0.5rem;
  border-left: 3px solid var(--primary-color);
}

.achievements-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.achievements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.achievement-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.achievement-item i {
  color: var(--success-color);
  margin-top: 0.1rem;
  flex-shrink: 0;
}

/* Technologies */
.project-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tech-tag,
.tech-more {
  font-size: 0.7rem;
  border-color: var(--border-color);
  background: var(--section-bg);
  color: var(--text-muted);
}

.tech-more {
  font-style: italic;
  opacity: 0.8;
}

/* Action Links */
.project-links {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  flex-wrap: wrap;
}

.demo-btn,
.github-btn,
.external-btn {
  flex: 1;
  min-width: 80px;
  font-size: 0.875rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.github-btn {
  border-color: var(--border-color);
  background: var(--section-bg);
  color: var(--text-color);
}

.github-btn:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.demo-btn {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.demo-btn:hover {
  background: var(--primary-color-dark);
  border-color: var(--primary-color-dark);
}

.external-btn {
  background: var(--info-color);
  border-color: var(--info-color);
}

.external-btn:hover {
  opacity: 0.9;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .project-content {
    padding: 1rem;
  }
  
  .project-title {
    font-size: 1.125rem;
  }
  
  .project-header {
    top: 0.5rem;
    right: 0.5rem;
  }
  
  .play-overlay {
    font-size: 2.5rem;
  }
  
  .project-achievements {
    padding: 0.75rem;
  }
  
  .achievement-item {
    font-size: 0.75rem;
  }
  
  .project-links {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .demo-btn,
  .github-btn,
  .external-btn {
    flex: none;
    width: 100%;
  }
}

/* Theme compatibility */
.project-card,
.project-card * {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), 
              color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>