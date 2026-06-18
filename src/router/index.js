import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },

  // ── 하단 탭 5개 ──
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { requiresAuth: true, tab: 'home' } },
  { path: '/log', name: 'log', component: () => import('@/views/LogView.vue'), meta: { requiresAuth: true, tab: 'log' } },
  { path: '/diet', name: 'diet', component: () => import('@/views/DietView.vue'), meta: { requiresAuth: true, tab: 'diet' } },
  { path: '/body', name: 'body', component: () => import('@/views/BodyView.vue'), meta: { requiresAuth: true, tab: 'body' } },
  { path: '/more', name: 'more', component: () => import('@/views/MoreView.vue'), meta: { requiresAuth: true, tab: 'more' } },

  // ── 더보기 허브 하위 (탭바에선 더보기 활성 유지) ──
  { path: '/attendance', name: 'attendance', component: () => import('@/views/AttendanceView.vue'), meta: { requiresAuth: true, tab: 'more' } },
  { path: '/guide', name: 'guide', component: () => import('@/views/GuideView.vue'), meta: { requiresAuth: true, tab: 'more' } },
  { path: '/guide/:id', name: 'guide-detail', component: () => import('@/views/GuideDetailView.vue'), meta: { requiresAuth: true, tab: 'more' } },
  { path: '/recommend', name: 'recommend', component: () => import('@/views/RecommendView.vue'), meta: { requiresAuth: true, tab: 'home' } },

  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.ensureReady()
  if (to.meta.requiresAuth && !authStore.isAuthed) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && authStore.isAuthed) {
    return { path: '/' }
  }
})

export default router
