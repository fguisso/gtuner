import { reactive } from 'vue'

export type ToastTone = 'info' | 'success' | 'error'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

const state = reactive<{ toasts: Toast[] }>({ toasts: [] })
let nextId = 1

export function useToast() {
  function show(message: string, tone: ToastTone = 'info', durationMs = 2500) {
    const id = nextId++
    state.toasts.push({ id, message, tone })
    window.setTimeout(() => dismiss(id), durationMs)
  }

  function dismiss(id: number) {
    const idx = state.toasts.findIndex((t) => t.id === id)
    if (idx !== -1) state.toasts.splice(idx, 1)
  }

  return {
    toasts: state.toasts,
    show,
    info: (m: string, d?: number) => show(m, 'info', d),
    success: (m: string, d?: number) => show(m, 'success', d),
    error: (m: string, d?: number) => show(m, 'error', d),
    dismiss,
  }
}
