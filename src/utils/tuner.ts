import { TunerEngine } from '../audio/engine'
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

/**
 * Compatibility wrapper that preserves the original Tuner API while
 * delegating audio capture and pitch detection to the new AudioWorklet-based
 * engine. The full refactor into composables happens in a later step.
 */
export class Tuner {
  middleA: number
  onNoteDetected: NoteDetectedHandler | null = null

  private readonly engine: TunerEngine

  constructor(middleA = 440) {
    this.middleA = middleA
    this.engine = new TunerEngine()

    this.engine.onPitchEvent(({ frequency, clarity }) => {
      if (!this.onNoteDetected) return
      const note = this.getNote(frequency)
      this.onNoteDetected({ ...note, frequency, clarity })
    })
  }

  get analyser(): AnalyserNode | undefined {
    return this.engine.analyser
  }

  async init(): Promise<void> {
    await this.engine.start()
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
    void this.engine.stop()
  }
}
