import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// Handle logo hover effects
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    const logo = document.getElementById('logo');
    const layer2 = document.getElementById('layer_2');
    const layer3 = document.getElementById('layer_3');
    
    if (logo && layer2 && layer3) {
      // When logo is hovered, show the glitch effect
      logo.addEventListener('mouseenter', function() {
        layer2.style.opacity = '1';
        layer3.style.opacity = '1';
      });
      
      // When hover stops, hide the glitch effect
      logo.addEventListener('mouseleave', function() {
        layer2.style.opacity = '0';
        layer3.style.opacity = '0';
      });
    }
  }, 1000); // Increased delay to ensure SVG is fully loaded and accessible
});

const app = createApp(App)
app.mount('#app') 