import { describe, expect, it } from 'vitest'
import { createNotes, getCents, getFrequencyFromNoteValue } from './notes'

describe('notes', () => {
  it('createNotes returns 12 * 9 notes', () => {
    const notes = createNotes(440)
    expect(notes).toHaveLength(12 * 9)
  })

  // NOTE: createNotes currently uses MIDI-style octave labels (off-by-one from
  // scientific pitch notation). Fixing this is tracked for the step-4 refactor.
  it('reference A (value 69) resolves to the a4 argument frequency', () => {
    const notes = createNotes(440)
    const ref = notes.find((n) => n.value === 69)
    expect(ref?.frequency).toBeCloseTo(440, 5)
  })

  it('getFrequencyFromNoteValue matches equal temperament', () => {
    expect(getFrequencyFromNoteValue(69, 440)).toBeCloseTo(440, 5)
    expect(getFrequencyFromNoteValue(57, 440)).toBeCloseTo(220, 5)
    expect(getFrequencyFromNoteValue(81, 440)).toBeCloseTo(880, 5)
  })

  it('getCents returns 0 for equal frequencies', () => {
    expect(getCents(440, 440)).toBe(0)
  })

  it('getCents is positive when frequency is above target', () => {
    expect(getCents(445, 440)).toBeGreaterThan(0)
  })
})
