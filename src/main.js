import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import { pushToast } from './composables/useToast'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// theme store 초기화 — html.dark 클래스 적용
useThemeStore()

app.mount('#app')

// Service Worker 등록 (정적 자산 캐싱 + 오프라인)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js', { scope: import.meta.env.BASE_URL })
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing
          if (!sw) return
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              pushToast('🆕 새 버전 준비 완료 — 곧 새로고침됩니다.', 'info', 6000)
            }
          })
        })
      })
      .catch((e) => console.warn('SW 등록 실패', e))

    // SW controller 교체 시 1회 자동 reload (캐시 stale chunk 즉시 해소)
    let reloaded = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    })
  })
}
