// GYM LOG 메인 Service Worker — 정적 자산 캐싱 + 오프라인 fallback.
// 새 배포 시 CACHE 버전을 올려 자동 활성화.
const CACHE = 'gymlog-v1'
const BASE = '/GYM-LOG/'
const PRECACHE = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'icons/icon.svg',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

// 전략:
//  - 외부 API(Firebase/Google): 네트워크 우선
//  - HTML navigation (SPA 진입): 네트워크 우선 (새 빌드 chunk hash 404 → 먹통 방지)
//  - 그 외 정적 자산: 캐시 우선 + 백그라운드 갱신
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  const isExternalApi = /(firebaseio|firebasestorage|googleapis|gstatic)/.test(url.hostname)
  if (isExternalApi) {
    event.respondWith(fetch(req).catch(() => caches.match(req)))
    return
  }

  const isHtml =
    req.mode === 'navigate' ||
    req.destination === 'document' ||
    (req.headers.get('accept') || '').includes('text/html')
  if (isHtml) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {})
          }
          return res
        })
        .catch(() => caches.match(req).then((c) => c || caches.match(BASE + 'index.html') || caches.match(BASE)))
    )
    return
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(req, clone))
          }
          return res
        })
        .catch(() => cached)
      return cached || fetchPromise
    })
  )
})
