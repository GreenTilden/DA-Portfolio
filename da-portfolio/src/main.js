import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router' // Add this if you have router
import ObserveVisibility from 'vue3-observe-visibility'
import Particles from 'vue3-particles'

const app = createApp(App)
app.use(ElementPlus)
app.use(router) // Add this if you have router
app.use(ObserveVisibility)
app.use(Particles)
app.mount('#app')