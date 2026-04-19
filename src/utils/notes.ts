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
  value: number
}

const A4_VALUE = 69

export function createNotes(a4: number): Note[] {
  const notes: Note[] = []
  for (let octave = 0; octave < 9; octave++) {
    for (let n = 0; n < 12; n++) {
      const value = octave * 12 + n
      const frequency = a4 * Math.pow(2, (value - A4_VALUE) / 12)
      const name = noteStrings[n]
      notes.push({
        name,
        sharp: name.includes('♯'),
        octave,
        frequency,
        value,
      })
    }
  }
  return notes
}

export function getFrequencyFromNoteValue(value: number, a4: number): number {
  return a4 * Math.pow(2, (value - A4_VALUE) / 12)
}

export function getFullNoteName(note: Pick<Note, 'name' | 'sharp' | 'octave'>): string {
  return `${note.name}${note.sharp ? '#' : ''}${note.octave}`
}

export function getCents(frequency: number, targetFrequency: number): number {
  return Math.floor(1200 * Math.log2(frequency / targetFrequency))
}
