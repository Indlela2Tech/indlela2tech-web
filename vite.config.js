import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'I2T.png'],
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Indlela2Tech',
        short_name: 'Indlela2Tech',
        description: 'Your Guide to Tech Tertiary Education',
        theme_color: '#FFEE00',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'I2T.png',
            sizes: '500x500',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ooilodkfdddnwhhdrhik\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-data-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})