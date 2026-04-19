<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettings } from '../stores/settings'
import { INSTRUMENT_TUNINGS, tuningsFor, type InstrumentId } from '../lib/instruments'

const settings = useSettings()
const { tuningId, tuning } = storeToRefs(settings)

const instruments: { id: InstrumentId; label: string }[] = [
  { id: 'guitar', label: 'Violão' },
  { id: 'ukulele', label: 'Ukulele' },
]

const currentInstrument = computed<InstrumentId>(() => tuning.value.instrument)
const currentTunings = computed(() => tuningsFor(currentInstrument.value))

function switchInstrument(id: InstrumentId) {
  const next = INSTRUMENT_TUNINGS.find((t) => t.instrument === id)
  if (next) settings.setTuning(next.id)
}
</script>

<template>
  <div class="instrument-picker">
    <div class="flex gap-1 rounded-full bg-zinc-200/60 p-1 dark:bg-zinc-800/60">
      <button
        v-for="inst in instruments"
        :key="inst.id"
        type="button"
        class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
        :class="
          currentInstrument === inst.id
            ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white'
            : 'text-zinc-600 dark:text-zinc-300'
        "
        @click="switchInstrument(inst.id)"
      >
        {{ inst.label }}
      </button>
    </div>

    <select
      v-model="tuningId"
      class="rounded-full bg-zinc-200/60 px-3 py-1 text-xs font-medium text-zinc-700 outline-none dark:bg-zinc-800/60 dark:text-zinc-200"
      aria-label="Afinação"
    >
      <option v-for="t in currentTunings" :key="t.id" :value="t.id">{{ t.name }}</option>
    </select>
  </div>
</template>

<style scoped>
.instrument-picker {
  @apply flex flex-wrap items-center justify-center gap-2;
}
</style>
