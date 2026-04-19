export type TuningAccuracy = 'perfect' | 'close' | 'far'

export interface AccuracyThresholds {
  perfect: number
  close: number
}

const DEFAULT_THRESHOLDS: AccuracyThresholds = {
  perfect: 5,
  close: 20,
}

export function classifyCents(
  cents: number,
  thresholds: AccuracyThresholds = DEFAULT_THRESHOLDS,
): TuningAccuracy {
  const diff = Math.abs(cents)
  if (diff <= thresholds.perfect) return 'perfect'
  if (diff <= thresholds.close) return 'close'
  return 'far'
}

/** Map a cents deviation to a meter pointer rotation (degrees). Clamped. */
export function centsToMeterRotation(cents: number, maxDegrees = 45): number {
  const clamped = Math.max(-50, Math.min(50, cents))
  return (clamped / 50) * maxDegrees
}
