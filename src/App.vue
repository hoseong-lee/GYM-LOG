<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BottomTabBar from '@/components/layout/BottomTabBar.vue'
import ToastHost from '@/components/common/ToastHost.vue'

const route = useRoute()
const authStore = useAuthStore()

const showTabBar = computed(() => route.name !== 'login' && authStore.isAuthed)

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
