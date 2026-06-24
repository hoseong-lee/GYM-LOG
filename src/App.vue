<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { immersive } from '@/composables/useImmersive'
import BottomTabBar from '@/components/layout/BottomTabBar.vue'
import ToastHost from '@/components/common/ToastHost.vue'

const route = useRoute()
const authStore = useAuthStore()

// 운동 흐름(immersive) 중에는 탭바 숨김 — 공간 확보 + 실수 이탈 방지.
const showTabBar = computed(() => route.name !== 'login' && authStore.isAuthed && !immersive.value)

onMounted(() => {
  authStore.ensureReady()
})
</script>

<template>
  <div class="min-h-screen">
    <main :class="showTabBar ? 'pb-[calc(theme(spacing.tabbar)+env(safe-area-inset-bottom)+0.5rem)]' : ''">
      <RouterView />
    </main>
    <BottomTabBar v-if="showTabBar" />
    <ToastHost />
  </div>
</template>
