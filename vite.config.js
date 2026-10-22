import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — збірка працює і в корені домену, і в підпапці (напр. GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { assetsInlineLimit: 2048 }
})
