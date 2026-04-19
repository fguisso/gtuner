import { watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettings } from '../stores/settings'

/**
 * Keeps the `dark` class on <html> in sync with the settings store.
 * Returns reactive refs for components that need them.
 */
export function useTheme() {
  const settings = useSettings()
  const { theme } = storeToRefs(settings)

  watchEffect(() => {
    const root = document.documentElement
    if (theme.value === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  })

  return {
    theme,
    isDark: () => theme.value === 'dark',
    toggle: settings.toggleTheme,
  }
}
