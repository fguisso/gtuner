import { describe, expect, it } from 'vitest'
import { centsToMeterRotation, classifyCents } from './cents'

describe('classifyCents', () => {
  it('returns perfect for <= 5 cents', () => {
    expect(classifyCents(0)).toBe('perfect')
    expect(classifyCents(5)).toBe('perfect')
    expect(classifyCents(-5)).toBe('perfect')
  })

  it('returns close between 5 and 20 cents', () => {
    expect(classifyCents(10)).toBe('close')
    expect(classifyCents(-15)).toBe('close')
  })

  it('returns far above 20 cents', () => {
    expect(classifyCents(25)).toBe('far')
    expect(classifyCents(-40)).toBe('far')
  })
})

describe('centsToMeterRotation', () => {
  it('clamps at +/- 50 cents', () => {
    expect(centsToMeterRotation(50)).toBe(45)
    expect(centsToMeterRotation(-50)).toBe(-45)
    expect(centsToMeterRotation(200)).toBe(45)
  })

  it('is 0 at center', () => {
    expect(centsToMeterRotation(0)).toBe(0)
  })
})
