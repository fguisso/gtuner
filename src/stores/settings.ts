import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { INSTRUMENT_TUNINGS, getTuningById, type InstrumentTuning } from '../lib/instruments'

const STORAGE_KEY = 'gtuner.settings.v1'

type Theme = 'light' | 'dark'

interface PersistedSettings {
  a4: number
  theme: Theme
  tuningId: string
  autoMode: boolean
}

function readPersisted(): Partial<PersistedSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return legacyMigration()
    return JSON.parse(raw) as Partial<PersistedSettings>
  } catch {
    return {}
  }
}

// Migrate from v1 keys written by the old App.vue.
function legacyMigration(): Partial<PersistedSettings> {
  const out: Partial<PersistedSettings> = {}
  const a4 = Number(localStorage.getItem('a4'))
  if (Number.isFinite(a4) && a4 > 0) out.a4 = a4
  const theme = localStorage.getItem('theme')
  if (theme === 'light' || theme === 'dark') out.theme = theme
  return out
}

export const useSettings = defineStore('settings', () => {
  const initial = readPersisted()

  const a4 = ref<number>(initial.a4 ?? 440)
  const theme = ref<Theme>(initial.theme ?? 'dark')
  const tuningId = ref<string>(initial.tuningId ?? 'guitar-standard')
  const autoMode = ref<boolean>(initial.autoMode ?? true)

  const tuning = computed<InstrumentTuning>(
    () => getTuningById(tuningId.value) ?? INSTRUMENT_TUNINGS[0],
  )

  const setTuning = (id: string) => {
    if (getTuningById(id)) tuningId.value = id
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const toggleAutoMode = () => {
    autoMode.value = !autoMode.value
  }

  const persist = () => {
    const payload: PersistedSettings = {
      a4: a4.value,
      theme: theme.value,
      tuningId: tuningId.value,
      autoMode: autoMode.value,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // storage may be unavailable (private mode, quota) — ignore
    }
  }

  watch([a4, theme, tuningId, autoMode], persist, { flush: 'post' })

  return {
    a4,
    theme,
    tuningId,
    autoMode,
    tuning,
    setTuning,
    toggleTheme,
    toggleAutoMode,
  }
})
