import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Домен для og:image і canonical. Якщо .env немає (напр. збірка на хостингу), беремо основний домен,
// інакше в HTML лишається необроблений %VITE_SITE_URL%
process.env.VITE_SITE_URL ||= 'https://yantarne.fm'

// base: './' — збірка працює і в корені домену, і в підпапці (напр. GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { assetsInlineLimit: 2048 }
})
