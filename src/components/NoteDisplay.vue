<script setup lang="ts">
import type { TuningAccuracy } from '../lib/cents'
import type { InstrumentString } from '../lib/instruments'

interface Props {
  frequency: number
  string: InstrumentString | null
  accuracy: TuningAccuracy
  showStatus: boolean
}

defineProps<Props>()
</script>

<template>
  <div>
    <div v-if="showStatus" :class="['tuning-indicator', accuracy]">
      {{
        accuracy === 'perfect'
          ? 'Perfeito!'
          : accuracy === 'close'
            ? 'Quase lá…'
            : 'Continue afinando…'
      }}
    </div>

    <div class="frequency-display">
      <div class="frequency">{{ frequency.toFixed(1) }}<span>Hz</span></div>
      <div class="current-note">
        <template v-if="string">{{ string.name }}{{ string.octave }}</template>
        <template v-else>—</template>
      </div>
    </div>
  </div>
</template>
