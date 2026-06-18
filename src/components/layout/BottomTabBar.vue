<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 아이콘은 inline SVG path (24x24, stroke 기반)
const tabs = [
  {
    name: 'home',
    to: '/',
    label: '홈',
    path: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5'
  },
  {
    name: 'log',
    to: '/log',
    label: '기록',
    path: 'M6.5 6.5 9 4l11 11-2.5 2.5zM4 20l3-1-2-2zM14.5 9.5 9.5 14.5'
  },
  {
    name: 'attendance',
    to: '/attendance',
    label: '출석',
    path: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 9h16M8 3v4M16 3v4'
  },
  {
    name: 'guide',
    to: '/guide',
    label: '가이드',
    path: 'M12 6c-1.5-1.2-3.7-2-6-2-1 0-2 .2-2 .2v13s1-.2 2-.2c2.3 0 4.5.8 6 2 1.5-1.2 3.7-2 6-2 1 0 2 .2 2 .2v-13s-1-.2-2-.2c-2.3 0-4.5.8-6 2zM12 6v14'
  },
  {
    name: 'recommend',
    to: '/recommend',
    label: '추천',
    path: 'M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z'
  }
]

function isActive(tab) {
  return route.meta.tab === tab.name
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-50 flex h-tabbar items-stretch border-t border-border-subtle bg-surface-1/95 backdrop-blur safe-bottom"
  >
    <RouterLink
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.to"
      class="flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-tap"
      :class="isActive(tab) ? 'text-accent' : 'text-text-secondary'"
    >
      <svg
        class="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        :stroke="'currentColor'"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path :d="tab.path" />
      </svg>
      <span class="text-[11px] font-medium leading-none">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>
