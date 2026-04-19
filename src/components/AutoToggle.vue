<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useSettings } from '../stores/settings'

const settings = useSettings()
const { autoMode } = storeToRefs(settings)
</script>

<template>
  <div class="auto-toggle-wrapper">
    <div class="auto-toggle-label dark:text-dark-text text-gray-800">Detecção auto</div>
    <button
      type="button"
      class="auto-toggle-button mt-2"
      :class="{ active: autoMode }"
      :aria-checked="autoMode"
      role="switch"
      aria-label="Alternar detecção automática de nota"
      @click="settings.toggleAutoMode"
    >
      <div class="auto-toggle-track"></div>
      <div class="auto-toggle-thumb">
        <svg
          v-if="autoMode"
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </button>
  </div>
</template>
