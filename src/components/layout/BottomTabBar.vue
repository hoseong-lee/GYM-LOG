<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// 아이콘은 inline SVG path (24x24, stroke 기반)
const tabs = [
  { name: 'home', to: '/', label: '홈', path: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5' },
  { name: 'log', to: '/log', label: '기록', path: 'M6.5 6.5 9 4l11 11-2.5 2.5zM4 20l3-1-2-2zM14.5 9.5 9.5 14.5' },
  { name: 'diet', to: '/diet', label: '식단', path: 'M7 3v8a3 3 0 0 0 6 0V3M10 11v10M17 3c-1.5 1-2 3-2 6 0 2 1 3 2 3v9' },
  { name: 'body', to: '/body', label: '내몸', path: 'M12 4a2 2 0 1 0 0-.01M9 8h6l-1 6h-1v6h-2v-6H10z' },
  { name: 'more', to: '/more', label: '더보기', path: 'M4 7h16M4 12h16M4 17h16' }
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
