import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  loginWithGoogle,
  signOut as fbSignOut,
  watchAuth,
  verifyAllowed,
  NotAllowedError
} from '@/firebase/auth'
import { getUserProfile } from '@/firebase/database'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null) // users/{uid}/profile (split 등)
  const ready = ref(false)
  const error = ref('')

  const isAuthed = computed(() => !!user.value)
  const split = computed(() => profile.value?.split || null)

  let readyPromise = null

  async function loadProfile(uid) {
    try {
      profile.value = await getUserProfile(uid)
    } catch (e) {
      console.warn('profile load failed', e)
      profile.value = null
    }
  }

  function ensureReady() {
    if (readyPromise) return readyPromise
    readyPromise = new Promise((resolve) => {
      watchAuth(async (fbUser) => {
        if (fbUser) {
          const allowed = await verifyAllowed(fbUser)
          if (allowed) {
            user.value = fbUser
            await loadProfile(fbUser.uid)
          } else {
            await fbSignOut()
            user.value = null
            profile.value = null
          }
        } else {
          user.value = null
          profile.value = null
        }
        ready.value = true
        resolve()
      })
    })
    return readyPromise
  }

  async function login() {
    error.value = ''
    try {
      const res = await loginWithGoogle()
      if (!res) return false // redirect 폴백 — 페이지 전환됨
      user.value = res.user
      await loadProfile(res.user.uid)
      return true
    } catch (e) {
      console.error('login error', e)
      if (e instanceof NotAllowedError) {
        error.value = e.message
      } else if (e?.code === 'auth/popup-closed-by-user') {
        error.value = ''
      } else {
        const detail = e?.code || e?.message || String(e)
        error.value = `로그인 중 오류가 발생했습니다: ${detail}`
      }
      return false
    }
  }

  async function logout() {
    await fbSignOut()
    user.value = null
    profile.value = null
  }

  function setProfileSplit(value) {
    profile.value = { ...(profile.value || {}), split: value }
  }

  return {
    user,
    profile,
    ready,
    error,
    isAuthed,
    split,
    ensureReady,
    login,
    logout,
    loadProfile,
    setProfileSplit
  }
})
