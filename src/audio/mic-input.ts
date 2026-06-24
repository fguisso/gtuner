/**
 * MicInput — cross-engine microphone capture for real-time pitch detection.
 *
 * The hard problem this solves is iOS Safari (WebKit), where the "obvious"
 * approach — polling AnalyserNode.getFloatTimeDomainData() — returns zeros, and
 * disabling the browser's audio processing drops the captured level to ~1%.
 *
 * The reliable, battle-tested approach (used by the original qiuxiang/tuner this
 * project descends from, and by most working web tuners) is to read the raw PCM
 * straight out of a ScriptProcessorNode's input buffer instead:
 *
 *   source → analyser (for the visualizer)
 *   source → scriptProcessor → destination   (kept alive by reaching destination)
 *   scriptProcessor.onaudioprocess = e => e.inputBuffer.getChannelData(0)
 *
 * `getChannelData(0)` is full-fidelity Float32 PCM that works on every engine —
 * it never goes through the broken AnalyserNode time-domain readers. We also use
 * getUserMedia({ audio: true }) so the system auto-gain keeps a usable level on
 * iOS. ScriptProcessorNode is deprecated but still supported everywhere
 * (including iOS) and is far more reliable here than AudioWorklet, which Vite
 * can't bundle as a worklet module without breaking on WebKit/Gecko.
 *
 * References:
 *  - WebKit #230902 / #218012 — iOS mic level drops after permission grant.
 *  - Apple Dev #91754 — getFloatTimeDomainData returns zeros on iOS Safari.
 *  - github.com/qiuxiang/tuner — the ScriptProcessor + getChannelData pattern.
 */

/** Below this peak the input is treated as silence (hold the needle). */
export const SILENCE_PEAK = 0.004

export interface MicReading {
  /** Peak amplitude of the latest captured frame (0–1). */
  peak: number
  /** Whether a fresh audio frame arrived since the last read. */
  fresh: boolean
}

export interface MicInputOptions {
  /** ScriptProcessor buffer size (power of two). Also the pitch window length. */
  bufferSize?: number
  /** Analyser fftSize for the spectrum visualizer. */
  fftSize?: number
}

export class MicInput {
  readonly bufferSize: number
  private readonly fftSize: number

  private ctx?: AudioContext
  private stream?: MediaStream
  private source?: MediaStreamAudioSourceNode
  private processor?: ScriptProcessorNode
  private analyserNode?: AnalyserNode

  /** Most recent PCM frame, copied out of the audioprocess callback. */
  private latest: Float32Array<ArrayBuffer>
  private latestPeak = 0
  private hasFresh = false

  constructor(opts: MicInputOptions = {}) {
    this.bufferSize = opts.bufferSize ?? 2048
    this.fftSize = opts.fftSize ?? 2048
    this.latest = new Float32Array(
      new ArrayBuffer(this.bufferSize * Float32Array.BYTES_PER_ELEMENT),
    )
  }

  /** Shared AnalyserNode (for the spectrum visualizer). */
  get analyser(): AnalyserNode | undefined {
    return this.analyserNode
  }

  get sampleRate(): number {
    return this.ctx?.sampleRate ?? 0
  }

  async start(): Promise<void> {
    const Ctx: typeof AudioContext =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) throw new Error('AudioContext is not supported in this browser')

    const ctx = new Ctx()
    this.ctx = ctx

    // Plain `audio: true`: let the system keep a usable input level (especially
    // on iOS, where disabling auto-gain crushes the signal to ~1%).
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    this.stream = stream

    // iOS Safari requires an explicit resume after the user gesture.
    if (ctx.state === 'suspended') await ctx.resume()

    const source = ctx.createMediaStreamSource(stream)
    this.source = source

    const analyser = ctx.createAnalyser()
    analyser.fftSize = this.fftSize
    analyser.smoothingTimeConstant = 0.6
    this.analyserNode = analyser
    source.connect(analyser)

    // 1 output channel so it can connect to destination (required on iOS to
    // keep the node pulled); we never write the output buffer, so it stays
    // silent — no mic monitoring through the speakers.
    const processor = ctx.createScriptProcessor(this.bufferSize, 1, 1)
    this.processor = processor
    processor.onaudioprocess = (event) => this.onAudio(event)
    source.connect(processor)
    processor.connect(ctx.destination)
  }

  private onAudio(event: AudioProcessingEvent): void {
    const input = event.inputBuffer.getChannelData(0)
    const n = Math.min(input.length, this.latest.length)
    let peak = 0
    for (let i = 0; i < n; i++) {
      const v = input[i]
      this.latest[i] = v
      const a = v < 0 ? -v : v
      if (a > peak) peak = a
    }
    this.latestPeak = peak
    this.hasFresh = true
  }

  /**
   * Copy the most recent PCM frame into `out` (length === bufferSize) and report
   * its peak. `fresh` is true only when a new frame arrived since the last call.
   */
  read(out: Float32Array<ArrayBuffer>): MicReading {
    const fresh = this.hasFresh
    this.hasFresh = false
    out.set(this.latest)
    return { peak: this.latestPeak, fresh }
  }

  async stop(): Promise<void> {
    this.stream?.getTracks().forEach((t) => t.stop())
    if (this.processor) this.processor.onaudioprocess = null
    this.processor?.disconnect()
    this.source?.disconnect()
    this.analyserNode?.disconnect()
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        await this.ctx.close()
      } catch {
        // ignore — context may already be closing
      }
    }
    this.ctx = undefined
    this.stream = undefined
    this.source = undefined
    this.processor = undefined
    this.analyserNode = undefined
    this.latest.fill(0)
    this.latestPeak = 0
    this.hasFresh = false
  }
}
