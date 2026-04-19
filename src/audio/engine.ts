import PitchWorkletUrl from './pitch-worklet.ts?worker&url'
import { PitchSmoother, type SmootherOptions } from './smoother'

export type TunerState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

export interface PitchEvent {
  pitch: number
  clarity: number
  rms: number
}

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
  bufferSize?: number
  fftSize?: number
  smoother?: SmootherOptions
}

const DEFAULT_BUFFER_SIZE = 2048
const DEFAULT_FFT_SIZE = 2048

export class TunerEngine {
  state: TunerState = 'idle'
  analyser?: AnalyserNode

  private readonly bufferSize: number
  private readonly fftSize: number
  private readonly smoother: PitchSmoother

  private audioContext?: AudioContext
  private stream?: MediaStream
  private source?: MediaStreamAudioSourceNode
  private workletNode?: AudioWorkletNode

  private onPitch: PitchHandler | null = null
  private onState: StateHandler | null = null

  constructor(opts: EngineOptions = {}) {
    this.bufferSize = opts.bufferSize ?? DEFAULT_BUFFER_SIZE
    this.fftSize = opts.fftSize ?? DEFAULT_FFT_SIZE
    this.smoother = new PitchSmoother(opts.smoother)
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
      const Ctx: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctx) throw new Error('AudioContext is not supported in this browser')

      const ctx = new Ctx()
      this.audioContext = ctx

      // Create the analyser eagerly so consumers can read `engine.analyser`
      // immediately after `start()` is called (useful for visualizations).
      const analyser = ctx.createAnalyser()
      analyser.fftSize = this.fftSize
      analyser.smoothingTimeConstant = 0.6
      this.analyser = analyser

      await ctx.audioWorklet.addModule(PitchWorkletUrl)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      this.stream = stream

      // iOS Safari requires an explicit resume after user gesture.
      if (ctx.state === 'suspended') await ctx.resume()

      const source = ctx.createMediaStreamSource(stream)
      this.source = source
      source.connect(analyser)

      const worklet = new AudioWorkletNode(ctx, 'pitch-processor', {
        processorOptions: { bufferSize: this.bufferSize },
        numberOfInputs: 1,
        numberOfOutputs: 0,
      })
      source.connect(worklet)
      this.workletNode = worklet

      worklet.port.onmessage = (event: MessageEvent<PitchEvent>) => {
        this.handlePitch(event.data)
      }

      this.setState('granted')
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

  private handlePitch(raw: PitchEvent): void {
    const smoothed = this.smoother.push(raw)
    if (smoothed == null) return
    this.onPitch?.({ frequency: smoothed, clarity: raw.clarity, rms: raw.rms })
  }

  private setState(state: TunerState, err?: Error): void {
    this.state = state
    this.onState?.(state, err)
  }

  private async cleanup(): Promise<void> {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.workletNode?.port.close()
    this.workletNode?.disconnect()
    this.source?.disconnect()
    this.analyser?.disconnect()
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        await this.audioContext.close()
      } catch {
        // ignore — context may already be closing
      }
    }
    this.stream = undefined
    this.source = undefined
    this.workletNode = undefined
    this.analyser = undefined
    this.audioContext = undefined
    this.smoother.reset()
  }
}
