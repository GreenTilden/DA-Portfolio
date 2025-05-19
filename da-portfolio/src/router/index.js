import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomePage.vue'
import Projects from '@/views/ProjectsPage.vue'
import Demos from '@/views/DemosPage.vue'
import Experience from '@/views/ExperiencePage.vue'
import Contact from '@/views/ContactPage.vue'
import ParticleDebug from '@/views/ParticleDebug.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/projects', component: Projects },
  { path: '/demos', component: Demos },
  { path: '/experience', component: Experience },
  { path: '/contact', component: Contact },
  { path: '/debug', component: ParticleDebug }
]
// Import the necessary components for the routes
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router