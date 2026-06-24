<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettings } from '../stores/settings'
import { useReferenceTone } from '../composables/useReferenceTone'
import { stringFrequency, type InstrumentString } from '../lib/instruments'

interface Props {
  selectedValue: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ select: [value: number] }>()

const settings = useSettings()
const { a4, tuning } = storeToRefs(settings)
const { play, isPlaying } = useReferenceTone()

function onClick(str: InstrumentString) {
  emit('select', str.value)
}

function onPlay(str: InstrumentString, ev: Event) {
  ev.stopPropagation()
  play(stringFrequency(str, a4.value))
}

function freq(str: InstrumentString): number {
  return stringFrequency(str, a4.value)
}

function isSelected(str: InstrumentString): boolean {
  return props.selectedValue === str.value
}
</script>

<template>
  <div
    class="note-buttons fixed bottom-2 left-1/2 flex w-full max-w-xl -translate-x-1/2 transform justify-center gap-1 px-2"
  >
    <div
      v-for="str in tuning.strings"
      :key="str.value"
      class="flex min-w-0 flex-1 flex-col items-stretch gap-1"
    >
      <button
        type="button"
        class="note-button w-full rounded-lg px-1 py-1"
        :class="
          isSelected(str)
            ? 'bg-primary text-white shadow-md ring-2 ring-primary/40 ring-offset-1 ring-offset-white dark:ring-offset-dark-background'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-dark-surface dark:text-dark-text dark:hover:bg-gray-700'
        "
        :aria-pressed="isSelected(str)"
        @click="onClick(str)"
      >
        <div class="text-sm font-semibold leading-tight">{{ str.name }}{{ str.octave }}</div>
        <div
          class="whitespace-nowrap text-[10px] leading-tight sm:text-xs"
          :class="isSelected(str) ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'"
        >
          {{ freq(str).toFixed(1) }} Hz
        </div>
      </button>
      <button
        type="button"
        class="w-full rounded-md bg-gray-100 py-0.5 text-xs text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700"
        :aria-label="`Tocar nota ${str.name}${str.octave}`"
        :aria-pressed="isPlaying"
        @click="(ev) => onPlay(str, ev)"
      >
        ♪
      </button>
    </div>
  </div>
</template>
