import { onBeforeUnmount, ref } from 'vue'

/**
 * Plays a steady sine tone at a given frequency. A short fade-in/out
 * avoids audible clicks. Only one tone plays at a time.
 */
export function useReferenceTone() {
  const isPlaying = ref(false)
  let ctx: AudioContext | null = null
  let oscillator: OscillatorNode | null = null
  let gain: GainNode | null = null
  let currentFreq = 0

  const FADE = 0.04

  const ensureContext = () => {
    if (!ctx) {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctx()
    }
    return ctx
  }

  const stopInternal = () => {
    if (!ctx || !oscillator || !gain) return
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + FADE)
    oscillator.stop(now + FADE + 0.01)
    oscillator = null
    gain = null
    isPlaying.value = false
    currentFreq = 0
  }

  const play = async (frequency: number) => {
    if (!Number.isFinite(frequency) || frequency <= 0) return
    const audio = ensureContext()
    if (audio.state === 'suspended') await audio.resume()
    if (isPlaying.value) {
      if (currentFreq === frequency) {
        stopInternal()
        return
      }
      stopInternal()
    }
    const osc = audio.createOscillator()
    const g = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    g.gain.value = 0
    osc.connect(g)
    g.connect(audio.destination)
    osc.start()
    const now = audio.currentTime
    g.gain.linearRampToValueAtTime(0.18, now + FADE)
    oscillator = osc
    gain = g
    currentFreq = frequency
    isPlaying.value = true
  }

  const stop = () => stopInternal()

  onBeforeUnmount(() => {
    stopInternal()
    void ctx?.close()
    ctx = null
  })

  return { play, stop, isPlaying }
}
