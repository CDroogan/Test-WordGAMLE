import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      // autoUpdate: a new deploy takes effect on next page load without
      // anyone needing to uninstall/reinstall - see onNeedRefresh in
      // main.jsx, which forces that reload instead of leaving a stale
      // version cached until the person happens to fully close the tab.
      registerType: 'autoUpdate',
      workbox: {
        // Activate a new service worker (and hand it control of open
        // pages) immediately rather than waiting for every tab to close -
        // paired with onNeedRefresh's reload, this is what keeps a deploy
        // from silently going stale on someone's device.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // The app's main JS bundle is already over workbox's 2 MiB default
        // precache limit (a pre-existing bundle-size issue, not something
        // introduced here) - raised so precaching doesn't just skip it.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // No runtimeCaching rules on purpose: only this build's own static
        // assets (JS/CSS/images) are precached. API calls to the PHP
        // backend are never intercepted or cached by the service worker,
        // so game data/leaderboards can't go stale the way the site
        // itself briefly did during testing.
      },
      manifest: {
        name: 'WordGAMLE',
        short_name: 'WordGAMLE',
        description: 'Track and compare daily word game results with your group.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#330072',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    hmr: {
      overlay: false
    }
  }
})
