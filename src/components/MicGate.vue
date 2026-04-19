<script setup lang="ts">
import type { TunerState } from '../audio/engine'

interface Props {
  state: TunerState
  error: Error | null
}

defineProps<Props>()
defineEmits<{ start: [] }>()
</script>

<template>
  <div class="mic-gate">
    <div class="mx-auto flex max-w-md flex-col items-center gap-4 px-6 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
      </svg>

      <h1 class="text-2xl font-semibold">gtuner</h1>

      <p v-if="state === 'idle'" class="text-zinc-600 dark:text-zinc-300">
        Este afinador usa o microfone do seu dispositivo. Toque abaixo para começar.
      </p>

      <p v-else-if="state === 'requesting'" class="text-zinc-600 dark:text-zinc-300">
        Aguardando permissão do microfone…
      </p>

      <p v-else-if="state === 'denied'" class="text-red-500 dark:text-red-400">
        Permissão do microfone negada. Habilite nas configurações do navegador e tente novamente.
      </p>

      <p v-else-if="state === 'error'" class="text-red-500 dark:text-red-400">
        Não foi possível iniciar o áudio. {{ error?.message }}
      </p>

      <button
        v-if="state !== 'requesting'"
        type="button"
        class="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
        @click="$emit('start')"
      >
        {{ state === 'idle' ? 'Ativar microfone' : 'Tentar novamente' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.mic-gate {
  @apply flex min-h-[70vh] items-center justify-center;
}
</style>
