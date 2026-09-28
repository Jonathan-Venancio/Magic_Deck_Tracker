import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['logo.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-512x512-maskable.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Magic Deck Tracker',
        short_name: 'Deck Tracker',
        description: 'Consulte traduções das suas cartas físicas de Magic durante a partida.',
        theme_color: '#0c0b09',
        background_color: '#0c0b09',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        categories: ['games', 'utilities'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Jogar',
            short_name: 'Jogar',
            url: '/jogar',
            description: 'Escolher um deck e iniciar uma partida',
          },
          {
            name: 'Coleção',
            short_name: 'Coleção',
            url: '/colecao',
            description: 'Buscar uma carta pelo número',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2,webmanifest}', 'pwa-*.png', 'apple-touch-icon.png'],
        globIgnores: ['**/logo.png', '**/logo.ico'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
