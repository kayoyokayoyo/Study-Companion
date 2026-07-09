/**
 * Configuration Vite pour le build de PRODUCTION (PythonAnywhere / hébergement externe).
 * Usage : pnpm --filter @workspace/quiznet run build:prod
 *
 * Différences avec vite.config.ts (dev Replit) :
 *   - base = '/' (pas de sous-chemin Replit)
 *   - Pas de PORT / BASE_PATH requis
 *   - Pas de plugins Replit (cartographer, banner, error-modal)
 *   - Sortie dans artifacts/quiznet/dist/
 */
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(import.meta.dirname, '..', '..', 'attached_assets'),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover'],
        },
      },
    },
  },
})
