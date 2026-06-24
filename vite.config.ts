import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE ?? '/gtuner/'

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null, // we register manually from main.ts to control prompt UX
        includeAssets: [
          'icons/icon.svg',
          'icons/favicon-32.png',
          'icons/apple-touch-icon.png',
        ],
        manifest: {
          id: `${base}?source=pwa`,
          name: 'gtuner — afinador de violão e ukulele',
          short_name: 'gtuner',
          description: 'Afinador web para violão e ukulele com detecção em tempo real.',
          lang: 'pt-BR',
          theme_color: '#0f1115',
          background_color: '#0f1115',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          categories: ['music', 'utilities'],
          icons: [
            {
              src: 'icons/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
        },
        devOptions: {
          enabled: false, // keep dev server clean; test PWA via `npm run build && preview`
        },
      }),
    ],
    base,
    preview: {
      // Allow tunnelled hosts (e.g. ngrok) to reach the preview server.
      allowedHosts: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'es2022',
    },
  }
})
