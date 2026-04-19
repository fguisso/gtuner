import { describe, expect, it } from 'vitest'
import { createNotes, getCents, getFrequencyFromNoteValue, getFullNoteName } from './notes'

describe('notes', () => {
  it('createNotes spans 128 MIDI values', () => {
    expect(createNotes(440)).toHaveLength(128)
  })

  it('A4 (MIDI 69) resolves to the reference frequency', () => {
    const notes = createNotes(440)
    const a4 = notes.find((n) => n.name === 'A' && n.octave === 4)
    expect(a4?.value).toBe(69)
    expect(a4?.frequency).toBeCloseTo(440, 5)
  })

  it('middle C is C4 / MIDI 60 / ~261.6 Hz', () => {
    const notes = createNotes(440)
    const c4 = notes.find((n) => n.name === 'C' && n.octave === 4)
    expect(c4?.value).toBe(60)
    expect(c4?.frequency).toBeCloseTo(261.626, 2)
  })

  it('guitar low E is E2 / ~82.4 Hz', () => {
    const notes = createNotes(440)
    const e2 = notes.find((n) => n.name === 'E' && n.octave === 2)
    expect(e2?.value).toBe(40)
    expect(e2?.frequency).toBeCloseTo(82.407, 2)
  })

  it('getFrequencyFromNoteValue matches equal temperament', () => {
    expect(getFrequencyFromNoteValue(69, 440)).toBeCloseTo(440, 5)
    expect(getFrequencyFromNoteValue(57, 440)).toBeCloseTo(220, 5)
    expect(getFrequencyFromNoteValue(81, 440)).toBeCloseTo(880, 5)
  })

  it('getCents returns 0 for equal frequencies and positive when above', () => {
    expect(getCents(440, 440)).toBe(0)
    expect(getCents(445, 440)).toBeGreaterThan(0)
    expect(getCents(435, 440)).toBeLessThan(0)
  })

  it('getFullNoteName formats as name + octave', () => {
    expect(getFullNoteName({ name: 'C♯', octave: 4 })).toBe('C♯4')
    expect(getFullNoteName({ name: 'A', octave: 4 })).toBe('A4')
  })
})
