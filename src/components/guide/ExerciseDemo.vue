<script setup>
// 동작 시연 — free-exercise-db(퍼블릭 도메인)의 시작/끝 2컷을 번갈아 보여줘
// 움짤처럼 동작을 표현한다. jsdelivr CDN(CORS 허용) → sw.js 캐시-우선으로 오프라인 캐싱.
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  demoId: { type: String, default: '' },
  // 한 줄 캡션(예: 종목명). 비우면 "동작 시연" 배지만 표시
  label: { type: String, default: '' }
})

const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'
const urls = computed(() =>
  props.demoId ? [`${CDN}${props.demoId}/0.jpg`, `${CDN}${props.demoId}/1.jpg`] : []
)

const frame = ref(0)
const failed = ref(false)
let timer = null

onMounted(() => {
  if (urls.value.length) {
    timer = setInterval(() => {
      frame.value = frame.value ? 0 : 1
    }, 1100)
  }
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div
    v-if="urls.length && !failed"
    class="relative w-full overflow-hidden rounded-card bg-surface-2"
    style="aspect-ratio: 3 / 2"
  >
    <img
      v-for="(u, i) in urls"
      :key="u"
      :src="u"
      crossorigin="anonymous"
      alt=""
      loading="lazy"
      class="absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ease-in-out"
      :class="frame === i ? 'opacity-100' : 'opacity-0'"
      @error="failed = true"
    />
    <span
      class="absolute bottom-1.5 right-2 rounded-pill bg-black/55 px-2 py-0.5 text-caption text-white"
    >
      {{ label || '동작 시연' }}
    </span>
  </div>
</template>
