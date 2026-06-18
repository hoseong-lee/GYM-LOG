<script setup>
// 풀스크린 휴식 카운트다운 오버레이.
// performance.now() 기준 endAt 으로 드리프트/백그라운드 스로틀링 보정.
// 종료/스킵 시 done/skip emit. ±15초 조정, 진동, Wake Lock(best-effort).
import { ref, computed, watch, onUnmounted } from 'vue'
import { formatRest } from '@/utils/rest'

const props = defineProps({
  modelValue: { type: Boolean, default: false }, // 표시 여부
  seconds: { type: Number, default: 90 }, // 시작 휴식 길이(초)
  nextLabel: { type: String, default: '' }, // 다음 세트 프리뷰 텍스트
  isLastSet: { type: Boolean, default: false } // 종목 마지막 세트 후인가
})
const emit = defineEmits(['done', 'skip', 'update:modelValue'])

const total = ref(props.seconds) // 현재 목표 총길이(±15 반영)
const remaining = ref(props.seconds)
let endAt = 0 // performance.now() 기준 종료 시각(ms)
let raf = null
let finished = false
let wakeLock = null

const label = computed(() => formatRest(remaining.value))
// 원형 진행링: 둘레 대비 남은 비율
const R = 52
const CIRC = 2 * Math.PI * R
const dashOffset = computed(() => {
  const ratio = total.value > 0 ? Math.max(0, Math.min(1, remaining.value / total.value)) : 0
  return CIRC * (1 - ratio)
})

function now() {
  return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
}

function loop() {
  const left = Math.max(0, Math.ceil((endAt - now()) / 1000))
  remaining.value = left
  if (left <= 0) {
    onFinish()
    return
  }
  raf = requestAnimationFrame(loop)
}

function startTimer(sec) {
  stopLoop()
  finished = false
  total.value = sec
  remaining.value = sec
  endAt = now() + sec * 1000
  acquireWake()
  raf = requestAnimationFrame(loop)
}

function stopLoop() {
  if (raf) cancelAnimationFrame(raf)
  raf = null
}

function adjust(delta) {
  if (finished) return
  // 남은 시간과 총길이를 함께 보정 (링 비율 유지)
  const newRemaining = Math.max(5, remaining.value + delta)
  total.value = Math.max(total.value + delta, newRemaining)
  remaining.value = newRemaining
  endAt = now() + newRemaining * 1000
}

function vibrate(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern)
  } catch {
    /* noop */
  }
}

function onFinish() {
  if (finished) return
  finished = true
  stopLoop()
  remaining.value = 0
  releaseWake()
  vibrate([200, 100, 200])
  emit('done')
}

function onSkip() {
  if (finished) return
  finished = true
  stopLoop()
  releaseWake()
  vibrate(40)
  emit('skip')
}

// ── Wake Lock (best-effort) ──
async function acquireWake() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen')
    }
  } catch {
    wakeLock = null
  }
}
function releaseWake() {
  try {
    wakeLock?.release?.()
  } catch {
    /* noop */
  }
  wakeLock = null
}

// 백그라운드 복귀 시 남은시간 재계산 + wake lock 재획득
function onVisibility() {
  if (document.visibilityState === 'visible' && props.modelValue && !finished) {
    const left = Math.max(0, Math.ceil((endAt - now()) / 1000))
    remaining.value = left
    if (left <= 0) onFinish()
    else acquireWake()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      document.addEventListener('visibilitychange', onVisibility)
      startTimer(props.seconds)
    } else {
      stopLoop()
      releaseWake()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }
)

onUnmounted(() => {
  stopLoop()
  releaseWake()
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-bg/95 px-gutter safe-x">
      <p class="text-h2 font-semibold text-text-secondary">휴식 중</p>

      <div class="relative my-8 flex h-[180px] w-[180px] items-center justify-center">
        <svg class="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" :r="R" fill="none" stroke="rgb(var(--surface-3))" stroke-width="8" />
          <circle
            cx="60"
            cy="60"
            :r="R"
            fill="none"
            stroke="rgb(var(--accent))"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="CIRC"
            :stroke-dashoffset="dashOffset"
            style="transition: stroke-dashoffset 0.25s linear"
          />
        </svg>
        <span class="num text-[44px] font-bold leading-none text-text-primary">{{ label }}</span>
      </div>

      <p v-if="nextLabel" class="mb-8 text-center text-text-secondary">
        <span class="text-text-muted">{{ isLastSet ? '휴식 후' : '다음' }}: </span>{{ nextLabel }}
      </p>

      <div class="flex w-full max-w-xs items-center gap-3">
        <button
          class="h-tap-edge flex-1 rounded-field bg-surface-2 text-text-secondary transition-transform duration-tap active:scale-95"
          @click="adjust(-15)"
        >
          −15초
        </button>
        <button
          class="h-tap-edge flex-1 rounded-field bg-surface-2 text-text-secondary transition-transform duration-tap active:scale-95"
          @click="adjust(15)"
        >
          +15초
        </button>
      </div>

      <button
        class="mt-4 w-full max-w-xs rounded-field bg-accent py-4 font-semibold text-accent-text transition-transform duration-tap active:scale-[0.99]"
        @click="onSkip"
      >
        건너뛰기 ▶
      </button>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
