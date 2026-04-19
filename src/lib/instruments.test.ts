import { describe, expect, it } from 'vitest'
import {
  INSTRUMENT_TUNINGS,
  closestString,
  getTuningById,
  stringFrequency,
  tuningsFor,
} from './instruments'

describe('instruments', () => {
  it('has guitar and ukulele tunings', () => {
    expect(tuningsFor('guitar').length).toBeGreaterThanOrEqual(3)
    expect(tuningsFor('ukulele').length).toBeGreaterThanOrEqual(2)
  })

  it('guitar standard strings produce correct frequencies at A4=440', () => {
    const t = getTuningById('guitar-standard')!
    const byLabel = (label: string) => t.strings.find((s) => s.label === label)!
    expect(stringFrequency(byLabel('6E'), 440)).toBeCloseTo(82.407, 2)
    expect(stringFrequency(byLabel('5A'), 440)).toBeCloseTo(110.0, 2)
    expect(stringFrequency(byLabel('1E'), 440)).toBeCloseTo(329.628, 2)
  })

  it('ukulele standard has re-entrant G (high-G at MIDI 67)', () => {
    const t = getTuningById('ukulele-standard')!
    const g = t.strings.find((s) => s.label === '4G')!
    expect(g.value).toBe(67)
  })

  it('closestString picks the nearest pitch', () => {
    const t = getTuningById('guitar-standard')!
    // ~110 Hz should pick A2 (5A)
    expect(closestString(t, 111, 440).label).toBe('5A')
    // ~80 Hz should pick E2 (6E)
    expect(closestString(t, 80, 440).label).toBe('6E')
  })

  it('all tunings have unique IDs', () => {
    const ids = INSTRUMENT_TUNINGS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
