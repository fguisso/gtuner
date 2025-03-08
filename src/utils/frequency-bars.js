/**
 * Class for rendering frequency bars visualization
 */
export class FrequencyBars {
  constructor(canvas) {
    this.canvas = canvas
    this.canvasContext = this.canvas.getContext('2d')
    this.resize()
    window.addEventListener('resize', this.resize.bind(this), false)
  }

  /**
   * Resize the canvas to match window dimensions
   */
  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight / 2
  }

  /**
   * Update the frequency bars based on audio data
   */
  update(frequencyData) {
    const ctx = this.canvasContext
    const barWidth = 2
    const barGap = 1
    const bars = Math.floor(this.canvas.width / (barWidth + barGap))
    const barHeightMultiplier = 0.5
    
    // Clear the canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Determine if dark mode is active - check the HTML element
    const isDarkMode = document.documentElement.classList.contains('dark')
    
    // Draw the frequency bars
    frequencyData.slice(0, bars).forEach((value, i) => {
      // Calculate bar dimensions and position
      const x = i * (barWidth + barGap)
      const barHeight = (value / 255) * this.canvas.height * barHeightMultiplier
      const y = this.canvas.height - barHeight
      
      // Define gradient colors based on theme
      const gradient = ctx.createLinearGradient(0, y, 0, this.canvas.height)
      
      if (isDarkMode) {
        // Dark theme colors
        gradient.addColorStop(0, '#e74c3c') // Primary red color
        gradient.addColorStop(1, '#8e44ad') // Purple color
      } else {
        // Light theme colors
        gradient.addColorStop(0, '#e74c3c') // Keep primary red color
        gradient.addColorStop(1, '#3498db') // Blue color for light theme
      }
      
      // Draw the bar
      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)
    })
  }
} 