import { onMounted, onUnmounted, ref } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'gtuner:install-dismissed'

export function usePwaInstall() {
  const deferredEvent = ref<BeforeInstallPromptEvent | null>(null)
  const canInstall = ref(false)
  const installed = ref(false)
  const isStandalone = ref(false)

  const wasDismissed = () => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === '1'
    } catch {
      return false
    }
  }

  const dismiss = () => {
    canInstall.value = false
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      /* storage unavailable — keep it dismissed for this session only */
    }
  }

  const onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault()
    deferredEvent.value = event as BeforeInstallPromptEvent
    if (!wasDismissed()) canInstall.value = true
  }

  const onAppInstalled = () => {
    installed.value = true
    canInstall.value = false
    deferredEvent.value = null
  }

  const checkStandalone = () => {
    const mql = window.matchMedia?.('(display-mode: standalone)')
    const nav = window.navigator as Navigator & { standalone?: boolean }
    isStandalone.value = Boolean(mql?.matches || nav.standalone)
  }

  const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const ev = deferredEvent.value
    if (!ev) return 'unavailable'
    await ev.prompt()
    const choice = await ev.userChoice
    deferredEvent.value = null
    canInstall.value = false
    return choice.outcome
  }

  onMounted(() => {
    checkStandalone()
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  return { canInstall, installed, isStandalone, promptInstall, dismiss }
}
