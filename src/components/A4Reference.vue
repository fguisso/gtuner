<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettings } from '../stores/settings'
import { useToast } from '../composables/useToast'
import A4Dialog from './A4Dialog.vue'

const settings = useSettings()
const { a4 } = storeToRefs(settings)
const toast = useToast()
const open = ref(false)

function apply(value: number) {
  if (value === a4.value) return
  a4.value = value
  toast.success(`A₄ ajustado para ${value} Hz`)
}
</script>

<template>
  <button type="button" class="a4-reference" @click="open = true">
    A<sub>4</sub> = <span>{{ a4 }}</span> Hz
  </button>
  <A4Dialog v-model="open" :current="a4" @apply="apply" />
</template>
