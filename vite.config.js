import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// GitHub Pages 프로젝트 사이트 경로 = 레포명(GYM-LOG)과 대소문자까지 일치해야 한다.
export default defineConfig({
  base: '/GYM-LOG/',
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase-vendor'
            if (
              id.includes('/vue/') ||
              id.includes('/vue-router/') ||
              id.includes('/pinia/')
            ) return 'vue-vendor'
          }
        }
      }
    }
  }
})
