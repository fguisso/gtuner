<script setup lang="ts">
import { usePwaInstall } from '../composables/usePwaInstall'
import { useToast } from '../composables/useToast'

const { canInstall, isStandalone, promptInstall } = usePwaInstall()
const toast = useToast()

async function install() {
  const outcome = await promptInstall()
  if (outcome === 'accepted') toast.success('App instalado')
  else if (outcome === 'unavailable') toast.info('Instalação indisponível neste navegador')
}
</script>

<template>
  <transition name="slide">
    <div v-if="canInstall && !isStandalone" class="install-banner" role="dialog" aria-live="polite">
      <span class="text-sm">Instale o gtuner para tocar offline e com acesso rápido.</span>
      <button
        type="button"
        class="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white hover:opacity-90"
        @click="install"
      >
        Instalar
      </button>
    </div>
  </transition>
</template>

<style scoped>
.install-banner {
  @apply pointer-events-auto fixed left-1/2 top-20 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-zinc-900/90 px-4 py-2 text-zinc-100 shadow-lg backdrop-blur dark:bg-zinc-800/90;
}
.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
