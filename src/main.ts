import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.mount('#app')

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const logo = document.getElementById('logo')
    const layer2 = document.getElementById('layer_2')
    const layer3 = document.getElementById('layer_3')
    if (!logo || !layer2 || !layer3) return
    logo.addEventListener('mouseenter', () => {
      layer2.style.opacity = '1'
      layer3.style.opacity = '1'
    })
    logo.addEventListener('mouseleave', () => {
      layer2.style.opacity = '0'
      layer3.style.opacity = '0'
    })
  }, 1000)
})
