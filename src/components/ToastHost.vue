<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    role="status"
    aria-live="polite"
  >
    <transition-group name="toast" tag="div" class="flex flex-col items-center gap-2">
      <button
        v-for="toast in toasts"
        :key="toast.id"
        type="button"
        class="pointer-events-auto rounded-full px-4 py-2 text-sm shadow-lg backdrop-blur-sm transition-colors"
        :class="{
          'bg-emerald-500/90 text-white': toast.tone === 'success',
          'bg-red-500/90 text-white': toast.tone === 'error',
          'bg-zinc-900/85 text-zinc-100 dark:bg-zinc-800/90': toast.tone === 'info',
        }"
        @click="dismiss(toast.id)"
      >
        {{ toast.message }}
      </button>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
