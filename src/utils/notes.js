/**
 * Constants and utility functions for musical notes
 */

// Note strings in standard notation
export const noteStrings = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

/**
 * Create a list of notes based on the A4 reference frequency
 */
export function createNotes(a4) {
  const notes = []
  const a4Value = 69 // MIDI note value for A4
  
  // Generate notes for 8 octaves (0-8)
  for (let octave = 0; octave < 9; octave++) {
    for (let n = 0; n < 12; n++) {
      const value = octave * 12 + n
      
      // Calculate the frequency using the equal temperament formula
      // f = 2^((n-69)/12) * 440Hz
      const frequency = a4 * Math.pow(2, (value - a4Value) / 12)
      
      // Create the note object
      notes.push({
        name: noteStrings[n],
        sharp: noteStrings[n].includes('♯'),
        octave,
        frequency,
        value
      })
    }
  }
  
  return notes
}

/**
 * Calculate frequency for a specific note value
 */
export function getFrequencyFromNoteValue(value, a4) {
  const a4Value = 69
  return a4 * Math.pow(2, (value - a4Value) / 12)
}

/**
 * Get note name with octave
 */
export function getFullNoteName(note) {
  return note.name + (note.sharp ? '#' : '') + note.octave
}

/**
 * Calculate cents difference between two frequencies
 */
export function getCents(frequency, targetFrequency) {
  return Math.floor(1200 * Math.log2(frequency / targetFrequency))
} 