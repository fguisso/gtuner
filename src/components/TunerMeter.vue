<script setup lang="ts">
import { computed } from 'vue'
import type { TuningAccuracy } from '../lib/cents'

interface Props {
  rotation: number
  accuracy: TuningAccuracy
  cents: number
  active: boolean
}

const props = defineProps<Props>()

// Tick marks every 9° across the ±45° sweep; the center and edges are "major".
const ticks = [-45, -36, -27, -18, -9, 0, 9, 18, 27, 36, 45]
const isMajor = (deg: number) => deg === 0 || Math.abs(deg) === 45

const centsLabel = computed(() => {
  if (!props.active) return '–'
  const rounded = Math.round(props.cents)
  return rounded > 0 ? `+${rounded}` : `${rounded}`
})

const pointerColor = computed(() =>
  props.accuracy === 'perfect'
    ? 'bg-green-500 dark:bg-green-400'
    : props.accuracy === 'close'
      ? 'bg-yellow-500 dark:bg-yellow-400'
      : 'bg-primary',
)

const centsColor = computed(() =>
  !props.active
    ? 'text-gray-400 dark:text-gray-600'
    : props.accuracy === 'perfect'
      ? 'text-green-500 dark:text-green-400'
      : props.accuracy === 'close'
        ? 'text-yellow-500 dark:text-yellow-400'
        : 'text-primary',
)
</script>

<template>
  <div class="meter" role="img" aria-label="Indicador de afinação">
    <!-- tick scale -->
    <div
      v-for="deg in ticks"
      :key="deg"
      class="meter-tick"
      :class="[
        isMajor(deg) ? 'meter-tick-major' : 'meter-tick-minor',
        deg === 0 ? 'meter-tick-center' : '',
      ]"
      :style="{ transform: `rotate(${deg}deg)` }"
    ></div>

    <!-- cents readout -->
    <div class="meter-cents" :class="centsColor">
      {{ centsLabel }}<span v-if="active" class="meter-cents-unit">¢</span>
    </div>

    <!-- needle -->
    <div class="meter-dot" :class="active ? pointerColor : ''"></div>
    <div
      class="meter-pointer"
      :class="[pointerColor, active ? 'opacity-100' : 'opacity-40']"
      :style="{ transform: `rotate(${rotation}deg)` }"
    ></div>
  </div>
</template>
