import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        navigateFallbackDenylist: [/^\/pdfs/]
      },
      manifest: {
        name: 'Mediación y Estrategias Docentes',
        short_name: 'Guía Mediada',
        description: 'Entorno Digital de Aprendizaje DUA',
        theme_color: '#560C0C',
        background_color: '#f7f7f9',
        display: 'standalone',
        icons: [
          {
            src: 'https://benune.github.io/home/images/LogoBENUNE_WhiteCircleBG.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://benune.github.io/home/images/LogoBENUNE_WhiteCircleBG.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
