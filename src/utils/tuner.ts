import { PitchDetector } from 'pitchy'
import { noteStrings, type NoteName } from './notes'

export interface DetectedNote {
  name: NoteName
  value: number
  cents: number
  octave: number
  frequency: number
  clarity: number
}

export type NoteDetectedHandler = (note: DetectedNote) => void

const SEMITONE = 69
const MIN_CLARITY = 0.9
const MIN_FREQUENCY = 60
const MAX_FREQUENCY = 1500

export class Tuner {
  middleA: number
  bufferSize = 2048
  onNoteDetected: NoteDetectedHandler | null = null

  audioContext?: AudioContext
  analyser?: AnalyserNode

  private stream?: MediaStream
  private source?: MediaStreamAudioSourceNode
  private scriptProcessor?: ScriptProcessorNode
  private detector?: PitchDetector<Float32Array<ArrayBuffer>>
  private inputBuffer?: Float32Array<ArrayBuffer>

  constructor(middleA = 440) {
    this.middleA = middleA
  }

  async init(): Promise<void> {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.audioContext = new Ctx()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = this.bufferSize

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    await this.audioContext.resume()

    this.stream = stream
    this.source = this.audioContext.createMediaStreamSource(stream)
    this.source.connect(this.analyser)

    this.detector = PitchDetector.forFloat32Array(this.bufferSize)
    this.inputBuffer = new Float32Array(
      new ArrayBuffer(this.bufferSize * Float32Array.BYTES_PER_ELEMENT),
    )

    this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1)
    this.analyser.connect(this.scriptProcessor)
    this.scriptProcessor.connect(this.audioContext.destination)

    this.scriptProcessor.onaudioprocess = () => {
      this.processAudioFrame()
    }
  }

  private processAudioFrame(): void {
    if (!this.analyser || !this.detector || !this.inputBuffer || !this.audioContext) return
    this.analyser.getFloatTimeDomainData(this.inputBuffer)
    const [pitch, clarity] = this.detector.findPitch(this.inputBuffer, this.audioContext.sampleRate)
    if (
      clarity < MIN_CLARITY ||
      pitch < MIN_FREQUENCY ||
      pitch > MAX_FREQUENCY ||
      !this.onNoteDetected
    ) {
      return
    }
    const note = this.getNote(pitch)
    this.onNoteDetected({ ...note, frequency: pitch, clarity })
  }

  getNote(frequency: number): Omit<DetectedNote, 'frequency' | 'clarity'> {
    const noteNum = 12 * (Math.log(frequency / this.middleA) / Math.log(2))
    const noteNumRounded = Math.round(noteNum)
    const fullNoteNum = noteNumRounded + SEMITONE
    return {
      value: fullNoteNum,
      cents: Math.floor((noteNum - noteNumRounded) * 100),
      name: noteStrings[((fullNoteNum % 12) + 12) % 12],
      octave: Math.floor(fullNoteNum / 12) - 1,
    }
  }

  close(): void {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.scriptProcessor?.disconnect()
    this.analyser?.disconnect()
    this.source?.disconnect()
    void this.audioContext?.close()
  }
}
