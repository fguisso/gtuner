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
  /** EWMA factor (0–1) applied after the median. Lower = smoother/steadier. */
  emaAlpha?: number
  /** Pitch changes larger than this (in cents) snap instantly instead of gliding. */
  jumpCents?: number
}

export class PitchSmoother {
  private readonly windowSize: number
  private readonly minClarity: number
  private readonly minRms: number
  private readonly minFreq: number
  private readonly maxFreq: number
  private readonly emaAlpha: number
  private readonly jumpCents: number
  private readonly samples: number[] = []
  private ema: number | null = null

  constructor(opts: SmootherOptions = {}) {
    this.windowSize = opts.windowSize ?? 6
    this.minClarity = opts.minClarity ?? 0.85
    this.minRms = opts.minRms ?? 0.006
    this.minFreq = opts.minFreq ?? 60
    this.maxFreq = opts.maxFreq ?? 1500
    this.emaAlpha = opts.emaAlpha ?? 0.25
    this.jumpCents = opts.jumpCents ?? 45
  }

  /**
   * Feed a raw sample. Returns the smoothed pitch in Hz, or null if the
   * sample was rejected (low clarity, outside range, signal too quiet).
   *
   * Two-stage filtering keeps the needle steady without feeling laggy:
   *  1. a median window rejects transient spikes/octave errors;
   *  2. an EWMA glides over the residual jitter, but a large jump (e.g.
   *     switching strings) snaps straight to the new pitch.
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

    const med = median(this.samples)
    if (this.ema == null) {
      this.ema = med
      return med
    }
    const centsAway = Math.abs(1200 * Math.log2(med / this.ema))
    if (centsAway > this.jumpCents) {
      this.ema = med
    } else {
      this.ema += this.emaAlpha * (med - this.ema)
    }
    return this.ema
  }

  reset(): void {
    this.samples.length = 0
    this.ema = null
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}
