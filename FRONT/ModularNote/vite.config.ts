import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // En dev, /api est redirigé vers l'API locale (profil "http" de launchSettings.json)
      '/api': 'http://localhost:5035',
    },
  },
})
