import type { Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const PWA_REGISTER_ID = 'virtual:pwa-register'
const RESOLVED_PWA_REGISTER_ID = `\0${PWA_REGISTER_ID}`

export function openPencilPwaRegisterStubPlugin(): Plugin {
  return {
    name: 'open-pencil:pwa-register-stub',
    resolveId(id) {
      if (id === PWA_REGISTER_ID) return RESOLVED_PWA_REGISTER_ID
    },
    load(id) {
      if (id === RESOLVED_PWA_REGISTER_ID) {
        return 'export function registerSW() { return () => {} }'
      }
    }
  }
}

export function openPencilPwaPlugin() {
  return VitePWA({
    registerType: 'autoUpdate',
    devOptions: { enabled: false },
    workbox: {
      maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
      globPatterns: ['**/*.{js,css,html,wasm,png,ico,ttf,webmanifest}'],
      navigateFallback: '/index.html'
    },
    manifest: {
      name: 'OpenPencil',
      short_name: 'OpenPencil',
      description: 'Open-source design editor',
      display: 'standalone',
      orientation: 'any',
      start_url: '/',
      scope: '/',
      theme_color: '#1e1e1e',
      background_color: '#1e1e1e',
      categories: ['design', 'productivity'],
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    }
  })
}
