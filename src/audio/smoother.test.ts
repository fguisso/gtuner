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

  it('eases toward small drifts instead of jumping', () => {
    const s = new PitchSmoother({ windowSize: 3, emaAlpha: 0.25 })
    s.push(ok(440))
    s.push(ok(440))
    expect(s.push(ok(440))).toBe(440) // settled
    s.push(ok(446)) // median still 440 here
    const out = s.push(ok(446)) as number // median now 446; EWMA glides toward it
    expect(out).toBeGreaterThan(440)
    expect(out).toBeLessThan(446)
  })

  it('snaps immediately on a large pitch change (string switch)', () => {
    const s = new PitchSmoother({ windowSize: 3, jumpCents: 45 })
    s.push(ok(82)) // low E
    s.push(ok(82))
    s.push(ok(82))
    s.push(ok(110)) // median still 82
    const out = s.push(ok(110)) as number // median flips to 110, jump → snap
    expect(out).toBeCloseTo(110, 0)
  })
})
