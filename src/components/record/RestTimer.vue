<script setup>
import { ref, onUnmounted, computed } from 'vue'
import { pushToast } from '@/composables/useToast'

const remaining = ref(0)
const running = ref(false)
let timer = null

const label = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

function tick() {
  remaining.value -= 1
  if (remaining.value <= 0) finish()
}
function start(sec = 90) {
  stop()
  remaining.value = sec
  running.value = true
  timer = setInterval(tick, 1000)
}
function adjust(delta) {
  remaining.value = Math.max(5, remaining.value + delta)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = null
  running.value = false
}
function finish() {
  stop()
  remaining.value = 0
  try {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200])
  } catch {}
  pushToast('⏱ 휴식 끝! 다음 세트 가볼까요?', 'info', 4000)
}

onUnmounted(stop)
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 z-40 flex justify-end px-gutter" style="bottom: calc(theme(spacing.tabbar) + env(safe-area-inset-bottom) + 0.75rem)">
    <!-- 실행 중 -->
    <div
      v-if="running"
      class="pointer-events-auto flex items-center gap-2 rounded-pill bg-surface-2 py-2 pl-4 pr-2 shadow-sheet"
    >
      <span class="num text-h2 text-accent">{{ label }}</span>
      <button class="h-9 rounded-pill bg-surface-3 px-2.5 text-sm text-text-secondary active:scale-95" @click="adjust(-15)">−15</button>
      <button class="h-9 rounded-pill bg-surface-3 px-2.5 text-sm text-text-secondary active:scale-95" @click="adjust(15)">+15</button>
      <button class="h-9 rounded-pill bg-danger/20 px-3 text-sm font-medium text-danger active:scale-95" @click="stop">정지</button>
    </div>
    <!-- 대기 (시작 버튼) -->
    <button
      v-else
      class="pointer-events-auto flex h-12 items-center gap-1.5 rounded-pill bg-surface-2 px-4 font-medium text-text-secondary shadow-sheet transition-transform active:scale-95"
      @click="start(90)"
    >
      <span>⏱</span><span class="text-sm">휴식 1:30</span>
    </button>
  </div>
</template>
