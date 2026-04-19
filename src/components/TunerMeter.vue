<script setup lang="ts">
import type { TuningAccuracy } from '../lib/cents'

interface Props {
  rotation: number
  accuracy: TuningAccuracy
}

defineProps<Props>()
</script>

<template>
  <div class="meter" role="img" aria-label="Indicador de afinação">
    <div class="meter-dot"></div>
    <div
      class="meter-pointer transition-all duration-500 ease-out"
      :class="
        accuracy === 'perfect'
          ? 'bg-green-500 dark:bg-green-400'
          : accuracy === 'close'
            ? 'bg-yellow-500 dark:bg-yellow-400'
            : 'bg-red-500 dark:bg-red-400'
      "
      :style="{ transform: `rotate(${rotation}deg)` }"
    ></div>
  </div>
</template>
