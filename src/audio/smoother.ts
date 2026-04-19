export interface PitchSample {
  pitch: number
  clarity: number
  rms: number
}

export interface SmootherOptions {
  windowSize?: number
  minClarity?: number
  minRms?: number
  minFreq?: number
  maxFreq?: number
}

export class PitchSmoother {
  private readonly windowSize: number
  private readonly minClarity: number
  private readonly minRms: number
  private readonly minFreq: number
  private readonly maxFreq: number
  private readonly samples: number[] = []

  constructor(opts: SmootherOptions = {}) {
    this.windowSize = opts.windowSize ?? 6
    this.minClarity = opts.minClarity ?? 0.9
    this.minRms = opts.minRms ?? 0.01
    this.minFreq = opts.minFreq ?? 60
    this.maxFreq = opts.maxFreq ?? 1500
  }

  /**
   * Feed a raw sample. Returns the smoothed pitch in Hz, or null if the
   * sample was rejected (low clarity, outside range, signal too quiet).
   */
  push(sample: PitchSample): number | null {
    const { pitch, clarity, rms } = sample
    if (
      !Number.isFinite(pitch) ||
      clarity < this.minClarity ||
      rms < this.minRms ||
      pitch < this.minFreq ||
      pitch > this.maxFreq
    ) {
      return null
    }
    this.samples.push(pitch)
    if (this.samples.length > this.windowSize) this.samples.shift()
    if (this.samples.length < 3) return null
    return median(this.samples)
  }

  reset(): void {
    this.samples.length = 0
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}
