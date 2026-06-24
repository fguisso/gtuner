import { PitchDetector } from 'pitchy'
import { MicInput, SILENCE_PEAK } from './mic-input'
import { PitchSmoother, type SmootherOptions } from './smoother'

export type TunerState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

export interface SmoothedPitch {
  /** Smoothed pitch in Hz. */
  frequency: number
  /** Clarity of the latest raw sample that produced this smoothed value. */
  clarity: number
  rms: number
}

export type PitchHandler = (p: SmoothedPitch) => void
export type StateHandler = (state: TunerState, error?: Error) => void

export interface EngineOptions {
  fftSize?: number
  smoother?: SmootherOptions
}

const DEFAULT_FFT_SIZE = 2048

/**
 * Drives pitch detection off a {@link MicInput} on the main thread via
 * requestAnimationFrame. MicInput owns the cross-engine capture (raw PCM out of
 * a ScriptProcessorNode, which is the only reader that works on iOS Safari); the
 * engine just runs pitchy on each fresh frame, smooths the result, and reports.
 */
export class TunerEngine {
  state: TunerState = 'idle'

  private readonly fftSize: number
  private readonly smoother: PitchSmoother
  private readonly mic: MicInput

  private detector?: PitchDetector<Float32Array<ArrayBuffer>>
  private buffer?: Float32Array<ArrayBuffer>
  private rafId: number | null = null

  // detection runs on rAF but is throttled to spare the main thread on phones
  private lastDetectAt = 0
  private readonly detectIntervalMs = 22 // ~45 Hz cap

  private onPitch: PitchHandler | null = null
  private onState: StateHandler | null = null

  constructor(opts: EngineOptions = {}) {
    this.fftSize = opts.fftSize ?? DEFAULT_FFT_SIZE
    this.smoother = new PitchSmoother(opts.smoother)
    this.mic = new MicInput({ bufferSize: this.fftSize, fftSize: this.fftSize })
  }

  get analyser(): AnalyserNode | undefined {
    return this.mic.analyser
  }

  onPitchEvent(handler: PitchHandler): void {
    this.onPitch = handler
  }

  onStateChange(handler: StateHandler): void {
    this.onState = handler
  }

  async start(): Promise<void> {
    if (this.state === 'granted' || this.state === 'requesting') return
    this.setState('requesting')

    try {
      await this.mic.start()
      this.detector = PitchDetector.forFloat32Array(this.fftSize)
      this.buffer = new Float32Array(new ArrayBuffer(this.fftSize * Float32Array.BYTES_PER_ELEMENT))
      this.setState('granted')
      this.loop()
    } catch (err) {
      const error = err as Error & { name?: string }
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        this.setState('denied', error)
      } else {
        this.setState('error', error)
      }
      await this.cleanup()
      throw err
    }
  }

  async stop(): Promise<void> {
    await this.cleanup()
    this.setState('idle')
  }

  private loop(): void {
    const raf = globalThis.requestAnimationFrame
    if (!raf) return
    this.rafId = raf((now) => {
      if (now - this.lastDetectAt >= this.detectIntervalMs) {
        this.lastDetectAt = now
        this.detect()
      }
      if (this.state === 'granted') this.loop()
    })
  }

  private detect(): void {
    const detector = this.detector
    const buffer = this.buffer
    if (!detector || !buffer) return

    const reading = this.mic.read(buffer)
    // No new audio frame since the last tick — hold the needle, skip the work.
    if (!reading.fresh) return
    // Genuinely quiet — hold the needle instead of chasing background noise.
    if (reading.peak < SILENCE_PEAK) return

    let sumSquares = 0
    for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] * buffer[i]
    const rms = Math.sqrt(sumSquares / buffer.length)

    const [pitch, clarity] = detector.findPitch(buffer, this.mic.sampleRate)
    const smoothed = this.smoother.push({ pitch, clarity, rms })
    if (smoothed != null) this.onPitch?.({ frequency: smoothed, clarity, rms })
  }

  private setState(state: TunerState, err?: Error): void {
    this.state = state
    this.onState?.(state, err)
  }

  private async cleanup(): Promise<void> {
    if (this.rafId != null) {
      globalThis.cancelAnimationFrame?.(this.rafId)
      this.rafId = null
    }
    await this.mic.stop()
    this.detector = undefined
    this.buffer = undefined
    this.lastDetectAt = 0
    this.smoother.reset()
  }
}
