<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { FrequencyBars as Renderer } from '../utils/frequency-bars'

interface Props {
  analyser: AnalyserNode | null
}

const props = defineProps<Props>()
const canvas = ref<HTMLCanvasElement | null>(null)
let renderer: Renderer | null = null
let raf = 0
let data: Uint8Array<ArrayBuffer> | null = null

function loop() {
  if (props.analyser && renderer && data) {
    props.analyser.getByteFrequencyData(data)
    renderer.update(data)
  }
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  if (!canvas.value) return
  renderer = new Renderer(canvas.value)
  loop()
})

watch(
  () => props.analyser,
  (a) => {
    if (!a) {
      data = null
      return
    }
    data = new Uint8Array(new ArrayBuffer(a.frequencyBinCount))
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
})
</script>

<template>
  <canvas ref="canvas" class="frequency-bars" aria-hidden="true"></canvas>
</template>
