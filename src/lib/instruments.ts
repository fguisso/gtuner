import { getFrequencyFromNoteValue, type NoteName, noteStrings } from '../utils/notes'

export type InstrumentId = 'guitar' | 'ukulele'

export interface InstrumentString {
  /** Short label shown on the UI button (e.g. "6E" or "A"). */
  label: string
  name: NoteName
  /** Scientific pitch notation octave (A4 = 69). */
  octave: number
  /** MIDI note number. */
  value: number
}

export interface InstrumentTuning {
  id: string
  instrument: InstrumentId
  /** Human-readable tuning name (e.g., "Padrão", "Drop D"). */
  name: string
  /** Strings ordered low-pitch → high-pitch for auto-detect, regardless of re-entrant instruments. */
  strings: InstrumentString[]
}

function string(label: string, midi: number): InstrumentString {
  const name = noteStrings[midi % 12]
  const octave = Math.floor(midi / 12) - 1
  return { label, name, octave, value: midi }
}

const GUITAR_STANDARD: InstrumentString[] = [
  string('6E', 40), // E2
  string('5A', 45), // A2
  string('4D', 50), // D3
  string('3G', 55), // G3
  string('2B', 59), // B3
  string('1E', 64), // E4
]

const GUITAR_DROP_D: InstrumentString[] = [
  string('6D', 38), // D2
  string('5A', 45),
  string('4D', 50),
  string('3G', 55),
  string('2B', 59),
  string('1E', 64),
]

const GUITAR_DADGAD: InstrumentString[] = [
  string('6D', 38),
  string('5A', 45),
  string('4D', 50),
  string('3G', 55),
  string('2A', 57), // A3
  string('1D', 62), // D4
]

const UKULELE_STANDARD: InstrumentString[] = [
  // Re-entrant: high-G on top. Sorted by pitch ascending.
  string('3C', 60), // C4
  string('2E', 64), // E4
  string('4G', 67), // G4
  string('1A', 69), // A4
]

const UKULELE_LOW_G: InstrumentString[] = [
  string('4G', 55), // G3
  string('3C', 60),
  string('2E', 64),
  string('1A', 69),
]

export const INSTRUMENT_TUNINGS: InstrumentTuning[] = [
  { id: 'guitar-standard', instrument: 'guitar', name: 'Padrão', strings: GUITAR_STANDARD },
  { id: 'guitar-drop-d', instrument: 'guitar', name: 'Drop D', strings: GUITAR_DROP_D },
  { id: 'guitar-dadgad', instrument: 'guitar', name: 'DADGAD', strings: GUITAR_DADGAD },
  {
    id: 'ukulele-standard',
    instrument: 'ukulele',
    name: 'Padrão (GCEA)',
    strings: UKULELE_STANDARD,
  },
  { id: 'ukulele-low-g', instrument: 'ukulele', name: 'Low G', strings: UKULELE_LOW_G },
]

export function getTuningById(id: string): InstrumentTuning | undefined {
  return INSTRUMENT_TUNINGS.find((t) => t.id === id)
}

export function tuningsFor(instrument: InstrumentId): InstrumentTuning[] {
  return INSTRUMENT_TUNINGS.filter((t) => t.instrument === instrument)
}

export function stringFrequency(str: InstrumentString, a4: number): number {
  return getFrequencyFromNoteValue(str.value, a4)
}

/** Pick the closest string in the tuning to a detected frequency. */
export function closestString(
  tuning: InstrumentTuning,
  frequency: number,
  a4: number,
): InstrumentString {
  return tuning.strings.reduce((best, candidate) => {
    const bestDiff = Math.abs(Math.log2(stringFrequency(best, a4) / frequency))
    const candDiff = Math.abs(Math.log2(stringFrequency(candidate, a4) / frequency))
    return candDiff < bestDiff ? candidate : best
  })
}
