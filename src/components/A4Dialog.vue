<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  current: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  apply: [value: number]
}>()

const dialog = ref<HTMLDialogElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const draft = ref<number>(props.current)

watch(
  () => props.modelValue,
  async (open) => {
    await nextTick()
    if (!dialog.value) return
    if (open) {
      draft.value = props.current
      dialog.value.showModal()
      await nextTick()
      input.value?.focus()
      input.value?.select()
    } else if (dialog.value.open) {
      dialog.value.close()
    }
  },
  { immediate: true },
)

function close() {
  emit('update:modelValue', false)
}

function onSubmit(e: Event) {
  e.preventDefault()
  if (!Number.isFinite(draft.value) || draft.value <= 0) return
  emit('apply', Math.round(draft.value))
  close()
}
</script>

<template>
  <dialog
    ref="dialog"
    class="rounded-xl bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-black/50 dark:bg-dark-surface dark:text-dark-text"
    @close="close"
  >
    <form class="flex flex-col gap-4 p-6" @submit="onSubmit">
      <div>
        <h2 class="text-lg font-semibold">Referência de afinação</h2>
        <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Frequência do Lá central (A<sub>4</sub>) em Hz.
        </p>
      </div>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-zinc-600 dark:text-zinc-400">Frequência (Hz)</span>
        <input
          ref="input"
          v-model.number="draft"
          type="number"
          min="380"
          max="480"
          step="1"
          class="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-base outline-none focus:border-primary dark:border-zinc-700"
        />
      </label>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          @click="close"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Aplicar
        </button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
dialog[open] {
  animation: pop 120ms ease-out;
}
@keyframes pop {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
