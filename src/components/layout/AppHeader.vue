<script setup>
defineProps({
  title: { type: String, default: '' },
  back: { type: Boolean, default: false }
})
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <header
    class="sticky top-0 z-40 flex items-center gap-2 border-b border-border-subtle bg-bg/90 px-gutter backdrop-blur"
    style="padding-top: env(safe-area-inset-top)"
  >
    <div class="flex h-14 w-full items-center gap-2">
      <button
        v-if="back"
        class="-ml-2 flex h-tap w-tap items-center justify-center rounded-pill text-text-secondary active:bg-surface-2"
        aria-label="뒤로"
        @click="router.back()"
      >
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="text-h1 text-text-primary">{{ title }}</h1>
      <div class="ml-auto flex items-center gap-1">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
