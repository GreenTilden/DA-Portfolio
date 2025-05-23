<template>
    <div class="project-card">
      <div class="project-image" v-if="image">
        <img :src="image" :alt="title">
      </div>
      <div class="project-content">
        <h3 class="project-title">{{ title }}</h3>
        <p class="project-description">{{ description }}</p>
        <div class="project-technologies" v-if="technologies && technologies.length">
          <span class="tech-tag" v-for="(tech, index) in technologies" :key="index">{{ tech }}</span>
        </div>
        <div class="project-links">
          <a v-if="github" :href="github" target="_blank" rel="noopener" class="project-link github">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            GitHub
          </a>
          <router-link v-if="demo" :to="demo" class="project-link demo">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16l4-4-4-4"></path><path d="M8 12h8"></path></svg>
            View Demo
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProjectCard',
    props: {
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      image: {
        type: String,
        default: null
      },
      technologies: {
        type: Array,
        default: () => []
      },
      github: {
        type: String,
        default: null
      },
      demo: {
        type: String,
        default: null
      }
    }
  }
  </script>
  
  <style scoped>
  .project-card {
    background-color: var(--bg-light);
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  .project-image img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-bottom: 1px solid var(--border-color);
  }
  
  .project-content {
    padding: 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .project-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--secondary-color);
    margin-bottom: 0.75rem;
  }
  
  .project-description {
    color: var(--text-light);
    margin-bottom: 1.25rem;
    flex-grow: 1;
  }
  
  .project-technologies {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  
  .tech-tag {
    background-color: var(--hover-bg);
    color: var(--primary-color);
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  
  .project-links {
    display: flex;
    gap: 1rem;
    margin-top: auto;
  }
  
  .project-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.25rem;
    transition: all 0.3s ease;
  }
  
  .project-link.github {
    color: var(--text-color);
    background-color: var(--bg-color);
  }
  
  .project-link.github:hover {
    background-color: var(--border-color);
  }
  
  .project-link.demo {
    color: white;
    background-color: var(--primary-color);
  }
  
  .project-link.demo:hover {
    background-color: var(--primary-dark);
  }
  </style>