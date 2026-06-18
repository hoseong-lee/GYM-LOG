import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true, tab: 'home' }
  },
  {
    path: '/log',
    name: 'log',
    component: () => import('@/views/LogView.vue'),
    meta: { requiresAuth: true, tab: 'log' }
  },
  {
    path: '/attendance',
    name: 'attendance',
    component: () => import('@/views/AttendanceView.vue'),
    meta: { requiresAuth: true, tab: 'attendance' }
  },
  {
    path: '/guide',
    name: 'guide',
    component: () => import('@/views/GuideView.vue'),
    meta: { requiresAuth: true, tab: 'guide' }
  },
  {
    path: '/guide/:id',
    name: 'guide-detail',
    component: () => import('@/views/GuideDetailView.vue'),
    meta: { requiresAuth: true, tab: 'guide' }
  },
  {
    path: '/recommend',
    name: 'recommend',
    component: () => import('@/views/RecommendView.vue'),
    meta: { requiresAuth: true, tab: 'recommend' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
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
