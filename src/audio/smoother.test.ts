import { describe, expect, it } from 'vitest'
import { PitchSmoother } from './smoother'

const ok = (pitch: number) => ({ pitch, clarity: 0.99, rms: 0.1 })

describe('PitchSmoother', () => {
  it('rejects low-clarity samples', () => {
    const s = new PitchSmoother()
    expect(s.push({ pitch: 440, clarity: 0.5, rms: 0.1 })).toBeNull()
  })

  it('rejects quiet samples', () => {
    const s = new PitchSmoother({ minRms: 0.05 })
    expect(s.push({ pitch: 440, clarity: 0.99, rms: 0.001 })).toBeNull()
  })

  it('rejects out-of-range samples', () => {
    const s = new PitchSmoother()
    expect(s.push(ok(30))).toBeNull()
    expect(s.push(ok(2000))).toBeNull()
  })

  it('returns null until enough samples accumulate', () => {
    const s = new PitchSmoother()
    expect(s.push(ok(440))).toBeNull()
    expect(s.push(ok(440))).toBeNull()
    expect(s.push(ok(440))).not.toBeNull()
  })

  it('median ignores outliers once window is full', () => {
    const s = new PitchSmoother({ windowSize: 5 })
    s.push(ok(440))
    s.push(ok(440))
    s.push(ok(440))
    s.push(ok(440))
    const out = s.push(ok(880)) // spike
    expect(out).toBe(440)
  })

  it('reset clears the window', () => {
    const s = new PitchSmoother()
    s.push(ok(440))
    s.push(ok(440))
    s.push(ok(440))
    s.reset()
    expect(s.push(ok(440))).toBeNull()
  })
})
