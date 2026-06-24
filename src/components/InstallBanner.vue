<script setup lang="ts">
import { usePwaInstall } from '../composables/usePwaInstall'
import { useToast } from '../composables/useToast'

const { canInstall, isStandalone, promptInstall, dismiss } = usePwaInstall()
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
      <span class="install-banner__text">
        Instale o gtuner para tocar offline e com acesso rápido.
      </span>
      <div class="install-banner__actions">
        <button
          type="button"
          class="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          @click="install"
        >
          Instalar
        </button>
        <button
          type="button"
          class="install-banner__close"
          aria-label="Dispensar"
          @click="dismiss"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.install-banner {
  @apply pointer-events-auto fixed left-1/2 z-40 flex w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl bg-zinc-900/95 px-4 py-3 text-zinc-100 shadow-xl backdrop-blur dark:bg-zinc-800/95;
  /* Sits just below the instrument picker row, clear of the navbar and gauge. */
  top: calc(6rem + env(safe-area-inset-top));
}
.install-banner__text {
  @apply flex-1 text-sm leading-snug;
}
.install-banner__actions {
  @apply flex shrink-0 items-center gap-1;
}
.install-banner__close {
  @apply flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10 hover:text-white;
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
