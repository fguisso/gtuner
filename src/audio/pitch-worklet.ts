/// <reference lib="webworker" />
import { PitchDetector } from 'pitchy'

declare class AudioWorkletProcessor {
  readonly port: MessagePort
  constructor()
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean
}

declare const registerProcessor: (name: string, ctor: typeof AudioWorkletProcessor) => void
declare const sampleRate: number

interface PitchMessage {
  pitch: number
  clarity: number
  rms: number
}

interface ProcessorOptions {
  processorOptions?: {
    bufferSize?: number
  }
}

class PitchProcessor extends AudioWorkletProcessor {
  private readonly bufferSize: number
  private readonly buffer: Float32Array<ArrayBuffer>
  private bufferIndex = 0
  private readonly detector: PitchDetector<Float32Array<ArrayBuffer>>

  constructor(options: ProcessorOptions = {}) {
    super()
    this.bufferSize = options.processorOptions?.bufferSize ?? 2048
    this.buffer = new Float32Array(
      new ArrayBuffer(this.bufferSize * Float32Array.BYTES_PER_ELEMENT),
    )
    this.detector = PitchDetector.forFloat32Array(this.bufferSize)
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]?.[0]
    if (!input || input.length === 0) return true

    for (let i = 0; i < input.length; i++) {
      this.buffer[this.bufferIndex++] = input[i]
      if (this.bufferIndex >= this.bufferSize) {
        this.emitPitch()
        this.bufferIndex = 0
      }
    }
    return true
  }

  private emitPitch(): void {
    let sumSquares = 0
    for (let i = 0; i < this.bufferSize; i++) sumSquares += this.buffer[i] * this.buffer[i]
    const rms = Math.sqrt(sumSquares / this.bufferSize)

    const [pitch, clarity] = this.detector.findPitch(this.buffer, sampleRate)
    const msg: PitchMessage = { pitch, clarity, rms }
    this.port.postMessage(msg)
  }
}

registerProcessor('pitch-processor', PitchProcessor)
