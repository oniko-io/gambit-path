import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from /gambit-path/
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      // the engine must be precached for offline games
      workbox: { globPatterns: ['**/*.{js,css,html,wasm,svg,png}'] },
      manifest: {
        name: 'Gambit Path',
        short_name: 'Gambit Path',
        description: 'A personal chess journey from zero to strong.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#16181d',
        theme_color: '#16181d',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
