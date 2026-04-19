import { computed, onBeforeUnmount, reactive, ref, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { TunerEngine, type TunerState } from '../audio/engine'
import { centsToMeterRotation, classifyCents, type TuningAccuracy } from '../lib/cents'
import { closestString, stringFrequency } from '../lib/instruments'
import { getCents } from '../utils/notes'
import { useSettings } from '../stores/settings'

export interface TunerDetection {
  frequency: number
  clarity: number
}

export function useTuner() {
  const settings = useSettings()
  const { a4, tuning, autoMode } = storeToRefs(settings)

  const engine = shallowRef(new TunerEngine())
  const state = ref<TunerState>('idle')
  const lastError = ref<Error | null>(null)

  const detection = ref<TunerDetection | null>(null)
  const selectedStringValue = ref<number | null>(null)

  engine.value.onStateChange((next, err) => {
    state.value = next
    if (err) lastError.value = err
  })

  engine.value.onPitchEvent(({ frequency, clarity }) => {
    detection.value = { frequency, clarity }
    if (autoMode.value) {
      const closest = closestString(tuning.value, frequency, a4.value)
      selectedStringValue.value = closest.value
    }
  })

  const selectedString = computed(() => {
    if (selectedStringValue.value == null) return null
    return (
      tuning.value.strings.find((s) => s.value === selectedStringValue.value) ??
      tuning.value.strings[0]
    )
  })

  const targetFrequency = computed(() => {
    const s = selectedString.value
    return s ? stringFrequency(s, a4.value) : a4.value
  })

  const centsOffset = computed(() => {
    if (!detection.value) return 0
    return getCents(detection.value.frequency, targetFrequency.value)
  })

  const accuracy = computed<TuningAccuracy>(() =>
    detection.value ? classifyCents(centsOffset.value) : 'far',
  )

  const meterRotation = computed(() =>
    detection.value ? centsToMeterRotation(centsOffset.value) : 0,
  )

  const currentFrequency = computed(() => detection.value?.frequency ?? targetFrequency.value)

  const selectString = (midiValue: number) => {
    selectedStringValue.value = midiValue
    settings.autoMode = false
  }

  async function start() {
    try {
      await engine.value.start()
      const firstString = tuning.value.strings[0]
      selectedStringValue.value = firstString.value
    } catch {
      // state + lastError already set by engine listener
    }
  }

  async function stop() {
    await engine.value.stop()
    detection.value = null
  }

  onBeforeUnmount(() => {
    void engine.value.stop()
  })

  return reactive({
    state,
    lastError,
    detection,
    currentFrequency,
    centsOffset,
    accuracy,
    meterRotation,
    selectedString,
    selectString,
    start,
    stop,
    getAnalyser: () => engine.value.analyser,
  })
}
