import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomePage.vue'
import Projects from '@/views/ProjectsPage.vue'
import Demos from '@/views/DemosPage.vue'
import Experience from '@/views/ExperiencePage.vue'
import Contact from '@/views/ContactPage.vue'
import ParticleDebug from '@/views/ParticleDebug.vue'
import EllaBirdCamDemo from '@/views/EllaBirdCamDemo.vue'
import CellImagingSchedulerDemo from '@/views/CellImagingSchedulerDemo.vue'
import LiquidHandlerVisualizer from '@/components/demos/LiquidHandlerVisualizer.vue'
import WorkflowOptimizer from '@/components/demos/WorkflowOptimizer.vue'

const routes = [
  { path: '/', component: Home, alias: '/DA-Portfolio/' },
  { path: '/projects', component: Projects },
  { path: '/demos', component: Demos },
  { path: '/demos/ellabirdcam', component: EllaBirdCamDemo },
  { path: '/demos/cell-imaging-scheduler', component: CellImagingSchedulerDemo },
  { path: '/demos/liquid-handler', component: LiquidHandlerVisualizer },
  { path: '/demos/workflow', component: WorkflowOptimizer },
  { path: '/experience', component: Experience },
  { path: '/contact', component: Contact },
  { path: '/debug', component: ParticleDebug },
  { path: '/:catchAll(.*)', redirect: '/' }
]
// Import the necessary components for the routes
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router