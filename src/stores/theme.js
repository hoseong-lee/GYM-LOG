import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'gymlog-theme'
// 'light' | 'dark' — gym-log 는 다크모드 우선. 저장값 없으면 dark 기본.

export const useThemeStore = defineStore('theme', () => {
  const setting = ref(loadInitial())

  const isDark = computed(() => setting.value === 'dark')

  function loadInitial() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'light') return 'light'
      if (saved === 'dark') return 'dark'
    } catch {}
    return 'dark' // 기본 다크
  }

  function setTheme(value) {
    setting.value = value === 'light' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, setting.value)
    } catch {}
    apply()
  }

  function toggle() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  function apply() {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (isDark.value) root.classList.add('dark')
    else root.classList.remove('dark')
  }

  apply()
  watch(isDark, apply)

  return { setting, isDark, setTheme, toggle }
})
