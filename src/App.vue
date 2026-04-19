<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettings } from './stores/settings'
import { useTuner } from './composables/useTuner'
import { useTheme } from './composables/useTheme'
import { useToast } from './composables/useToast'
import NavBar from './components/NavBar.vue'
import FrequencyBars from './components/FrequencyBars.vue'
import TunerMeter from './components/TunerMeter.vue'
import NoteDisplay from './components/NoteDisplay.vue'
import StringSelector from './components/StringSelector.vue'
import InstrumentPicker from './components/InstrumentPicker.vue'
import MicGate from './components/MicGate.vue'
import InstallBanner from './components/InstallBanner.vue'
import AppFooter from './components/AppFooter.vue'
import ToastHost from './components/ToastHost.vue'

useTheme() // sync <html>.dark with settings

const settings = useSettings()
const { autoMode, tuning } = storeToRefs(settings)

const tuner = useTuner()
const toast = useToast()

const ready = computed(() => tuner.state === 'granted')
const analyser = computed(() => tuner.getAnalyser() ?? null)

async function onStart() {
  await tuner.start()
  if (tuner.state === 'denied') toast.error('Permissão do microfone negada')
}

watch(
  () => settings.tuningId,
  () => {
    const first = tuning.value.strings[0]
    if (first) tuner.selectString(first.value)
  },
)

onMounted(() => {
  // nothing — waits for user gesture to start audio
})
</script>

<template>
  <div class="app-container h-full bg-white transition-colors duration-300 dark:bg-dark-background">
    <NavBar />

    <template v-if="!ready">
      <MicGate :state="tuner.state" :error="tuner.lastError" @start="onStart" />
    </template>

    <template v-else>
      <FrequencyBars :analyser="analyser" />

      <TunerMeter :rotation="tuner.meterRotation" :accuracy="tuner.accuracy" />

      <div class="mt-3 flex justify-center">
        <InstrumentPicker />
      </div>

      <NoteDisplay
        :frequency="tuner.currentFrequency"
        :string="tuner.selectedString"
        :accuracy="tuner.accuracy"
        :show-status="!autoMode"
      />

      <StringSelector
        :selected-value="tuner.selectedString?.value ?? null"
        @select="tuner.selectString"
      />
    </template>

    <AppFooter />
    <InstallBanner />
    <ToastHost />
  </div>
</template>
