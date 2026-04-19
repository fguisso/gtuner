export class FrequencyBars {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    this.ctx = ctx
    this.resize()
    window.addEventListener('resize', this.resize.bind(this), false)
  }

  resize(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight / 2
  }

  update(frequencyData: Uint8Array<ArrayBufferLike>): void {
    const ctx = this.ctx
    const barWidth = 2
    const barGap = 1
    const bars = Math.floor(this.canvas.width / (barWidth + barGap))
    const barHeightMultiplier = 0.5

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const isDarkMode = document.documentElement.classList.contains('dark')

    for (let i = 0; i < bars; i++) {
      const value = frequencyData[i] ?? 0
      const x = i * (barWidth + barGap)
      const barHeight = (value / 255) * this.canvas.height * barHeightMultiplier
      const y = this.canvas.height - barHeight

      const gradient = ctx.createLinearGradient(0, y, 0, this.canvas.height)
      gradient.addColorStop(0, '#e74c3c')
      gradient.addColorStop(1, isDarkMode ? '#8e44ad' : '#3498db')

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)
    }
  }
}
