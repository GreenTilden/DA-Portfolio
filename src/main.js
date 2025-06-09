import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './style.css'
import './styles/mobile-workflow.css'
import App from './App.vue'
import router from './router'
import ObserveVisibility from 'vue3-observe-visibility'
import Particles from 'vue3-particles'
import { VueDraggableNext } from 'vue-draggable-next'

const redirect = sessionStorage.getItem('redirect');
if (redirect) {
  sessionStorage.removeItem('redirect');
  const path = redirect.startsWith('/') ? redirect.substring(1) : redirect;
  if (path !== '' && path !== '/' && path !== '/index.html') {
    router.push(path);
  }
}

const app = createApp(App)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router)
app.use(ObserveVisibility)
app.use(Particles)
app.component('draggable', VueDraggableNext)
app.mount('#app')