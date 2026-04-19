export const noteStrings = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
] as const

export type NoteName = (typeof noteStrings)[number]

export interface Note {
  name: NoteName
  sharp: boolean
  octave: number
  frequency: number
  /** MIDI note number (A4 = 69, C4 = 60). */
  value: number
}

export const A4_MIDI = 69

/**
 * Build the full chromatic note list using MIDI numbering.
 * Octave is reported in scientific pitch notation (C4 is middle C, MIDI 60).
 */
export function createNotes(a4: number): Note[] {
  const notes: Note[] = []
  for (let value = 0; value < 128; value++) {
    const frequency = getFrequencyFromNoteValue(value, a4)
    const n = value % 12
    const name = noteStrings[n]
    notes.push({
      name,
      sharp: name.includes('♯'),
      octave: Math.floor(value / 12) - 1,
      frequency,
      value,
    })
  }
  return notes
}

export function getFrequencyFromNoteValue(value: number, a4: number): number {
  return a4 * Math.pow(2, (value - A4_MIDI) / 12)
}

export function getFullNoteName(note: Pick<Note, 'name' | 'octave'>): string {
  return `${note.name}${note.octave}`
}

export function getCents(frequency: number, targetFrequency: number): number {
  return Math.floor(1200 * Math.log2(frequency / targetFrequency))
}
