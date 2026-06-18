<script setup>
import { useToast } from '@/composables/useToast'

const { state, removeToast } = useToast()

const tone = {
  success: 'bg-emerald-600/95 text-white',
  error: 'bg-rose-600/95 text-white',
  info: 'bg-zinc-800/95 text-zinc-100 dark:bg-zinc-700/95'
}
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
    <transition-group name="toast">
      <div
        v-for="t in state.items"
        :key="t.id"
        class="pointer-events-auto w-full max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-lg backdrop-blur whitespace-pre-line"
        :class="tone[t.type] || tone.info"
        @click="removeToast(t.id)"
      >
        {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
